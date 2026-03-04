/* ============================================
   PERSONAL OS — App Router & Initialization
   ============================================ */

const App = {
    pages: {
        dashboard: DashboardPage,
        phases: PhasesPage,
        habits: HabitsPage,
        skills: SkillsPage,
        academics: AcademicsPage,
        time: TimePage,
        pomodoro: PomodoroPage,
        tasks: TasksPage,
        reports: ReportsPage,
        settings: SettingsPage,
    },

    init() {
        Data.initDefaults();
        Toast.init();
        Auth.init();
        Shortcuts.init();
        this.setupRouter();

        // Dismiss splash after animation, then launch tour
        setTimeout(() => {
            const splash = document.getElementById('splash');
            if (splash) {
                splash.classList.add('hide');
                setTimeout(() => {
                    splash.remove();
                    // Launch tour for first-time users
                    if (Tour.shouldShow()) {
                        setTimeout(() => Tour.start(), 400);
                    }
                }, 600);
            }
        }, 2600);

        this.navigate(this.getCurrentPage());
    },

    getCurrentPage() {
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        return this.pages[hash] ? hash : 'dashboard';
    },

    setupRouter() {
        window.addEventListener('hashchange', () => {
            this.navigate(this.getCurrentPage());
        });
    },

    navigate(pageName) {
        // Update nav active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageName);
        });

        // Render page
        const page = this.pages[pageName];
        if (page && typeof page.render === 'function') {
            page.render();
        }

        // Reset title
        document.title = 'Personal OS — Performance Dashboard';

        // Close sidebar on mobile after navigation
        this.closeSidebar();

        // Scroll to top
        document.getElementById('content').scrollTop = 0;
    },

    // Mobile sidebar toggle
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    },

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
    }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
