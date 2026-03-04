/* ============================================
   PERSONAL OS — Interactive Tour Guide
   One-time onboarding walkthrough
   ============================================ */

const Tour = {
    currentStep: 0,
    overlay: null,
    tooltip: null,
    spotlight: null,

    steps: [
        {
            title: '👋 Welcome to Personal OS!',
            text: 'Your all-in-one performance tracking system. This quick tour will show you how to use every feature to maximize your growth. Let\'s go!',
            target: null, // center screen
            position: 'center'
        },
        {
            title: '📊 Dashboard — Your Control Center',
            text: 'This is your daily command center. See your active phase, discipline score, habits status, and quick actions — all at a glance.',
            target: '[data-page="dashboard"]',
            position: 'right',
            action: () => { window.location.hash = 'dashboard'; }
        },
        {
            title: '◫ Phases — Your Growth Roadmap',
            text: 'Phases are 2-month blocks with clear objectives. Set goals like "Complete 2 coding projects" and track your progress against deadlines.',
            target: '[data-page="phases"]',
            position: 'right',
            action: () => { window.location.hash = 'phases'; }
        },
        {
            title: '◩ Habits — Daily Consistency',
            text: 'Check off habits every day to build streaks. Categories include Health, Coding, Acting, Academics, and Discipline. Consistency is king!',
            target: '[data-page="habits"]',
            position: 'right',
            action: () => { window.location.hash = 'habits'; }
        },
        {
            title: '◧ Skills — Log Your Training',
            text: 'Log practice sessions with category, duration, and intensity. Track your skill growth over time with visual charts.',
            target: '[data-page="skills"]',
            position: 'right',
            action: () => { window.location.hash = 'skills'; }
        },
        {
            title: '◨ Academics — Chapter Tracker',
            text: 'Track chapter completion, test scores, revision counts, and weak topics for each subject. Stay on top of your studies.',
            target: '[data-page="academics"]',
            position: 'right',
            action: () => { window.location.hash = 'academics'; }
        },
        {
            title: '◴ Time Tracking — Log Every Hour',
            text: 'Log time blocks with category and duration. See daily/weekly totals and understand where your hours go. Deep work vs distraction analysis.',
            target: '[data-page="time"]',
            position: 'right',
            action: () => { window.location.hash = 'time'; }
        },
        {
            title: '⏱ Pomodoro — Focus Timer',
            text: 'Use 25-minute focused work sessions with short breaks. Start the timer, lock in, and get work done. Tracks total sessions completed.',
            target: '[data-page="pomodoro"]',
            position: 'right',
            action: () => { window.location.hash = 'pomodoro'; }
        },
        {
            title: '☐ Tasks — Daily To-Do',
            text: 'Create tasks with priority levels and due dates. Check them off as you go. Simple, focused task management.',
            target: '[data-page="tasks"]',
            position: 'right',
            action: () => { window.location.hash = 'tasks'; }
        },
        {
            title: '◳ Reports — Weekly Analysis',
            text: 'See your performance over 7/14/30 days. Trends, charts, and breakdowns help you identify what\'s working and what needs fixing.',
            target: '[data-page="reports"]',
            position: 'right',
            action: () => { window.location.hash = 'reports'; }
        },
        {
            title: '⚙ Settings — Configure & Sync',
            text: 'Adjust scoring weights, time targets, and burnout thresholds. Export/import data, and sign in with Google to sync across devices.',
            target: '[data-page="settings"]',
            position: 'right',
            action: () => { window.location.hash = 'settings'; }
        },
        {
            title: '☁ Sign In with Google',
            text: 'Click this button to sign in with your Google account. Your data will sync to the cloud so you never lose progress, even across devices!',
            target: '#google-signin-btn',
            position: 'top'
        },
        {
            title: '🚀 You\'re All Set!',
            text: 'Start by checking off today\'s habits on the Dashboard. Log your time, track your skills, and watch your discipline score grow. Consistency beats perfection!',
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
        this._createElements();
        this._showStep();
    },

    _createElements() {
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
                <div class="tour-dots">
                    ${this.steps.map((_, i) =>
                `<span class="tour-dot ${i === this.currentStep ? 'active' : ''}" onclick="Tour.goTo(${i})"></span>`
            ).join('')}
                </div>
            `;

            // Position tooltip
            this._positionTooltip(target, step.position);

            // Animate in
            this.tooltip.classList.add('visible');
        }, 150);
    },

    _positionTooltip(target, position) {
        const tooltip = this.tooltip;
        tooltip.classList.remove('visible');

        if (!target || position === 'center') {
            // Center on screen
            tooltip.style.left = '50%';
            tooltip.style.top = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const rect = target.getBoundingClientRect();
        const tooltipRect = { width: 380, height: 220 };
        const gap = 16;

        // Reset transform
        tooltip.style.transform = 'none';

        switch (position) {
            case 'right':
                tooltip.style.left = (rect.right + gap) + 'px';
                tooltip.style.top = Math.max(20, rect.top - 10) + 'px';
                // If tooltip goes off-screen right, position below instead
                if (rect.right + gap + tooltipRect.width > window.innerWidth) {
                    tooltip.style.left = Math.max(20, rect.left) + 'px';
                    tooltip.style.top = (rect.bottom + gap) + 'px';
                }
                break;
            case 'bottom':
                tooltip.style.left = Math.max(20, rect.left) + 'px';
                tooltip.style.top = (rect.bottom + gap) + 'px';
                break;
            case 'top':
                tooltip.style.left = Math.max(20, rect.left) + 'px';
                tooltip.style.top = Math.max(20, rect.top - tooltipRect.height - gap) + 'px';
                // If tooltip goes off-screen top, position to the right
                if (rect.top - tooltipRect.height - gap < 20) {
                    tooltip.style.left = (rect.right + gap) + 'px';
                    tooltip.style.top = Math.max(20, rect.top) + 'px';
                }
                break;
            case 'left':
                tooltip.style.left = Math.max(20, rect.left - tooltipRect.width - gap) + 'px';
                tooltip.style.top = Math.max(20, rect.top - 10) + 'px';
                break;
        }
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
        if (this.overlay) this.overlay.remove();
        if (this.tooltip) this.tooltip.remove();
        this.overlay = null;
        this.tooltip = null;
        this.spotlight = null;
        window.location.hash = 'dashboard';
        Toast.show('Tour complete! Start tracking your performance 💪', 'success');
    },

    // Reset tour (can be called from settings)
    reset() {
        localStorage.removeItem('pos_tourCompleted');
        Toast.show('Tour reset! It will show on next reload.', 'info');
    }
};
