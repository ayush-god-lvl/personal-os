/* ============================================
   PERSONAL OS — Reports Section
   ============================================ */

const ReportsPage = {
    activeReport: 'weekly',

    render() {
        const tabs = [
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
        ];

        let html = `
            <div class="page-header"><h1>Reports</h1><p>Performance analytics and trend analysis.</p></div>
            <div class="tabs">${tabs.map(t => `<button class="tab ${this.activeReport === t.id ? 'active' : ''}" onclick="ReportsPage.setReport('${t.id}')">${t.label}</button>`).join('')}</div>
        `;

        html += this.activeReport === 'weekly' ? this._weekly() : this._monthly();
        document.getElementById('content').innerHTML = html;
        this._renderCharts();
    },

    setReport(r) { this.activeReport = r; this.render(); },

    _weekly() {
        const days = Utils.lastNDays(7);
        const timeLogs = Data.getCollection('timeLogs');
        const habits = Data.getCollection('habits');
        const weekLogs = timeLogs.filter(l => days.includes(l.date));

        const categories = ['study', 'coding', 'acting', 'training', 'distraction'];
        const catTotals = {};
        categories.forEach(c => { catTotals[c] = weekLogs.filter(l => l.category === c).reduce((s, l) => s + l.duration, 0); });

        const dailyHabits = habits.filter(h => h.frequency === 'daily');
        const habitConsistency = dailyHabits.length > 0 ? Utils.percentage(
            dailyHabits.reduce((s, h) => s + (h.completions || []).filter(d => days.includes(d)).length, 0),
            dailyHabits.length * 7
        ) : 0;

        const scores = days.map(d => DashboardPage.calcDisciplineScore(d));
        const avgScore = Math.round(Utils.average(scores));

        let html = `<div class="grid-4 mb-20">
            <div class="stat-block"><div class="stat-label">Avg Discipline</div><div class="stat-value ${Utils.scoreColorClass(avgScore)}">${avgScore}</div></div>
            <div class="stat-block"><div class="stat-label">Habit Consistency</div><div class="stat-value ${Utils.scoreColorClass(habitConsistency)}">${habitConsistency}%</div></div>
            <div class="stat-block"><div class="stat-label">Total Productive</div><div class="stat-value">${Utils.hoursDisplay(Object.entries(catTotals).filter(([k]) => k !== 'distraction').reduce((s, [, v]) => s + v, 0))}</div></div>
            <div class="stat-block"><div class="stat-label">Distraction</div><div class="stat-value text-red">${Utils.hoursDisplay(catTotals.distraction || 0)}</div></div>
        </div>`;

        // Hours per category
        html += `<div class="card"><div class="card-header"><span class="card-title">Hours Per Category</span></div>
            <table class="data-table"><thead><tr><th>Category</th><th>Hours</th><th>% of Total</th></tr></thead><tbody>`;
        const totalMins = Object.values(catTotals).reduce((s, v) => s + v, 0);
        categories.forEach(c => {
            html += `<tr><td><span class="tag tag-${c}">${c}</span></td><td>${Utils.hoursDisplay(catTotals[c])}</td>
                <td>${Utils.percentage(catTotals[c], totalMins)}%</td></tr>`;
        });
        html += `</tbody></table></div>`;

        // Discipline trend
        html += `<div class="card"><div class="card-header"><span class="card-title">Discipline Trend</span></div>
            <div class="chart-container" style="max-height:200px;"><canvas id="reportChart"></canvas></div></div>`;

        return html;
    },

    _monthly() {
        const days = Utils.lastNDays(30);
        const timeLogs = Data.getCollection('timeLogs');
        const habits = Data.getCollection('habits');
        const phases = Data.getCollection('phases');
        const monthLogs = timeLogs.filter(l => days.includes(l.date));

        const categories = ['study', 'coding', 'acting', 'training', 'distraction'];
        const catTotals = {};
        categories.forEach(c => { catTotals[c] = monthLogs.filter(l => l.category === c).reduce((s, l) => s + l.duration, 0); });

        const dailyHabits = habits.filter(h => h.frequency === 'daily');
        const habitConsistency = dailyHabits.length > 0 ? Utils.percentage(
            dailyHabits.reduce((s, h) => s + (h.completions || []).filter(d => days.includes(d)).length, 0),
            dailyHabits.length * 30
        ) : 0;

        const scores = days.map(d => DashboardPage.calcDisciplineScore(d));
        const avgScore = Math.round(Utils.average(scores));

        // Trend direction
        const firstHalf = scores.slice(0, 15);
        const secondHalf = scores.slice(15);
        const trend = Utils.average(secondHalf) - Utils.average(firstHalf);
        const trendLabel = trend > 5 ? '↑ Improving' : (trend < -5 ? '↓ Declining' : '→ Stable');
        const trendColor = trend > 5 ? 'text-green' : (trend < -5 ? 'text-red' : 'text-yellow');

        let html = `<div class="grid-4 mb-20">
            <div class="stat-block"><div class="stat-label">Avg Discipline</div><div class="stat-value ${Utils.scoreColorClass(avgScore)}">${avgScore}</div></div>
            <div class="stat-block"><div class="stat-label">30-Day Trend</div><div class="stat-value ${trendColor}" style="font-size:18px;">${trendLabel}</div></div>
            <div class="stat-block"><div class="stat-label">Habit Consistency</div><div class="stat-value ${Utils.scoreColorClass(habitConsistency)}">${habitConsistency}%</div></div>
            <div class="stat-block"><div class="stat-label">Total Hours</div><div class="stat-value">${Utils.hoursDisplay(Object.values(catTotals).reduce((s, v) => s + v, 0))}</div></div>
        </div>`;

        // Phase performance
        const activePhase = phases.find(p => Utils.isWithinRange(Utils.today(), p.startDate, p.endDate));
        if (activePhase) {
            const pct = Utils.percentage(Utils.daysPassed(activePhase.startDate), Utils.daysBetween(activePhase.startDate, activePhase.endDate));
            html += `<div class="info-banner">Phase "${activePhase.name}" — ${pct}% complete, ${Utils.daysRemaining(activePhase.endDate)} days remaining</div>`;
        }

        // Category breakdown
        html += `<div class="card"><div class="card-header"><span class="card-title">30-Day Category Breakdown</span></div>
            <table class="data-table"><thead><tr><th>Category</th><th>Total</th><th>Daily Avg</th></tr></thead><tbody>`;
        categories.forEach(c => {
            html += `<tr><td><span class="tag tag-${c}">${c}</span></td><td>${Utils.hoursDisplay(catTotals[c])}</td>
                <td>${Utils.hoursDisplay(Math.round(catTotals[c] / 30))}</td></tr>`;
        });
        html += `</tbody></table></div>`;

        html += `<div class="card"><div class="card-header"><span class="card-title">30-Day Discipline Trend</span></div>
            <div class="chart-container" style="max-height:200px;"><canvas id="reportChart"></canvas></div></div>`;

        return html;
    },

    _renderCharts() {
        const days = this.activeReport === 'weekly' ? Utils.lastNDays(7) : Utils.lastNDays(30);
        const scores = days.map(d => DashboardPage.calcDisciplineScore(d));
        const ctx = document.getElementById('reportChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'line', data: {
                labels: days.map(d => Utils.formatDateShort(d)),
                datasets: [{
                    label: 'Score', data: scores, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.3, pointRadius: 2,
                    pointBackgroundColor: scores.map(s => s >= 70 ? '#22c55e' : (s >= 40 ? '#eab308' : '#ef4444'))
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#55556a', font: { size: 9 }, maxTicksLimit: 10 }, grid: { display: false } },
                    y: { min: 0, max: 100, ticks: { color: '#55556a' }, grid: { color: '#1e1e2e' } }
                }
            }
        });
    }
};
