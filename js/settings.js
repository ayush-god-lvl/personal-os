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
                <div class="card-header"><span class="card-title">System Info</span></div>
                <table class="data-table">
                    <tr><td>Version</td><td><strong>1.0.0</strong></td></tr>
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
        alert('Settings saved.');
    },

    saveWeights() {
        const h = parseInt(document.getElementById('wHabits').value) || 0;
        const d = parseInt(document.getElementById('wDeep').value) || 0;
        const t = parseInt(document.getElementById('wTrain').value) || 0;
        const n = parseInt(document.getElementById('wNoDist').value) || 0;
        if (h + d + t + n !== 100) return alert('Weights must total 100%.');
        const settings = Data.getSettings();
        settings.scoringWeights = { habits: h, deepWork: d, training: t, noDistraction: n };
        Data.saveSettings(settings);
        alert('Weights saved.');
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
                    alert('Data restored successfully.');
                    this.render();
                }
            } catch { alert('Invalid JSON file.'); }
        };
        reader.readAsText(file);
    },

    exportCSV(collection) {
        const csv = Data.exportCSV(collection);
        if (!csv) return alert('No data to export.');
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
