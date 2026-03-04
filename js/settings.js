/* ============================================
   PERSONAL OS — Settings Module
   ============================================ */

const SettingsPage = {
    render() {
        const settings = Data.getSettings();

        let html = `
            <div class="page-header"><h1>Settings</h1><p>Configure system parameters, manage data, and export.</p></div>

            <div class="card">
                <div class="card-header"><span class="card-title">General Settings</span></div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Waking Hours / Day</label>
                        <input class="form-input" type="number" id="setWaking" value="${settings.wakingHours}" min="8" max="20"></div>
                    <div class="form-group"><label class="form-label">Daily Time Target (hrs)</label>
                        <input class="form-input" type="number" id="setTarget" value="${settings.dailyTimeTarget}" min="1" max="16"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Overload Limit (hrs/day)</label>
                        <input class="form-input" type="number" id="setOverload" value="${settings.overloadLimit}" min="8" max="20"></div>
                    <div class="form-group"><label class="form-label">Burnout Threshold (score)</label>
                        <input class="form-input" type="number" id="setBurnout" value="${settings.burnoutThreshold}" min="10" max="80"></div>
                </div>
                <button class="btn btn-primary mt-20" onclick="SettingsPage.saveGeneral()">Save Settings</button>
            </div>

            <div class="card">
                <div class="card-header"><span class="card-title">Scoring Weights</span></div>
                <p class="text-muted mb-20" style="font-size:12px;">Must total 100%. Controls how discipline score is calculated.</p>
                <div class="grid-4">
                    <div class="form-group"><label class="form-label">Habits (%)</label>
                        <input class="form-input" type="number" id="wHabits" value="${settings.scoringWeights.habits}"></div>
                    <div class="form-group"><label class="form-label">Deep Work (%)</label>
                        <input class="form-input" type="number" id="wDeep" value="${settings.scoringWeights.deepWork}"></div>
                    <div class="form-group"><label class="form-label">Training (%)</label>
                        <input class="form-input" type="number" id="wTrain" value="${settings.scoringWeights.training}"></div>
                    <div class="form-group"><label class="form-label">No Distraction (%)</label>
                        <input class="form-input" type="number" id="wNoDist" value="${settings.scoringWeights.noDistraction}"></div>
                </div>
                <button class="btn btn-primary mt-10" onclick="SettingsPage.saveWeights()">Save Weights</button>
            </div>

            <div class="card">
                <div class="card-header"><span class="card-title">Data Management</span></div>
                <div class="flex-gap" style="flex-wrap:wrap;gap:12px;">
                    <button class="btn btn-secondary" onclick="SettingsPage.exportJSON()">📦 Backup JSON</button>
                    <button class="btn btn-secondary" onclick="SettingsPage.importJSON()">📥 Restore JSON</button>
                    <button class="btn btn-secondary" onclick="SettingsPage.exportCSV('habits')">📊 Export Habits CSV</button>
                    <button class="btn btn-secondary" onclick="SettingsPage.exportCSV('timeLogs')">📊 Export Time CSV</button>
                    <button class="btn btn-secondary" onclick="SettingsPage.exportCSV('skillLogs')">📊 Export Skills CSV</button>
                    <button class="btn btn-danger" onclick="SettingsPage.clearAll()">🗑 Clear All Data</button>
                </div>
                <input type="file" id="importFile" accept=".json" style="display:none;" onchange="SettingsPage.handleImport(event)">
            </div>

            <div class="card">
                <div class="card-header"><span class="card-title">Cloud Sync</span></div>
                ${Auth.isSignedIn() ? `
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                        <span class="sync-status synced">☁ Cloud Synced</span>
                        <span style="font-size:12px;color:var(--text-secondary);">Signed in as <strong>${Auth.getUser().displayName}</strong></span>
                    </div>
                    <div class="flex-gap" style="gap:12px;">
                        <button class="btn btn-primary" onclick="SettingsPage.forceSync()">⟳ Force Sync to Cloud</button>
                        <button class="btn btn-secondary" onclick="SettingsPage.pullFromCloud()">⬇ Pull from Cloud</button>
                        <button class="btn btn-danger" onclick="Auth.signOut()">Sign Out</button>
                    </div>
                ` : `
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                        <span class="sync-status local">⚠ Local Only</span>
                        <span style="font-size:12px;color:var(--text-secondary);">Sign in to sync data across devices</span>
                    </div>
                    <button class="btn btn-primary" onclick="Auth.signIn()">
                        <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                        Sign in with Google
                    </button>
                `}
            </div>

            <div class="card">
                <div class="card-header"><span class="card-title">System Info</span></div>
                <table class="data-table">
                    <tr><td>Version</td><td><strong>1.0.0</strong></td></tr>
                    <tr><td>Storage Mode</td><td>${Auth.isSignedIn() ? '<span style="color:var(--green);">☁ Cloud + Local</span>' : '<span style="color:var(--yellow);">⚠ Local Only</span>'}</td></tr>
                    <tr><td>Habits</td><td>${Data.getCollection('habits').length}</td></tr>
                    <tr><td>Phases</td><td>${Data.getCollection('phases').length}</td></tr>
                    <tr><td>Time Logs</td><td>${Data.getCollection('timeLogs').length}</td></tr>
                    <tr><td>Skill Logs</td><td>${Data.getCollection('skillLogs').length}</td></tr>
                    <tr><td>Storage Used</td><td>${this._storageSize()}</td></tr>
                </table>
            </div>
        `;

        document.getElementById('content').innerHTML = html;
    },

    saveGeneral() {
        const settings = Data.getSettings();
        settings.wakingHours = parseInt(document.getElementById('setWaking').value) || 16;
        settings.dailyTimeTarget = parseInt(document.getElementById('setTarget').value) || 10;
        settings.overloadLimit = parseInt(document.getElementById('setOverload').value) || 14;
        settings.burnoutThreshold = parseInt(document.getElementById('setBurnout').value) || 40;
        Data.saveSettings(settings);
        Toast.show('Settings saved.', 'success');
    },

    saveWeights() {
        const h = parseInt(document.getElementById('wHabits').value) || 0;
        const d = parseInt(document.getElementById('wDeep').value) || 0;
        const t = parseInt(document.getElementById('wTrain').value) || 0;
        const n = parseInt(document.getElementById('wNoDist').value) || 0;
        if (h + d + t + n !== 100) return Toast.show('Weights must total 100%.', 'warning');
        const settings = Data.getSettings();
        settings.scoringWeights = { habits: h, deepWork: d, training: t, noDistraction: n };
        Data.saveSettings(settings);
        Toast.show('Weights saved.', 'success');
    },

    exportJSON() {
        const data = Data.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `personal-os-backup-${Utils.today()}.json`;
        a.click(); URL.revokeObjectURL(url);
    },

    importJSON() {
        document.getElementById('importFile').click();
    },

    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (confirm('This will overwrite current data. Continue?')) {
                    Data.importAll(data);
                    Toast.show('Data restored successfully.', 'success');
                    this.render();
                }
            } catch { Toast.show('Invalid JSON file.', 'error'); }
        };
        reader.readAsText(file);
    },

    exportCSV(collection) {
        const csv = Data.exportCSV(collection);
        if (!csv) return Toast.show('No data to export.', 'warning');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `${collection}-${Utils.today()}.csv`;
        a.click(); URL.revokeObjectURL(url);
    },

    clearAll() {
        if (confirm('⚠ This will DELETE ALL DATA. Are you absolutely sure?')) {
            if (confirm('Last chance. This cannot be undone.')) {
                Data.clearAll();
                location.reload();
            }
        }
    },

    async forceSync() {
        if (!Auth.isSignedIn()) return Toast.show('Sign in first to sync.', 'warning');
        await Data.syncToCloud();
        this.render();
    },

    async pullFromCloud() {
        if (!Auth.isSignedIn()) return Toast.show('Sign in first to pull data.', 'warning');
        if (confirm('This will overwrite local data with cloud data. Continue?')) {
            await Data.loadFromCloud();
            this.render();
            App.navigate(App.getCurrentPage());
        }
    },

    _storageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (key.startsWith('pos_')) total += localStorage[key].length * 2;
        }
        if (total < 1024) return total + ' B';
        if (total < 1048576) return (total / 1024).toFixed(1) + ' KB';
        return (total / 1048576).toFixed(1) + ' MB';
    }
};
