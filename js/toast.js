/* ============================================
   PERSONAL OS — Toast Notifications
   Replaces browser alerts with elegant toasts
   ============================================ */

const Toast = {
    container: null,

    init() {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
        document.body.appendChild(this.container);
    },

    show(message, type = 'info', duration = 3500) {
        this.init();
        const toast = document.createElement('div');
        const colors = {
            success: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', text: '#22c55e', icon: '✓' },
            warning: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.4)', text: '#eab308', icon: '⚠' },
            error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444', icon: '✕' },
            info: { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.4)', text: '#6366f1', icon: 'ℹ' }
        };
        const c = colors[type] || colors.info;
        toast.style.cssText = `
            background:${c.bg};border:1px solid ${c.border};color:${c.text};
            padding:12px 20px;border-radius:8px;font-size:13px;font-weight:500;
            font-family:var(--font);backdrop-filter:blur(12px);pointer-events:auto;
            display:flex;align-items:center;gap:10px;min-width:280px;max-width:420px;
            opacity:0;transform:translateX(40px);transition:all 0.3s ease;
        `;
        toast.innerHTML = `<span style="font-size:16px;">${c.icon}</span><span>${message}</span>`;
        this.container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(40px)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

/* ============================================
   PERSONAL OS — Keyboard Shortcuts
   ============================================ */

const Shortcuts = {
    init() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

            // Navigation: Alt + number
            if (e.altKey) {
                const pages = ['dashboard', 'phases', 'habits', 'skills', 'academics', 'time', 'pomodoro', 'tasks', 'reports', 'settings'];
                const num = parseInt(e.key);
                if (num >= 1 && num <= pages.length) {
                    e.preventDefault();
                    window.location.hash = pages[num - 1];
                    return;
                }
            }

            // Quick actions
            if (e.key === '?' && !e.ctrlKey) {
                e.preventDefault();
                Shortcuts.showHelp();
            }

            // Space to start/pause Pomodoro when on pomodoro page
            if (e.code === 'Space' && window.location.hash === '#pomodoro') {
                e.preventDefault();
                PomodoroPage.isRunning ? PomodoroPage.pause() : PomodoroPage.start();
            }
        });
    },

    showHelp() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'shortcutModal';
        overlay.innerHTML = `
            <div class="modal" style="width:460px;">
                <div class="modal-title">Keyboard Shortcuts</div>
                <table class="data-table">
                    <tr><td><kbd>Alt+1</kbd></td><td>Dashboard</td></tr>
                    <tr><td><kbd>Alt+2</kbd></td><td>Phases</td></tr>
                    <tr><td><kbd>Alt+3</kbd></td><td>Habits</td></tr>
                    <tr><td><kbd>Alt+4</kbd></td><td>Skills</td></tr>
                    <tr><td><kbd>Alt+5</kbd></td><td>Academics</td></tr>
                    <tr><td><kbd>Alt+6</kbd></td><td>Time Tracking</td></tr>
                    <tr><td><kbd>Alt+7</kbd></td><td>Pomodoro</td></tr>
                    <tr><td><kbd>Alt+8</kbd></td><td>Tasks</td></tr>
                    <tr><td><kbd>Alt+9</kbd></td><td>Reports</td></tr>
                    <tr><td><kbd>Alt+0</kbd></td><td>Settings</td></tr>
                    <tr><td><kbd>Space</kbd></td><td>Start/pause Pomodoro</td></tr>
                    <tr><td><kbd>?</kbd></td><td>Show this help</td></tr>
                </table>
                <div class="modal-actions"><button class="btn btn-secondary" onclick="document.getElementById('shortcutModal').remove()">Close</button></div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    }
};
