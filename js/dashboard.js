/* ============================================
   PERSONAL OS — Dashboard (Control Center)
   ============================================ */

const DashboardPage = {
    render() {
        const today = Utils.today();
        const phases = Data.getCollection('phases');
        const habits = Data.getCollection('habits');
        const timeLogs = Data.getCollection('timeLogs');
        const settings = Data.getSettings();

        // Find active phase
        const activePhase = phases.find(p => Utils.isWithinRange(today, p.startDate, p.endDate));

        // Today's habit completion
        const dailyHabits = habits.filter(h => h.frequency === 'daily');
        const completedToday = dailyHabits.filter(h => h.completions && h.completions.includes(today));

        // Today's time logs
        const todayLogs = timeLogs.filter(l => l.date === today);
        const totalMinutes = todayLogs.reduce((s, l) => s + l.duration, 0);
        const deepWorkMins = todayLogs.filter(l => l.category === 'coding' || l.category === 'study').reduce((s, l) => s + l.duration, 0);
        const distractionMins = todayLogs.filter(l => l.category === 'distraction').reduce((s, l) => s + l.duration, 0);

        // Discipline score
        const disciplineScore = this.calcDisciplineScore(today);
        const scoreClr = Utils.scoreColor(disciplineScore);

        // Weekly stats
        const weekDays = Utils.lastNDays(7);
        const weekLogs = timeLogs.filter(l => weekDays.includes(l.date));
        const weekCoding = weekLogs.filter(l => l.category === 'coding').reduce((s, l) => s + l.duration, 0);
        const weekStudy = weekLogs.filter(l => l.category === 'study').reduce((s, l) => s + l.duration, 0);
        const weekTraining = weekLogs.filter(l => l.category === 'training').reduce((s, l) => s + l.duration, 0);
        const weekActing = weekLogs.filter(l => l.category === 'acting').reduce((s, l) => s + l.duration, 0);

        // Burnout detection
        const burnout = this.detectBurnout();

        let html = `
            <div class="page-header">
                <h1>Control Center</h1>
                <p>${Utils.formatDate(today)} — ${new Date().toLocaleDateString('en-IN', { weekday: 'long' })}</p>
            </div>
        `;

        // Burnout warning
        if (burnout) {
            html += `<div class="warning-banner">⚠ BURNOUT WARNING: ${burnout}</div>`;
        }

        // Active Phase Card
        html += `<div class="card">
            <div class="card-header">
                <span class="card-title">Active Phase</span>
                ${activePhase ? `<span class="card-badge badge-accent">● ACTIVE</span>` : `<span class="card-badge badge-red">NO ACTIVE PHASE</span>`}
            </div>`;

        if (activePhase) {
            const totalDays = Utils.daysBetween(activePhase.startDate, activePhase.endDate);
            const elapsed = Utils.daysPassed(activePhase.startDate);
            const remaining = Utils.daysRemaining(activePhase.endDate);
            const pct = Utils.percentage(elapsed, totalDays);

            html += `
                <div class="grid-4">
                    <div class="stat-block">
                        <div class="stat-label">Phase</div>
                        <div class="stat-value" style="font-size:20px;">${activePhase.name}</div>
                    </div>
                    <div class="stat-block">
                        <div class="stat-label">Days Remaining</div>
                        <div class="stat-value">${remaining}</div>
                        <div class="stat-sub">${Utils.formatDateShort(activePhase.startDate)} → ${Utils.formatDateShort(activePhase.endDate)}</div>
                    </div>
                    <div class="stat-block">
                        <div class="stat-label">Day</div>
                        <div class="stat-value">${elapsed} <span style="font-size:14px;color:var(--text-muted)">/ ${totalDays}</span></div>
                    </div>
                    <div class="stat-block">
                        <div class="stat-label">Completion</div>
                        <div class="stat-value">${pct}%</div>
                        <div class="progress-bar"><div class="progress-fill ${Utils.progressClass(pct)}" style="width:${pct}%"></div></div>
                    </div>
                </div>`;
        } else {
            html += `<div class="empty-state"><p>No active phase. Go to Phases to create one.</p></div>`;
        }
        html += `</div>`;

        // Daily Execution Panel
        html += `<div class="grid-2">
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Daily Execution</span>
                    <span class="card-badge ${Utils.badgeClass(Utils.percentage(completedToday.length, dailyHabits.length))}">${completedToday.length}/${dailyHabits.length}</span>
                </div>`;

        dailyHabits.forEach(h => {
            const done = h.completions && h.completions.includes(today);
            html += `
                <div class="check-item ${done ? 'checked' : ''}" onclick="DashboardPage.toggleHabit('${h.id}')">
                    <div class="check-box">${done ? '✓' : ''}</div>
                    <span class="check-label">${h.name}</span>
                    <span class="tag tag-${h.category}">${h.category}</span>
                </div>`;
        });

        html += `</div>`;

        // Right side: Score + Time
        html += `<div class="card">
                <div class="card-header">
                    <span class="card-title">Today's Performance</span>
                </div>
                <div style="text-align:center;margin-bottom:20px;">
                    <div class="score-ring ${scoreClr}">${disciplineScore}</div>
                    <div class="stat-label">Discipline Score</div>
                </div>
                <div class="grid-2">
                    <div class="stat-block">
                        <div class="stat-label">Hours Logged</div>
                        <div class="stat-value">${Utils.hoursDisplay(totalMinutes)}</div>
                    </div>
                    <div class="stat-block">
                        <div class="stat-label">Deep Work</div>
                        <div class="stat-value">${Utils.hoursDisplay(deepWorkMins)}</div>
                    </div>
                    <div class="stat-block">
                        <div class="stat-label">Distraction</div>
                        <div class="stat-value ${distractionMins > 60 ? 'text-red' : 'text-green'}">${Utils.hoursDisplay(distractionMins)}</div>
                    </div>
                    <div class="stat-block">
                        <div class="stat-label">Habits Done</div>
                        <div class="stat-value">${Utils.percentage(completedToday.length, dailyHabits.length)}%</div>
                    </div>
                </div>
            </div>
        </div>`;

        // Quick Actions Bar
        html += `<div class="card" style="padding:16px 24px;">
            <div class="flex-between">
                <span class="card-title">Quick Actions</span>
                <div class="flex-gap" style="gap:10px;flex-wrap:wrap;">
                    <button class="btn btn-secondary btn-sm" onclick="window.location.hash='pomodoro'">⏱ Start Focus Session</button>
                    <button class="btn btn-secondary btn-sm" onclick="window.location.hash='tasks';setTimeout(()=>TasksPage.showAddForm(),100)">☐ Add Task</button>
                    <button class="btn btn-secondary btn-sm" onclick="window.location.hash='time';setTimeout(()=>TimePage.showLogForm(),100)">◴ Log Time</button>
                    <button class="btn btn-secondary btn-sm" onclick="window.location.hash='skills';setTimeout(()=>SkillsPage.showLogForm(),100)">◧ Log Skill</button>
                    <button class="btn btn-secondary btn-sm" onclick="Shortcuts.showHelp()">? Shortcuts</button>
                </div>
            </div>
        </div>`;

        // Tasks + Notes row
        const tasks = Data.getCollection('tasks');
        const activeTasks = tasks.filter(t => !t.completed);
        const overdueTasks = activeTasks.filter(t => t.dueDate && t.dueDate < today);
        const dueTodayTasks = activeTasks.filter(t => t.dueDate === today);
        const topTasks = activeTasks.sort((a, b) => {
            const po = { high: 0, medium: 1, low: 2 };
            return (po[a.priority] || 1) - (po[b.priority] || 1);
        }).slice(0, 5);

        // Pomodoro today
        const pomoHistory = Data.getCollection('pomodoroHistory');
        const pomoToday = pomoHistory.filter(h => h.date === today);
        const pomoMins = pomoToday.reduce((s, h) => s + h.duration, 0);

        html += `<div class="grid-2">`;

        // Active Tasks Widget
        html += `<div class="card">
            <div class="card-header">
                <span class="card-title">Active Tasks</span>
                <div class="flex-gap">
                    ${overdueTasks.length > 0 ? `<span class="card-badge badge-red">${overdueTasks.length} overdue</span>` : ''}
                    <a href="#tasks" style="font-size:12px;color:var(--accent);text-decoration:none;">View all →</a>
                </div>
            </div>
            ${topTasks.length === 0 ? '<div class="text-muted" style="font-size:13px;">No active tasks</div>' :
                topTasks.map(t => {
                    const colors = { high: 'var(--red)', medium: 'var(--yellow)', low: 'var(--green)' };
                    const isDue = t.dueDate === today;
                    const isOverdue = t.dueDate && t.dueDate < today;
                    return `<div class="check-item" onclick="DashboardPage.quickCompleteTask('${t.id}')" style="padding:6px 8px;">
                        <div class="check-box"></div>
                        <span class="check-label" style="font-size:12px;">${t.title}</span>
                        <span style="width:6px;height:6px;border-radius:50%;background:${colors[t.priority]};flex-shrink:0;"></span>
                        ${isDue ? '<span class="text-yellow" style="font-size:10px;">today</span>' : ''}
                        ${isOverdue ? '<span class="text-red" style="font-size:10px;">overdue</span>' : ''}
                    </div>`;
                }).join('')
            }
        </div>`;

        // Daily Notes
        const savedNote = Data.get('note_' + today) || '';
        html += `<div class="card">
            <div class="card-header">
                <span class="card-title">Daily Notes</span>
                <div class="flex-gap">
                    <span class="text-muted" style="font-size:11px;">⏱ ${pomoToday.length} sessions · ${Utils.hoursDisplay(pomoMins)} focus</span>
                </div>
            </div>
            <textarea class="form-textarea" id="dailyNote" placeholder="Reflections, plans, observations..." 
                style="min-height:120px;resize:vertical;" onblur="DashboardPage.saveNote()">${savedNote}</textarea>
        </div>`;

        html += `</div>`;

        // Weekly Snapshot
        html += `<div class="card">
            <div class="card-header">
                <span class="card-title">Weekly Snapshot</span>
                <span class="text-muted" style="font-size:11px;">Last 7 days</span>
            </div>
            <div class="grid-4">
                <div class="stat-block">
                    <div class="stat-label">Coding</div>
                    <div class="stat-value">${Utils.hoursDisplay(weekCoding)}</div>
                </div>
                <div class="stat-block">
                    <div class="stat-label">Study</div>
                    <div class="stat-value">${Utils.hoursDisplay(weekStudy)}</div>
                </div>
                <div class="stat-block">
                    <div class="stat-label">Training</div>
                    <div class="stat-value">${Utils.hoursDisplay(weekTraining)}</div>
                </div>
                <div class="stat-block">
                    <div class="stat-label">Acting</div>
                    <div class="stat-value">${Utils.hoursDisplay(weekActing)}</div>
                </div>
            </div>
            <div class="chart-container mt-20" style="max-height:200px;">
                <canvas id="weeklyChart"></canvas>
            </div>
        </div>`;

        // 7-day discipline trend
        html += `<div class="card">
            <div class="card-header">
                <span class="card-title">7-Day Discipline Trend</span>
            </div>
            <div class="chart-container" style="max-height:200px;">
                <canvas id="disciplineChart"></canvas>
            </div>
        </div>`;

        document.getElementById('content').innerHTML = html;
        this.renderCharts(weekDays);
    },

    toggleHabit(habitId) {
        const habits = Data.getCollection('habits');
        const today = Utils.today();
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        if (!habit.completions) habit.completions = [];

        if (habit.completions.includes(today)) {
            habit.completions = habit.completions.filter(d => d !== today);
        } else {
            habit.completions.push(today);
        }

        Data.set('habits', habits);
        this.render();
    },

    calcDisciplineScore(date) {
        const habits = Data.getCollection('habits');
        const timeLogs = Data.getCollection('timeLogs');
        const settings = Data.getSettings();
        const weights = settings.scoringWeights;

        // Habit score
        const dailyHabits = habits.filter(h => h.frequency === 'daily');
        const completed = dailyHabits.filter(h => h.completions && h.completions.includes(date)).length;
        const habitScore = dailyHabits.length > 0 ? (completed / dailyHabits.length) * 100 : 0;

        // Deep work score
        const dayLogs = timeLogs.filter(l => l.date === date);
        const deepMins = dayLogs.filter(l => l.category === 'coding' || l.category === 'study').reduce((s, l) => s + l.duration, 0);
        const deepScore = Math.min(100, (deepMins / 180) * 100); // 3 hours = 100%

        // Training score
        const trainingMins = dayLogs.filter(l => l.category === 'training').reduce((s, l) => s + l.duration, 0);
        const trainingScore = Math.min(100, (trainingMins / 45) * 100); // 45 min = 100%

        // No distraction score
        const distractMins = dayLogs.filter(l => l.category === 'distraction').reduce((s, l) => s + l.duration, 0);
        const noDistractScore = Math.max(0, 100 - (distractMins / 30) * 100); // Lose 100% at 30 min

        const score = Math.round(
            (habitScore * weights.habits / 100) +
            (deepScore * weights.deepWork / 100) +
            (trainingScore * weights.training / 100) +
            (noDistractScore * weights.noDistraction / 100)
        );

        return Utils.clamp(score, 0, 100);
    },

    detectBurnout() {
        const settings = Data.getSettings();
        const days = Utils.lastNDays(settings.burnoutDays);
        const scores = days.map(d => this.calcDisciplineScore(d));
        const allLow = scores.every(s => s < settings.burnoutThreshold);
        if (allLow && scores.some(s => s > 0)) {
            return `${settings.burnoutDays} consecutive days with discipline score below ${settings.burnoutThreshold}. Consider adjusting your routine.`;
        }
        return null;
    },

    saveNote() {
        const note = document.getElementById('dailyNote');
        if (note) Data.set('note_' + Utils.today(), note.value);
    },

    quickCompleteTask(id) {
        const tasks = Data.getCollection('tasks');
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        task.completed = true;
        task.completedDate = Utils.today();
        Data.set('tasks', tasks);
        Toast.show(`"${task.title}" completed! ✓`, 'success');
        this.render();
    },

    renderCharts(weekDays) {
        // Weekly category hours chart
        const timeLogs = Data.getCollection('timeLogs');
        const weekLogs = timeLogs.filter(l => weekDays.includes(l.date));

        const categories = ['study', 'coding', 'acting', 'training', 'distraction'];
        const catColors = ['#a855f7', '#6366f1', '#eab308', '#22c55e', '#ef4444'];

        const weeklyCtx = document.getElementById('weeklyChart');
        if (weeklyCtx) {
            new Chart(weeklyCtx, {
                type: 'bar',
                data: {
                    labels: weekDays.map(d => Utils.formatDateShort(d)),
                    datasets: categories.map((cat, i) => ({
                        label: cat.charAt(0).toUpperCase() + cat.slice(1),
                        data: weekDays.map(d =>
                            Math.round(weekLogs.filter(l => l.date === d && l.category === cat).reduce((s, l) => s + l.duration, 0) / 60 * 10) / 10
                        ),
                        backgroundColor: catColors[i],
                        borderRadius: 3,
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#8b8b9e', font: { size: 10 } } } },
                    scales: {
                        x: { stacked: true, ticks: { color: '#55556a', font: { size: 10 } }, grid: { display: false } },
                        y: { stacked: true, ticks: { color: '#55556a', font: { size: 10 } }, grid: { color: '#1e1e2e' }, title: { display: true, text: 'Hours', color: '#55556a' } }
                    }
                }
            });
        }

        // Discipline trend chart
        const discCtx = document.getElementById('disciplineChart');
        if (discCtx) {
            const scores = weekDays.map(d => this.calcDisciplineScore(d));
            new Chart(discCtx, {
                type: 'line',
                data: {
                    labels: weekDays.map(d => Utils.formatDateShort(d)),
                    datasets: [{
                        label: 'Discipline Score',
                        data: scores,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99,102,241,0.1)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: scores.map(s => {
                            if (s >= 70) return '#22c55e';
                            if (s >= 40) return '#eab308';
                            return '#ef4444';
                        }),
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#55556a', font: { size: 10 } }, grid: { display: false } },
                        y: { min: 0, max: 100, ticks: { color: '#55556a', font: { size: 10 } }, grid: { color: '#1e1e2e' } }
                    }
                }
            });
        }
    }
};
