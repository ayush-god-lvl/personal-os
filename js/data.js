/* ============================================
   PERSONAL OS — Data Layer (localStorage + Firestore)
   ============================================ */

const Data = {
    _cloudKeys: ['phases', 'habits', 'academics', 'skillLogs', 'timeLogs', 'settings', 'tasks', 'initialized'],
    _syncTimer: null,

    get(key) {
        try {
            const raw = localStorage.getItem('pos_' + key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    set(key, value) {
        localStorage.setItem('pos_' + key, JSON.stringify(value));
        // Debounced cloud sync
        this._queueCloudSync(key, value);
    },

    remove(key) {
        localStorage.removeItem('pos_' + key);
        this._cloudDelete(key);
    },

    // --- Cloud Sync (Firestore) ---
    _queueCloudSync(key, value) {
        if (!Auth || !Auth.isSignedIn()) return;
        // Debounce: wait 1s after last write before syncing
        clearTimeout(this._syncTimer);
        this._syncTimer = setTimeout(() => {
            this._cloudSet(key, value);
        }, 1000);
    },

    async _cloudSet(key, value) {
        if (!Auth || !Auth.isSignedIn()) return;
        try {
            const uid = Auth.getUID();
            await FirebaseDB.collection('users').doc(uid).collection('data').doc(key).set({
                value: JSON.stringify(value),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (err) {
            console.warn('Cloud sync failed for', key, err);
        }
    },

    async _cloudGet(key) {
        if (!Auth || !Auth.isSignedIn()) return null;
        try {
            const uid = Auth.getUID();
            const doc = await FirebaseDB.collection('users').doc(uid).collection('data').doc(key).get();
            if (doc.exists) {
                return JSON.parse(doc.data().value);
            }
        } catch (err) {
            console.warn('Cloud read failed for', key, err);
        }
        return null;
    },

    async _cloudDelete(key) {
        if (!Auth || !Auth.isSignedIn()) return;
        try {
            const uid = Auth.getUID();
            await FirebaseDB.collection('users').doc(uid).collection('data').doc(key).delete();
        } catch (err) {
            console.warn('Cloud delete failed for', key, err);
        }
    },

    // Load all data from Firestore → localStorage
    async loadFromCloud() {
        if (!Auth || !Auth.isSignedIn()) return;
        try {
            const uid = Auth.getUID();
            const snapshot = await FirebaseDB.collection('users').doc(uid).collection('data').get();

            if (snapshot.empty) {
                // No cloud data — push local data to cloud (first-time sync)
                Toast.show('First sync — uploading local data to cloud...', 'info');
                await this.syncToCloud();
                return;
            }

            // Cloud data exists — overwrite local
            snapshot.forEach(doc => {
                try {
                    const value = JSON.parse(doc.data().value);
                    localStorage.setItem('pos_' + doc.id, JSON.stringify(value));
                } catch (e) {
                    console.warn('Failed to parse cloud data for', doc.id, e);
                }
            });
            Toast.show('Data loaded from cloud ☁', 'success');
        } catch (err) {
            console.error('Cloud load failed:', err);
            Toast.show('Cloud sync failed — using local data', 'warning');
        }
    },

    // Push all local data → Firestore
    async syncToCloud() {
        if (!Auth || !Auth.isSignedIn()) return;
        try {
            const uid = Auth.getUID();
            const batch = FirebaseDB.batch();

            this._cloudKeys.forEach(key => {
                const value = this.get(key);
                if (value !== null) {
                    const ref = FirebaseDB.collection('users').doc(uid).collection('data').doc(key);
                    batch.set(ref, {
                        value: JSON.stringify(value),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            });

            await batch.commit();
            Toast.show('All data synced to cloud ☁', 'success');
        } catch (err) {
            console.error('Cloud sync failed:', err);
            Toast.show('Sync failed: ' + err.message, 'error');
        }
    },

    // --- Collection Helpers ---
    getCollection(name) {
        return this.get(name) || [];
    },

    addToCollection(name, item) {
        const col = this.getCollection(name);
        col.push(item);
        this.set(name, col);
        return col;
    },

    updateInCollection(name, id, updates) {
        const col = this.getCollection(name);
        const idx = col.findIndex(x => x.id === id);
        if (idx !== -1) {
            col[idx] = { ...col[idx], ...updates };
            this.set(name, col);
        }
        return col;
    },

    removeFromCollection(name, id) {
        const col = this.getCollection(name).filter(x => x.id !== id);
        this.set(name, col);
        return col;
    },

    findInCollection(name, id) {
        return this.getCollection(name).find(x => x.id === id) || null;
    },

    // --- Settings ---
    getSettings() {
        return this.get('settings') || {
            wakingHours: 16,
            dailyTimeTarget: 10,
            scoringWeights: {
                habits: 40,
                deepWork: 25,
                training: 20,
                noDistraction: 15
            },
            burnoutThreshold: 40,
            burnoutDays: 3,
            overloadLimit: 14
        };
    },

    saveSettings(settings) {
        this.set('settings', settings);
    },

    // --- Initialize Defaults ---
    initDefaults() {
        if (this.get('initialized')) return;

        // Default phases
        this.set('phases', [
            {
                id: Utils.uid(),
                name: 'Foundation',
                startDate: '2026-03-01',
                endDate: '2026-04-30',
                objectives: [
                    'Fix sleep cycle',
                    'Complete 2 mini coding projects',
                    'Finish Class 9 Math fundamentals',
                    'Upload 5 practice videos'
                ],
                successMetrics: 'All objectives completed with consistency > 70%',
                skillTargets: 'Pushups: 30, Run 1km < 6min, 2 GitHub repos'
            }
        ]);

        // Default habits
        this.set('habits', [
            { id: Utils.uid(), name: 'Morning Workout', category: 'health', frequency: 'daily', minRequirement: '30 min exercise', completions: [] },
            { id: Utils.uid(), name: 'Coding Practice', category: 'coding', frequency: 'daily', minRequirement: '2 hours focused coding', completions: [] },
            { id: Utils.uid(), name: 'Acting Practice', category: 'acting', frequency: 'daily', minRequirement: '1 practice session', completions: [] },
            { id: Utils.uid(), name: 'Study Session', category: 'academics', frequency: 'daily', minRequirement: '2 hours study', completions: [] },
            { id: Utils.uid(), name: 'No Social Media', category: 'discipline', frequency: 'daily', minRequirement: 'Zero scrolling', completions: [] },
            { id: Utils.uid(), name: 'Sleep by 10:30 PM', category: 'discipline', frequency: 'daily', minRequirement: 'In bed by 10:30', completions: [] },
            { id: Utils.uid(), name: 'Read 20 pages', category: 'academics', frequency: 'daily', minRequirement: '20 pages minimum', completions: [] },
        ]);

        // Default academics
        this.set('academics', [
            {
                id: Utils.uid(),
                subject: 'Mathematics',
                chapters: [
                    { name: 'Number Systems', completed: false, difficulty: 3, testScore: null, revisionCount: 0 },
                    { name: 'Polynomials', completed: false, difficulty: 4, testScore: null, revisionCount: 0 },
                    { name: 'Coordinate Geometry', completed: false, difficulty: 3, testScore: null, revisionCount: 0 },
                    { name: 'Linear Equations', completed: false, difficulty: 4, testScore: null, revisionCount: 0 },
                    { name: 'Triangles', completed: false, difficulty: 3, testScore: null, revisionCount: 0 },
                ],
                weakTopics: []
            },
            {
                id: Utils.uid(),
                subject: 'Science',
                chapters: [
                    { name: 'Matter in Our Surroundings', completed: false, difficulty: 2, testScore: null, revisionCount: 0 },
                    { name: 'Is Matter Around Us Pure', completed: false, difficulty: 3, testScore: null, revisionCount: 0 },
                    { name: 'Atoms and Molecules', completed: false, difficulty: 4, testScore: null, revisionCount: 0 },
                    { name: 'Motion', completed: false, difficulty: 4, testScore: null, revisionCount: 0 },
                    { name: 'Force and Laws of Motion', completed: false, difficulty: 5, testScore: null, revisionCount: 0 },
                ],
                weakTopics: []
            },
            {
                id: Utils.uid(),
                subject: 'English',
                chapters: [
                    { name: 'The Fun They Had', completed: false, difficulty: 2, testScore: null, revisionCount: 0 },
                    { name: 'The Sound of Music', completed: false, difficulty: 2, testScore: null, revisionCount: 0 },
                    { name: 'Grammar - Tenses', completed: false, difficulty: 3, testScore: null, revisionCount: 0 },
                    { name: 'Writing - Letter Format', completed: false, difficulty: 3, testScore: null, revisionCount: 0 },
                ],
                weakTopics: []
            },
            {
                id: Utils.uid(),
                subject: 'Social Science',
                chapters: [
                    { name: 'The French Revolution', completed: false, difficulty: 3, testScore: null, revisionCount: 0 },
                    { name: 'India - Size and Location', completed: false, difficulty: 2, testScore: null, revisionCount: 0 },
                    { name: 'The Story of Village Palampur', completed: false, difficulty: 3, testScore: null, revisionCount: 0 },
                    { name: 'Democracy', completed: false, difficulty: 3, testScore: null, revisionCount: 0 },
                ],
                weakTopics: []
            }
        ]);

        // Default skill logs
        this.set('skillLogs', []);

        // Default time logs
        this.set('timeLogs', []);

        // Default settings
        this.saveSettings(this.getSettings());

        this.set('initialized', true);
    },

    // --- Export ---
    exportAll() {
        const keys = ['phases', 'habits', 'academics', 'skillLogs', 'timeLogs', 'settings'];
        const data = {};
        keys.forEach(k => { data[k] = this.get(k); });
        return data;
    },

    importAll(jsonData) {
        Object.keys(jsonData).forEach(k => {
            this.set(k, jsonData[k]);
        });
    },

    exportCSV(collection) {
        const data = this.getCollection(collection);
        if (data.length === 0) return '';
        const headers = Object.keys(data[0]);
        const rows = data.map(row =>
            headers.map(h => {
                const val = row[h];
                if (Array.isArray(val)) return '"' + val.join('; ') + '"';
                if (typeof val === 'object') return '"' + JSON.stringify(val) + '"';
                return '"' + String(val) + '"';
            }).join(',')
        );
        return [headers.join(','), ...rows].join('\n');
    },

    clearAll() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('pos_'));
        keys.forEach(k => localStorage.removeItem(k));
    }
};
