/* ============================================
   PERSONAL OS — Skill Tracking Module
   ============================================ */

const SkillsPage = {
    activeTab: 'health',

    render() {
        const skillLogs = Data.getCollection('skillLogs');
        const tabs = [
            { id: 'health', label: 'Health' },
            { id: 'programming', label: 'Programming' },
            { id: 'acting', label: 'Acting' },
            { id: 'academic', label: 'Academic' },
        ];

        let html = `
            <div class="page-header flex-between">
                <div><h1>Skill Metrics</h1><p>Track quantitative progress across all domains.</p></div>
                <button class="btn btn-primary" onclick="SkillsPage.showLogForm()">+ Log Entry</button>
            </div>
            <div class="tabs">
                ${tabs.map(t => `<button class="tab ${this.activeTab === t.id ? 'active' : ''}" onclick="SkillsPage.setTab('${t.id}')">${t.label}</button>`).join('')}
            </div>
        `;

        const metrics = this._getMetrics(this.activeTab);
        const logs = skillLogs.filter(l => l.category === this.activeTab).sort((a, b) => b.date.localeCompare(a.date));

        // Current values
        html += `<div class="grid-${Math.min(metrics.length, 4)} mb-20">`;
        metrics.forEach(m => {
            const entry = logs.find(l => l.metric === m.key);
            const val = entry ? entry.value : '—';
            html += `<div class="stat-block"><div class="stat-label">${m.label}</div><div class="stat-value">${val}</div></div>`;
        });
        html += `</div>`;

        // Chart
        html += `<div class="card"><div class="card-header"><span class="card-title">Progress Over Time</span></div>
            <div class="chart-container" style="max-height:280px;"><canvas id="skillChart"></canvas></div></div>`;

        // Log table
        html += `<div class="card"><div class="card-header"><span class="card-title">Log History</span></div>`;
        if (logs.length === 0) {
            html += `<div class="empty-state"><p>No entries yet.</p></div>`;
        } else {
            html += `<table class="data-table"><thead><tr><th>Date</th><th>Metric</th><th>Value</th><th></th></tr></thead><tbody>`;
            logs.slice(0, 20).forEach(l => {
                const mLabel = metrics.find(m => m.key === l.metric);
                html += `<tr><td>${Utils.formatDate(l.date)}</td><td>${mLabel ? mLabel.label : l.metric}</td><td><strong>${l.value}</strong></td>
                    <td><button class="btn btn-danger btn-sm" onclick="SkillsPage.deleteLog('${l.id}')">×</button></td></tr>`;
            });
            html += `</tbody></table>`;
        }
        html += `</div>`;

        document.getElementById('content').innerHTML = html;
        this._renderCharts(logs, metrics);
    },

    setTab(tab) { this.activeTab = tab; this.render(); },

    _getMetrics(tab) {
        const map = {
            health: [
                { key: 'weight', label: 'Weight (kg)' }, { key: 'pushups', label: 'Push-ups Max' },
                { key: 'pullups', label: 'Pull-ups Max' }, { key: 'run1km', label: '1km Run (min)' },
                { key: 'waist', label: 'Waist (cm)' }
            ],
            programming: [
                { key: 'projects', label: 'Projects Done' }, { key: 'codingHours', label: 'Hours Logged' },
                { key: 'commits', label: 'GitHub Commits' }, { key: 'engineLevel', label: 'Engine Level (/10)' }
            ],
            acting: [
                { key: 'videosUploaded', label: 'Videos Uploaded' }, { key: 'practiceDays', label: 'Practice Days' },
                { key: 'voiceControl', label: 'Voice Control (/10)' }, { key: 'retention', label: 'Retention (%)' }
            ],
            academic: [
                { key: 'chaptersCompleted', label: 'Chapters Done' }, { key: 'mockScore', label: 'Mock Score (%)' },
                { key: 'weakTopics', label: 'Weak Topics' }, { key: 'revisionCycles', label: 'Revision Cycles' }
            ]
        };
        return map[tab] || [];
    },

    _renderCharts(logs, metrics) {
        const ctx = document.getElementById('skillChart');
        if (!ctx || logs.length === 0) return;
        const colors = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#a855f7'];
        const datasets = [];
        metrics.forEach((m, i) => {
            const entries = logs.filter(l => l.metric === m.key).sort((a, b) => a.date.localeCompare(b.date));
            if (entries.length === 0) return;
            datasets.push({
                label: m.label, data: entries.map(e => ({ x: e.date, y: e.value })),
                borderColor: colors[i % colors.length], backgroundColor: 'transparent', tension: 0.3, pointRadius: 3,
            });
        });
        if (datasets.length === 0) return;
        new Chart(ctx, {
            type: 'line', data: { datasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#8b8b9e', font: { size: 10 } } } },
                scales: {
                    x: { type: 'category', ticks: { color: '#55556a', font: { size: 10 } }, grid: { display: false } },
                    y: { ticks: { color: '#55556a', font: { size: 10 } }, grid: { color: '#1e1e2e' } }
                }
            }
        });
    },

    showLogForm() {
        const metrics = this._getMetrics(this.activeTab);
        const o = document.createElement('div'); o.className = 'modal-overlay'; o.id = 'skillModal';
        o.innerHTML = `<div class="modal"><div class="modal-title">Log Skill Entry</div>
            <div class="form-row"><div class="form-group"><label class="form-label">Date</label>
                <input class="form-input" type="date" id="skillDate" value="${Utils.today()}"></div>
            <div class="form-group"><label class="form-label">Category</label>
                <select class="form-select" id="skillCat" onchange="SkillsPage.updateOpts()">
                ${['health', 'programming', 'acting', 'academic'].map(c => `<option value="${c}" ${this.activeTab === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Metric</label>
                <select class="form-select" id="skillMetric">${metrics.map(m => `<option value="${m.key}">${m.label}</option>`).join('')}</select></div>
            <div class="form-group"><label class="form-label">Value</label>
                <input class="form-input" type="number" id="skillValue" step="any" placeholder="Value"></div></div>
            <div class="modal-actions"><button class="btn btn-secondary" onclick="document.getElementById('skillModal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="SkillsPage.saveLog()">Log</button></div></div>`;
        document.body.appendChild(o);
        o.addEventListener('click', e => { if (e.target === o) o.remove(); });
    },

    updateOpts() {
        const m = this._getMetrics(document.getElementById('skillCat').value);
        document.getElementById('skillMetric').innerHTML = m.map(x => `<option value="${x.key}">${x.label}</option>`).join('');
    },

    saveLog() {
        const date = document.getElementById('skillDate').value;
        const category = document.getElementById('skillCat').value;
        const metric = document.getElementById('skillMetric').value;
        const value = parseFloat(document.getElementById('skillValue').value);
        if (!date || isNaN(value)) return alert('Date and value required.');
        Data.addToCollection('skillLogs', { id: Utils.uid(), date, category, metric, value });
        document.getElementById('skillModal').remove();
        this.activeTab = category; this.render();
    },

    deleteLog(id) { if (confirm('Delete?')) { Data.removeFromCollection('skillLogs', id); this.render(); } }
};
