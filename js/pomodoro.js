/* ============================================
   PERSONAL OS — Advanced Pomodoro Timer
   Focus / Work / Study modes with session tracking
   ============================================ */

const PomodoroPage = {
    timer: null,
    secondsLeft: 0,
    isRunning: false,
    currentMode: 'focus',  // focus, work, study
    currentPhase: 'work',  // work, shortBreak, longBreak
    sessionsCompleted: 0,

    modes: {
        focus: { label: 'Deep Focus', work: 50, shortBreak: 10, longBreak: 30, sessionsBeforeLong: 4, color: '#6366f1' },
        work: { label: 'Work Sprint', work: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLong: 4, color: '#22c55e' },
        study: { label: 'Study Session', work: 45, shortBreak: 10, longBreak: 20, sessionsBeforeLong: 3, color: '#a855f7' },
    },

    render() {
        const mode = this.modes[this.currentMode];
        const history = Data.getCollection('pomodoroHistory');
        const today = Utils.today();
        const todaySessions = history.filter(h => h.date === today);
        const todayMinutes = todaySessions.reduce((s, h) => s + h.duration, 0);
        const weekDays = Utils.lastNDays(7);
        const weekSessions = history.filter(h => weekDays.includes(h.date));
        const weekMinutes = weekSessions.reduce((s, h) => s + h.duration, 0);

        const phaseLabel = this.currentPhase === 'work' ? mode.label : (this.currentPhase === 'shortBreak' ? 'Short Break' : 'Long Break');
        const minutes = Math.floor(this.secondsLeft / 60);
        const seconds = this.secondsLeft % 60;
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Total time for current phase for progress calc
        let totalPhaseSeconds;
        if (this.currentPhase === 'work') totalPhaseSeconds = mode.work * 60;
        else if (this.currentPhase === 'shortBreak') totalPhaseSeconds = mode.shortBreak * 60;
        else totalPhaseSeconds = mode.longBreak * 60;
        const progress = totalPhaseSeconds > 0 ? Utils.percentage(totalPhaseSeconds - this.secondsLeft, totalPhaseSeconds) : 0;

        let html = `
            <div class="page-header"><h1>Pomodoro Timer</h1><p>Structured focus sessions with automatic break scheduling.</p></div>

            <div class="grid-3 mb-20">
                ${Object.entries(this.modes).map(([key, m]) => `
                    <div class="stat-block ${this.currentMode === key ? 'pomo-mode-active' : ''}" 
                         style="cursor:pointer;${this.currentMode === key ? `border-color:${m.color};box-shadow:0 0 15px ${m.color}22;` : ''}" 
                         onclick="PomodoroPage.setMode('${key}')">
                        <div class="stat-label">${m.label}</div>
                        <div class="stat-value" style="font-size:16px;${this.currentMode === key ? `color:${m.color};` : ''}">${m.work}/${m.shortBreak}/${m.longBreak}</div>
                        <div class="stat-sub">work / short / long (min)</div>
                    </div>
                `).join('')}
            </div>

            <div class="card" style="text-align:center;padding:48px 24px;">
                <div class="stat-label mb-10" style="font-size:14px;letter-spacing:2px;">${phaseLabel.toUpperCase()}</div>
                <div style="position:relative;display:inline-block;margin:20px auto;">
                    <svg width="260" height="260" viewBox="0 0 260 260">
                        <circle cx="130" cy="130" r="120" fill="none" stroke="var(--border)" stroke-width="6"/>
                        <circle cx="130" cy="130" r="120" fill="none" stroke="${mode.color}" stroke-width="6"
                            stroke-dasharray="${2 * Math.PI * 120}" 
                            stroke-dashoffset="${2 * Math.PI * 120 * (1 - progress / 100)}"
                            stroke-linecap="round" transform="rotate(-90 130 130)"
                            style="transition:stroke-dashoffset 0.5s ease;"/>
                    </svg>
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
                        <div style="font-size:56px;font-weight:800;letter-spacing:-2px;color:${mode.color};" id="pomoClock">${timeStr}</div>
                        <div class="text-muted" style="font-size:12px;">session ${this.sessionsCompleted + 1}</div>
                    </div>
                </div>

                <div class="flex-gap" style="justify-content:center;gap:16px;margin-top:24px;">
                    ${!this.isRunning ? `
                        <button class="btn btn-primary" style="background:${mode.color};padding:12px 32px;font-size:15px;" onclick="PomodoroPage.start()">▶ Start</button>
                    ` : `
                        <button class="btn btn-secondary" style="padding:12px 32px;font-size:15px;" onclick="PomodoroPage.pause()">⏸ Pause</button>
                    `}
                    <button class="btn btn-secondary" onclick="PomodoroPage.reset()">↺ Reset</button>
                    <button class="btn btn-secondary" onclick="PomodoroPage.skip()">⏭ Skip</button>
                </div>

                <div class="flex-gap mt-20" style="justify-content:center;">
                    ${Array.from({ length: this.modes[this.currentMode].sessionsBeforeLong }, (_, i) => `
                        <div style="width:14px;height:14px;border-radius:50%;border:2px solid ${mode.color};
                            ${i < this.sessionsCompleted ? `background:${mode.color};` : ''}"></div>
                    `).join('')}
                </div>
            </div>

            <div class="grid-4 mb-20">
                <div class="stat-block"><div class="stat-label">Today's Sessions</div><div class="stat-value">${todaySessions.length}</div></div>
                <div class="stat-block"><div class="stat-label">Today's Focus Time</div><div class="stat-value">${Utils.hoursDisplay(todayMinutes)}</div></div>
                <div class="stat-block"><div class="stat-label">Week Sessions</div><div class="stat-value">${weekSessions.length}</div></div>
                <div class="stat-block"><div class="stat-label">Week Focus Time</div><div class="stat-value">${Utils.hoursDisplay(weekMinutes)}</div></div>
            </div>

            <div class="grid-2">
                <div class="card">
                    <div class="card-header"><span class="card-title">Session History (Today)</span></div>
                    ${todaySessions.length === 0 ? '<div class="empty-state"><p>No sessions completed today.</p></div>' : `
                        <table class="data-table"><thead><tr><th>Mode</th><th>Duration</th><th>Task</th><th>Time</th></tr></thead><tbody>
                        ${todaySessions.reverse().map(s => `<tr>
                            <td><span class="tag tag-${s.mode === 'focus' ? 'coding' : (s.mode === 'study' ? 'study' : 'training')}">${s.mode}</span></td>
                            <td>${s.duration}m</td><td class="text-muted">${s.task || '—'}</td><td class="text-muted">${s.time || ''}</td>
                        </tr>`).join('')}
                        </tbody></table>
                    `}
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title">7-Day Chart</span></div>
                    <div class="chart-container" style="max-height:220px;"><canvas id="pomoChart"></canvas></div>
                </div>
            </div>

            <div class="card mt-20">
                <div class="card-header"><span class="card-title">Timer Settings</span></div>
                <div class="grid-3">
                    <div class="form-group"><label class="form-label">Focus Work (min)</label>
                        <input class="form-input" type="number" id="pomoFocusWork" value="${this.modes.focus.work}" onchange="PomodoroPage.updateMode('focus','work',this.value)"></div>
                    <div class="form-group"><label class="form-label">Focus Short Break</label>
                        <input class="form-input" type="number" id="pomoFocusShort" value="${this.modes.focus.shortBreak}" onchange="PomodoroPage.updateMode('focus','shortBreak',this.value)"></div>
                    <div class="form-group"><label class="form-label">Focus Long Break</label>
                        <input class="form-input" type="number" id="pomoFocusLong" value="${this.modes.focus.longBreak}" onchange="PomodoroPage.updateMode('focus','longBreak',this.value)"></div>
                    <div class="form-group"><label class="form-label">Work Sprint (min)</label>
                        <input class="form-input" type="number" id="pomoWorkWork" value="${this.modes.work.work}" onchange="PomodoroPage.updateMode('work','work',this.value)"></div>
                    <div class="form-group"><label class="form-label">Work Short Break</label>
                        <input class="form-input" type="number" id="pomoWorkShort" value="${this.modes.work.shortBreak}" onchange="PomodoroPage.updateMode('work','shortBreak',this.value)"></div>
                    <div class="form-group"><label class="form-label">Work Long Break</label>
                        <input class="form-input" type="number" id="pomoWorkLong" value="${this.modes.work.longBreak}" onchange="PomodoroPage.updateMode('work','longBreak',this.value)"></div>
                    <div class="form-group"><label class="form-label">Study Work (min)</label>
                        <input class="form-input" type="number" id="pomoStudyWork" value="${this.modes.study.work}" onchange="PomodoroPage.updateMode('study','work',this.value)"></div>
                    <div class="form-group"><label class="form-label">Study Short Break</label>
                        <input class="form-input" type="number" id="pomoStudyShort" value="${this.modes.study.shortBreak}" onchange="PomodoroPage.updateMode('study','shortBreak',this.value)"></div>
                    <div class="form-group"><label class="form-label">Study Long Break</label>
                        <input class="form-input" type="number" id="pomoStudyLong" value="${this.modes.study.longBreak}" onchange="PomodoroPage.updateMode('study','longBreak',this.value)"></div>
                </div>
            </div>
        `;

        document.getElementById('content').innerHTML = html;
        this._renderChart(weekDays, history);
        if (!this.isRunning && this.secondsLeft === 0) this.reset();
    },

    setMode(mode) {
        if (this.isRunning) { Toast.show('Pause timer before switching modes', 'warning'); return; }
        this.currentMode = mode;
        this.currentPhase = 'work';
        this.sessionsCompleted = 0;
        this.secondsLeft = this.modes[mode].work * 60;
        this.render();
    },

    updateMode(mode, prop, val) {
        const v = parseInt(val);
        if (v > 0) this.modes[mode][prop] = v;
        if (!this.isRunning) this.reset();
    },

    start() {
        if (this.secondsLeft <= 0) this.reset();
        this.isRunning = true;
        this.render();
        this.timer = setInterval(() => this._tick(), 1000);
    },

    pause() {
        this.isRunning = false;
        clearInterval(this.timer);
        this.render();
    },

    reset() {
        this.isRunning = false;
        clearInterval(this.timer);
        const mode = this.modes[this.currentMode];
        if (this.currentPhase === 'work') this.secondsLeft = mode.work * 60;
        else if (this.currentPhase === 'shortBreak') this.secondsLeft = mode.shortBreak * 60;
        else this.secondsLeft = mode.longBreak * 60;
        this.render();
    },

    skip() {
        clearInterval(this.timer);
        this.isRunning = false;
        this._advancePhase();
    },

    _tick() {
        this.secondsLeft--;
        if (this.secondsLeft <= 0) {
            clearInterval(this.timer);
            this.isRunning = false;
            this._onPhaseComplete();
            return;
        }
        // Update clock without full re-render
        const el = document.getElementById('pomoClock');
        if (el) {
            const m = Math.floor(this.secondsLeft / 60);
            const s = this.secondsLeft % 60;
            el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
        // Update title
        const m = Math.floor(this.secondsLeft / 60);
        const s = this.secondsLeft % 60;
        document.title = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} — Personal OS`;
    },

    _onPhaseComplete() {
        // Play notification sound
        this._playSound();

        if (this.currentPhase === 'work') {
            // Log the completed work session
            const mode = this.modes[this.currentMode];
            const now = new Date();
            Data.addToCollection('pomodoroHistory', {
                id: Utils.uid(),
                date: Utils.today(),
                mode: this.currentMode,
                duration: mode.work,
                task: '',
                time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            });
            this.sessionsCompleted++;
            Toast.show(`${mode.label} session complete! Take a break.`, 'success');

            // Also auto-log to time tracking
            const timeCat = this.currentMode === 'study' ? 'study' : 'coding';
            Data.addToCollection('timeLogs', {
                id: Utils.uid(), date: Utils.today(), category: timeCat,
                duration: mode.work, note: `Pomodoro: ${mode.label}`
            });
        } else {
            Toast.show('Break over! Ready for the next session?', 'info');
        }
        this._advancePhase();
    },

    _advancePhase() {
        const mode = this.modes[this.currentMode];
        if (this.currentPhase === 'work') {
            if (this.sessionsCompleted > 0 && this.sessionsCompleted % mode.sessionsBeforeLong === 0) {
                this.currentPhase = 'longBreak';
            } else {
                this.currentPhase = 'shortBreak';
            }
        } else {
            this.currentPhase = 'work';
        }
        this.reset();
    },

    _playSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 800; osc.type = 'sine';
            gain.gain.value = 0.3;
            osc.start(); osc.stop(ctx.currentTime + 0.3);
            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2); gain2.connect(ctx.destination);
                osc2.frequency.value = 1000; osc2.type = 'sine';
                gain2.gain.value = 0.3;
                osc2.start(); osc2.stop(ctx.currentTime + 0.3);
            }, 350);
        } catch (e) { }
    },

    _renderChart(weekDays, history) {
        const ctx = document.getElementById('pomoChart');
        if (!ctx) return;
        const data = weekDays.map(d => history.filter(h => h.date === d).reduce((s, h) => s + h.duration, 0));
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: weekDays.map(d => Utils.formatDateShort(d)),
                datasets: [{ label: 'Focus Minutes', data, backgroundColor: '#6366f1', borderRadius: 4 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#55556a' }, grid: { display: false } },
                    y: { ticks: { color: '#55556a' }, grid: { color: '#1e1e2e' } }
                }
            }
        });
    }
};
