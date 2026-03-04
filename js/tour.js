/* ============================================
   PERSONAL OS — Interactive Tour Guide
   Deep onboarding walkthrough with per-page instructions
   ============================================ */

const Tour = {
    currentStep: 0,
    overlay: null,
    tooltip: null,
    spotlight: null,
    isActive: false,

    steps: [
        // --- WELCOME ---
        {
            title: '👋 Welcome to Personal OS!',
            text: 'This is your personal performance operating system — a command center to track habits, time, skills, academics, tasks, and your overall discipline score.<br><br>This tour will walk you through <strong>every feature</strong> and show you exactly how to use it. Let\'s begin!',
            target: null,
            position: 'center'
        },

        // --- DASHBOARD ---
        {
            title: '📊 Dashboard — Your Command Center',
            text: 'The Dashboard shows everything at a glance:<br>• <strong>Active Phase</strong> with progress %<br>• <strong>Daily habits</strong> — check them off right here<br>• <strong>Discipline Score</strong> out of 100<br>• <strong>Hours logged</strong>, deep work vs distractions<br>• <strong>Active Tasks</strong> with priority indicators<br>• <strong>Daily Notes</strong> for reflections<br><br>💡 <em>Tip: Check off habits directly from the Dashboard!</em>',
            target: '[data-page="dashboard"]',
            position: 'right',
            action: () => { window.location.hash = 'dashboard'; }
        },
        {
            title: '⚡ Quick Actions',
            text: 'At the bottom of the Dashboard, you\'ll find <strong>Quick Action</strong> buttons:<br>• <strong>⏱ Start Focus Session</strong> — launches Pomodoro<br>• <strong>☐ Add Task</strong> — creates a task instantly<br>• <strong>◴ Log Time</strong> — log a time entry<br>• <strong>◧ Log Skill</strong> — record a skill metric<br><br>💡 <em>Use these shortcuts to stay fast!</em>',
            target: null,
            position: 'center',
            action: () => { window.location.hash = 'dashboard'; }
        },

        // --- PHASES ---
        {
            title: '◫ Phases — Your Growth Roadmap',
            text: 'Phases are <strong>2-month goal blocks</strong>. Each phase has:<br>• A name (e.g., "Foundation")<br>• Start & end dates<br>• Clear <strong>objectives</strong> (one per line)<br>• <strong>Success metrics</strong> to measure results<br>• <strong>Skill targets</strong> (e.g., "Pushups: 30")<br><br>📌 <em>Only one phase should be active at a time.</em>',
            target: '[data-page="phases"]',
            position: 'right',
            action: () => { window.location.hash = 'phases'; }
        },
        {
            title: '➕ How to Create a Phase',
            text: 'Click the <strong>"+ New Phase"</strong> button in the top right to create your first phase.<br><br><strong>Fill in:</strong><br>1. Phase name (e.g., "Foundation")<br>2. Start and end dates (60 days recommended)<br>3. Objectives — list your goals, one per line<br>4. Success metrics — how will you know you succeeded?<br>5. Skill targets — concrete numbers to hit<br><br>💡 <em>Edit or delete phases anytime with the Edit/× buttons.</em>',
            target: '.btn-primary',
            position: 'bottom',
            action: () => { window.location.hash = 'phases'; }
        },

        // --- HABITS ---
        {
            title: '◩ Habits — Daily Consistency Engine',
            text: 'This is where you build discipline. Each habit has:<br>• <strong>Category</strong>: Health, Coding, Acting, Academics, Discipline<br>• <strong>Frequency</strong>: Daily or Weekly<br>• <strong>Minimum requirement</strong> (e.g., "30 min exercise")<br>• <strong>Streak counter</strong> and <strong>28-day heatmap</strong><br>• <strong>30-day consistency %</strong><br><br>📌 <em>Consistency beats perfection. Check off every day!</em>',
            target: '[data-page="habits"]',
            position: 'right',
            action: () => { window.location.hash = 'habits'; }
        },
        {
            title: '✅ How to Track Habits',
            text: 'To check off a habit, <strong>click the checkbox</strong> next to its name.<br><br>To add a new habit, click <strong>"+ New Habit"</strong> and set:<br>1. Habit name (e.g., "Morning Workout")<br>2. Category (Health, Coding, etc.)<br>3. Frequency (Daily or Weekly)<br>4. Minimum requirement<br><br>💡 <em>Use the category tabs (All, Health, Coding...) to filter your view!</em>',
            target: null,
            position: 'center',
            action: () => { window.location.hash = 'habits'; }
        },

        // --- SKILLS ---
        {
            title: '◧ Skills — Quantitative Progress',
            text: 'Track <strong>measurable skill metrics</strong> over time:<br><br><strong>Health:</strong> Weight, Push-ups Max, Pull-ups, 1km Run Time, Waist<br><strong>Programming:</strong> Projects Done, Hours Logged, GitHub Commits<br><strong>Acting:</strong> Videos Uploaded, Practice Days, Voice Control<br><strong>Academic:</strong> Chapters Done, Mock Score %, Revision Cycles<br><br>📌 <em>Log entries regularly to see charts track your growth!</em>',
            target: '[data-page="skills"]',
            position: 'right',
            action: () => { window.location.hash = 'skills'; }
        },
        {
            title: '📈 How to Log Skills',
            text: 'Click <strong>"+ Log Entry"</strong> to record a skill metric:<br>1. Set the <strong>date</strong><br>2. Choose a <strong>category</strong> (Health, Programming, etc.)<br>3. Select the <strong>metric</strong> (e.g., Push-ups Max)<br>4. Enter the <strong>value</strong><br><br>💡 <em>Switch between tabs to see progress charts for each category!</em>',
            target: null,
            position: 'center',
            action: () => { window.location.hash = 'skills'; }
        },

        // --- ACADEMICS ---
        {
            title: '◨ Academics — Chapter Tracker',
            text: 'Track your academic progress by <strong>subject and chapter</strong>:<br>• Mark chapters as <strong>completed ✓</strong><br>• Record <strong>test scores</strong> for each chapter<br>• Track <strong>revision count</strong><br>• Log <strong>difficulty level</strong> (1-5)<br>• Flag <strong>weak topics</strong> that need extra work<br><br>📌 <em>Subjects like Math, Science, English, Social Science are pre-loaded.</em>',
            target: '[data-page="academics"]',
            position: 'right',
            action: () => { window.location.hash = 'academics'; }
        },

        // --- TIME TRACKING ---
        {
            title: '◴ Time Tracking — Where Your Hours Go',
            text: 'Log every hour of productive (and unproductive) time:<br>• <strong>Categories:</strong> Study, Coding, Acting, Training, Distraction<br>• See your <strong>daily efficiency %</strong><br>• <strong>Pie chart</strong> showing time distribution<br>• <strong>7-day breakdown table</strong><br>• <strong>Overload warning</strong> if you exceed your daily limit<br><br>📌 <em>This data feeds directly into your Discipline Score!</em>',
            target: '[data-page="time"]',
            position: 'right',
            action: () => { window.location.hash = 'time'; }
        },
        {
            title: '⏰ How to Log Time',
            text: 'Click <strong>"+ Log Time"</strong> to add a time block:<br>1. Select the <strong>date</strong><br>2. Choose a <strong>category</strong> (Study, Coding, etc.)<br>3. Enter <strong>hours</strong> and <strong>minutes</strong><br>4. Add an optional <strong>note</strong> about what you worked on<br><br>💡 <em>"Distraction" time reduces your Discipline Score. Be honest!</em>',
            target: null,
            position: 'center',
            action: () => { window.location.hash = 'time'; }
        },

        // --- POMODORO ---
        {
            title: '⏱ Pomodoro — Focus Timer',
            text: 'Use structured focus sessions to crush procrastination:<br><br><strong>3 modes:</strong><br>• 🟣 <strong>Deep Focus</strong>: 50 min work / 10 min break<br>• 🟢 <strong>Work Sprint</strong>: 25 min work / 5 min break<br>• 🟣 <strong>Study Session</strong>: 45 min work / 10 min break<br><br>After completing sessions, you get a <strong>long break</strong>.<br>Sessions are <strong>auto-logged</strong> to Time Tracking!<br><br>📌 <em>Customize timers in the Settings section at the bottom.</em>',
            target: '[data-page="pomodoro"]',
            position: 'right',
            action: () => { window.location.hash = 'pomodoro'; }
        },
        {
            title: '▶ How to Use Pomodoro',
            text: '<strong>Step by step:</strong><br>1. Choose a mode by clicking it (Focus/Sprint/Study)<br>2. Press <strong>▶ Start</strong> to begin the timer<br>3. Work until the timer ends (bell sound plays)<br>4. Take your break, then repeat<br>5. After 3-4 sessions, take a long break<br><br>💡 <em>The ⏸ Pause, ↺ Reset, and ⏭ Skip buttons give you full control!</em>',
            target: null,
            position: 'center',
            action: () => { window.location.hash = 'pomodoro'; }
        },

        // --- TASKS ---
        {
            title: '☐ Tasks — Your To-Do System',
            text: 'Manage all your action items with priorities:<br>• <strong>Priority levels:</strong> High (red), Medium (yellow), Low (green)<br>• <strong>Categories:</strong> Coding, Study, Acting, Health, Personal<br>• <strong>Due dates</strong> with overdue warnings<br>• <strong>Subtasks</strong> — break big tasks into steps<br>• <strong>Filter</strong> by Active/Completed/All<br><br>📌 <em>Overdue tasks show a red warning banner!</em>',
            target: '[data-page="tasks"]',
            position: 'right',
            action: () => { window.location.hash = 'tasks'; }
        },
        {
            title: '➕ How to Create Tasks',
            text: 'Click <strong>"+ New Task"</strong> to add a task:<br>1. Title — what needs to be done?<br>2. Description (optional details)<br>3. Priority — High, Medium, or Low<br>4. Category — Coding, Study, etc.<br>5. Due date — when is the deadline?<br>6. Subtasks — break it down (one per line)<br><br>💡 <em>Click the checkbox to mark tasks complete. They\'ll move to the Completed tab!</em>',
            target: null,
            position: 'center',
            action: () => { window.location.hash = 'tasks'; }
        },

        // --- REPORTS ---
        {
            title: '◳ Reports — Your Performance Analysis',
            text: 'Review your performance across 7, 14, or 30-day periods:<br>• <strong>Habit consistency trends</strong><br>• <strong>Time distribution charts</strong><br>• <strong>Discipline score trends</strong><br>• <strong>Category breakdowns</strong><br><br>💡 <em>Check Reports weekly to see what\'s working and what needs fixing!</em>',
            target: '[data-page="reports"]',
            position: 'right',
            action: () => { window.location.hash = 'reports'; }
        },

        // --- SETTINGS ---
        {
            title: '⚙ Settings — Customize Everything',
            text: 'Fine-tune your system:<br>• <strong>Waking hours</strong> & <strong>daily time target</strong><br>• <strong>Scoring weights</strong> (how habits/deep work/training contribute to your score)<br>• <strong>Overload limit</strong> & <strong>burnout threshold</strong><br>• <strong>Data management</strong>: backup, restore, export CSV<br>• <strong>Cloud Sync</strong>: sign in with Google to sync across devices<br>• <strong>Tour</strong>: restart this guide anytime!<br><br>📌 <em>Scoring weights must total 100%.</em>',
            target: '[data-page="settings"]',
            position: 'right',
            action: () => { window.location.hash = 'settings'; }
        },

        // --- SIGN IN ---
        {
            title: '☁ Cloud Sync with Google',
            text: 'Click <strong>"Sign in with Google"</strong> to:<br>• <strong>Backup all data</strong> to the cloud automatically<br>• <strong>Sync across devices</strong> — phone, laptop, anywhere<br>• <strong>Never lose data</strong> even if you clear your browser<br><br>After signing in, your profile appears in the sidebar and data syncs in real-time.<br><br>💡 <em>You can also manually Force Sync or Pull from Cloud in Settings!</em>',
            target: '#google-signin-btn',
            position: 'top'
        },

        // --- DISCIPLINE SCORE ---
        {
            title: '🧠 Understanding Your Discipline Score',
            text: 'Your score is calculated from 4 factors:<br><br>• <strong>Habits (40%)</strong> — % of daily habits completed<br>• <strong>Deep Work (25%)</strong> — coding + study hours (3h = 100%)<br>• <strong>Training (20%)</strong> — physical training (45min = 100%)<br>• <strong>No Distraction (15%)</strong> — 0 min distraction = 100%<br><br>These weights are customizable in Settings!<br><br>📌 <em>Score > 70 = 🟢 Great | 40-70 = 🟡 Needs work | < 40 = 🔴 Danger zone</em>',
            target: null,
            position: 'center'
        },

        // --- FINAL ---
        {
            title: '🚀 You\'re Ready to Go!',
            text: '<strong>Your daily workflow:</strong><br><br>1. ☐ Open Dashboard → check off today\'s habits<br>2. ⏱ Start a Pomodoro focus session<br>3. ◴ Log your time after each session<br>4. ☐ Create tasks for tomorrow<br>5. 📊 Check Reports every Sunday<br><br><strong>Remember:</strong> Consistency beats perfection.<br>Small daily wins compound into massive results. 💪<br><br>💡 <em>You can restart this tour anytime from Settings → 🎯 Start Tour</em>',
            target: null,
            position: 'center',
            action: () => { window.location.hash = 'dashboard'; }
        }
    ],

    shouldShow() {
        return !localStorage.getItem('pos_tourCompleted');
    },

    start() {
        this.currentStep = 0;
        this.isActive = true;
        this._createElements();
        this._showStep();
    },

    _createElements() {
        // Remove any existing tour elements
        document.querySelectorAll('.tour-overlay, .tour-tooltip').forEach(el => el.remove());

        // Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'tour-overlay';
        this.overlay.id = 'tourOverlay';

        // Spotlight cutout
        this.spotlight = document.createElement('div');
        this.spotlight.className = 'tour-spotlight';

        // Tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tour-tooltip';

        this.overlay.appendChild(this.spotlight);
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.tooltip);

        // Hide FAB during tour
        const fab = document.querySelector('.tour-fab');
        if (fab) fab.style.display = 'none';
    },

    _showStep() {
        const step = this.steps[this.currentStep];
        if (!step) return this.end();

        // Run action (like navigating to a page)
        if (step.action) step.action();

        // Small delay to let the page render
        setTimeout(() => {
            const target = step.target ? document.querySelector(step.target) : null;

            // Position spotlight
            if (target) {
                const rect = target.getBoundingClientRect();
                const padding = 8;
                this.spotlight.style.display = 'block';
                this.spotlight.style.left = (rect.left - padding) + 'px';
                this.spotlight.style.top = (rect.top - padding) + 'px';
                this.spotlight.style.width = (rect.width + padding * 2) + 'px';
                this.spotlight.style.height = (rect.height + padding * 2) + 'px';
            } else {
                this.spotlight.style.display = 'none';
            }

            // Build tooltip content
            const isLast = this.currentStep === this.steps.length - 1;
            const isFirst = this.currentStep === 0;
            this.tooltip.innerHTML = `
                <div class="tour-step-badge">Step ${this.currentStep + 1} of ${this.steps.length}</div>
                <div class="tour-title">${step.title}</div>
                <div class="tour-text">${step.text}</div>
                <div class="tour-actions">
                    <button class="tour-btn tour-btn-skip" onclick="Tour.end()">
                        ${isLast ? '' : 'Skip Tour'}
                    </button>
                    <div class="tour-nav">
                        ${!isFirst ? '<button class="tour-btn tour-btn-back" onclick="Tour.prev()">← Back</button>' : ''}
                        <button class="tour-btn tour-btn-next" onclick="Tour.next()">
                            ${isLast ? 'Get Started! 🚀' : 'Next →'}
                        </button>
                    </div>
                </div>
                <div class="tour-progress">
                    <div class="tour-progress-fill" style="width:${((this.currentStep + 1) / this.steps.length) * 100}%"></div>
                </div>
            `;

            // Position tooltip
            this._positionTooltip(target, step.position);

            // Animate in
            this.tooltip.classList.add('visible');
        }, 200);
    },

    _positionTooltip(target, position) {
        const tooltip = this.tooltip;
        tooltip.classList.remove('visible');

        if (!target || position === 'center') {
            tooltip.style.left = '50%';
            tooltip.style.top = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const rect = target.getBoundingClientRect();
        const gap = 16;
        const margin = 20;

        tooltip.style.transform = 'none';

        // Calculate initial position
        let left, top;

        switch (position) {
            case 'right':
                left = rect.right + gap;
                top = rect.top - 10;
                break;
            case 'bottom':
                left = rect.left;
                top = rect.bottom + gap;
                break;
            case 'top':
                left = rect.left;
                top = rect.top - tooltip.offsetHeight - gap;
                break;
            case 'left':
                left = rect.left - tooltip.offsetWidth - gap;
                top = rect.top - 10;
                break;
        }

        // Clamp to viewport
        const maxLeft = window.innerWidth - tooltip.offsetWidth - margin;
        const maxTop = window.innerHeight - tooltip.offsetHeight - margin;
        left = Math.max(margin, Math.min(left, maxLeft));
        top = Math.max(margin, Math.min(top, maxTop));

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    },

    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this._showStep();
        } else {
            this.end();
        }
    },

    prev() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this._showStep();
        }
    },

    goTo(step) {
        this.currentStep = step;
        this._showStep();
    },

    end() {
        localStorage.setItem('pos_tourCompleted', 'true');
        this.isActive = false;
        if (this.overlay) this.overlay.remove();
        if (this.tooltip) this.tooltip.remove();
        this.overlay = null;
        this.tooltip = null;
        this.spotlight = null;

        // Show FAB again
        const fab = document.querySelector('.tour-fab');
        if (fab) fab.style.display = '';

        window.location.hash = 'dashboard';
        Toast.show('Tour complete! Start tracking your performance 💪', 'success');
    },

    reset() {
        localStorage.removeItem('pos_tourCompleted');
        Toast.show('Tour reset! Refreshing...', 'info');
        setTimeout(() => location.reload(), 500);
    }
};
