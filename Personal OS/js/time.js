/* ============================================
   PERSONAL OS — Time Tracking System
   ============================================ */

const TimePage = {
    render() {
        const timeLogs = Data.getCollection('timeLogs');
        const settings = Data.getSettings();
        const today = Utils.today();
        const weekDays = Utils.lastNDays(7);

        const todayLogs = timeLogs.filter(l => l.date === today);
        const totalMin = todayLogs.reduce((s, l) => s + l.duration, 0);
        const productiveMin = todayLogs.filter(l => l.category !== 'distraction').reduce((s, l) => s + l.duration, 0);
        const efficiency = Utils.percentage(productiveMin, settings.wakingHours * 60);

        // Overload detection
        const overload = totalMin > settings.overloadLimit * 60;

        let html = `
            <div class="page-header flex-between">
                <div><h1>Time Tracking</h1><p>Log time entries and monitor efficiency.</p></div>
                <button class="btn btn-primary" onclick="TimePage.showLogForm()">+ Log Time</button>
            </div>
        `;

        if (overload) {
            html += `<div class="warning-banner">⚠ OVERLOAD: Today exceeds ${settings.overloadLimit}h limit. Risk of burnout.</div>`;
        }

        // Today stats
        const categories = ['study', 'coding', 'acting', 'training', 'distraction'];
        html += `<div class="grid-4 mb-20">
            <div class="stat-block"><div class="stat-label">Logged Today</div><div class="stat-value">${Utils.hoursDisplay(totalMin)}</div></div>
            <div class="stat-block"><div class="stat-label">Productive</div><div class="stat-value text-green">${Utils.hoursDisplay(productiveMin)}</div></div>
            <div class="stat-block"><div class="stat-label">Efficiency</div>
                <div class="stat-value ${Utils.scoreColorClass(efficiency)}">${efficiency}%</div>
                <div class="stat-sub">productive / ${settings.wakingHours}h waking</div></div>
            <div class="stat-block"><div class="stat-label">Target</div><div class="stat-value">${settings.dailyTimeTarget}h</div>
                <div class="progress-bar"><div class="progress-fill ${Utils.progressClass(Utils.percentage(productiveMin, settings.dailyTimeTarget * 60))}" style="width:${Math.min(100, Utils.percentage(productiveMin, settings.dailyTimeTarget * 60))}%"></div></div></div>
        </div>`;

        // Weekly chart + pie
        html += `<div class="grid-2 mb-20">
            <div class="card"><div class="card-header"><span class="card-title">Weekly Distribution</span></div>
                <div class="chart-container" style="max-height:250px;"><canvas id="timePie"></canvas></div></div>
            <div class="card"><div class="card-header"><span class="card-title">Daily Breakdown</span></div>
                <div class="chart-container" style="max-height:250px;"><canvas id="timeBar"></canvas></div></div>
        </div>`;

        // Today's log table
        html += `<div class="card"><div class="card-header"><span class="card-title">Today's Entries</span></div>`;
        if (todayLogs.length === 0) {
            html += `<div class="empty-state"><p>No time logged today.</p></div>`;
        } else {
            html += `<table class="data-table"><thead><tr><th>Category</th><th>Duration</th><th>Note</th><th></th></tr></thead><tbody>`;
            todayLogs.forEach(l => {
                html += `<tr><td><span class="tag tag-${l.category}">${l.category}</span></td><td>${Utils.hoursDisplay(l.duration)}</td>
                    <td class="text-muted">${l.note || '—'}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="TimePage.deleteLog('${l.id}')">×</button></td></tr>`;
            });
            html += `</tbody></table>`;
        }
        html += `</div>`;

        // Weekly summary table
        html += `<div class="card"><div class="card-header"><span class="card-title">7-Day Summary</span></div>
            <table class="data-table"><thead><tr><th>Day</th>${categories.map(c => `<th>${c}</th>`).join('')}<th>Total</th></tr></thead><tbody>`;
        weekDays.forEach(d => {
            const dayLogs = timeLogs.filter(l => l.date === d);
            const dayTotal = dayLogs.reduce((s, l) => s + l.duration, 0);
            html += `<tr><td>${Utils.formatDateShort(d)}</td>`;
            categories.forEach(c => {
                const mins = dayLogs.filter(l => l.category === c).reduce((s, l) => s + l.duration, 0);
                html += `<td>${mins > 0 ? Utils.hoursDisplay(mins) : '—'}</td>`;
            });
            html += `<td><strong>${Utils.hoursDisplay(dayTotal)}</strong></td></tr>`;
        });
        html += `</tbody></table></div>`;

        document.getElementById('content').innerHTML = html;
        this._renderCharts(timeLogs, weekDays, categories);
    },

    _renderCharts(timeLogs, weekDays, categories) {
        const catColors = { study: '#a855f7', coding: '#6366f1', acting: '#eab308', training: '#22c55e', distraction: '#ef4444' };
        const weekLogs = timeLogs.filter(l => weekDays.includes(l.date));

        // Pie chart
        const pieCtx = document.getElementById('timePie');
        if (pieCtx) {
            const pieData = categories.map(c => weekLogs.filter(l => l.category === c).reduce((s, l) => s + l.duration, 0));
            new Chart(pieCtx, {
                type: 'doughnut', data: {
                    labels: categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
                    datasets: [{ data: pieData, backgroundColor: categories.map(c => catColors[c]), borderWidth: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#8b8b9e', font: { size: 10 }, padding: 12 } } } }
            });
        }

        // Bar chart
        const barCtx = document.getElementById('timeBar');
        if (barCtx) {
            new Chart(barCtx, {
                type: 'bar', data: {
                    labels: weekDays.map(d => Utils.formatDateShort(d)),
                    datasets: categories.map(c => ({
                        label: c, data: weekDays.map(d => Math.round(weekLogs.filter(l => l.date === d && l.category === c).reduce((s, l) => s + l.duration, 0) / 60 * 10) / 10),
                        backgroundColor: catColors[c], borderRadius: 3
                    }))
                },
                options: {
                    responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8b8b9e', font: { size: 10 } } } },
                    scales: { x: { stacked: true, ticks: { color: '#55556a' }, grid: { display: false } }, y: { stacked: true, ticks: { color: '#55556a' }, grid: { color: '#1e1e2e' } } }
                }
            });
        }
    },

    showLogForm() {
        const o = document.createElement('div'); o.className = 'modal-overlay'; o.id = 'timeModal';
        o.innerHTML = `<div class="modal"><div class="modal-title">Log Time</div>
            <div class="form-row"><div class="form-group"><label class="form-label">Date</label>
                <input class="form-input" type="date" id="timeDate" value="${Utils.today()}"></div>
            <div class="form-group"><label class="form-label">Category</label>
                <select class="form-select" id="timeCat">
                ${['study', 'coding', 'acting', 'training', 'distraction'].map(c => `<option value="${c}">${c}</option>`).join('')}
                </select></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Hours</label>
                <input class="form-input" type="number" id="timeHours" min="0" value="0"></div>
            <div class="form-group"><label class="form-label">Minutes</label>
                <input class="form-input" type="number" id="timeMins" min="0" max="59" value="30"></div></div>
            <div class="form-group"><label class="form-label">Note (optional)</label>
                <input class="form-input" id="timeNote" placeholder="What did you work on?"></div>
            <div class="modal-actions"><button class="btn btn-secondary" onclick="document.getElementById('timeModal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="TimePage.saveLog()">Log</button></div></div>`;
        document.body.appendChild(o);
        o.addEventListener('click', e => { if (e.target === o) o.remove(); });
    },

    saveLog() {
        const date = document.getElementById('timeDate').value;
        const category = document.getElementById('timeCat').value;
        const hours = parseInt(document.getElementById('timeHours').value) || 0;
        const mins = parseInt(document.getElementById('timeMins').value) || 0;
        const note = document.getElementById('timeNote').value.trim();
        const duration = hours * 60 + mins;
        if (!date || duration <= 0) return alert('Date and duration required.');
        Data.addToCollection('timeLogs', { id: Utils.uid(), date, category, duration, note });
        document.getElementById('timeModal').remove();
        this.render();
    },

    deleteLog(id) { if (confirm('Delete?')) { Data.removeFromCollection('timeLogs', id); this.render(); } }
};
