/* ============================================
   PERSONAL OS — Utility Functions
   ============================================ */

const Utils = {
    // --- Date Helpers ---
    today() {
        return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    },

    formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    formatDateShort(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    },

    daysBetween(startStr, endStr) {
        const s = new Date(startStr + 'T00:00:00');
        const e = new Date(endStr + 'T00:00:00');
        return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    },

    daysRemaining(endStr) {
        return Math.max(0, this.daysBetween(this.today(), endStr));
    },

    daysPassed(startStr) {
        return Math.max(0, this.daysBetween(startStr, this.today()));
    },

    isWithinRange(dateStr, startStr, endStr) {
        return dateStr >= startStr && dateStr <= endStr;
    },

    // Last N days as array of YYYY-MM-DD
    lastNDays(n) {
        const days = [];
        for (let i = n - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }
        return days;
    },

    getWeekStart(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return d.toISOString().split('T')[0];
    },

    // --- Math ---
    percentage(part, total) {
        if (total === 0) return 0;
        return Math.round((part / total) * 100);
    },

    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },

    average(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    },

    // --- Color Coding ---
    scoreColor(score) {
        if (score >= 70) return 'green';
        if (score >= 40) return 'yellow';
        return 'red';
    },

    scoreColorClass(score) {
        return 'text-' + this.scoreColor(score);
    },

    badgeClass(score) {
        return 'badge-' + this.scoreColor(score);
    },

    progressClass(pct) {
        return this.scoreColor(pct);
    },

    // --- ID Generation ---
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    },

    // --- DOM Helpers ---
    el(id) {
        return document.getElementById(id);
    },

    render(containerId, html) {
        const container = document.getElementById(containerId) || document.querySelector(containerId);
        if (container) container.innerHTML = html;
    },

    // --- Formatting ---
    plural(n, singular, plural) {
        return n === 1 ? singular : (plural || singular + 's');
    },

    hoursDisplay(mins) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;
        return `${h}h ${m}m`;
    },

    // --- Streak ---
    calculateStreak(completionDates) {
        if (!completionDates || completionDates.length === 0) return 0;
        const sorted = [...completionDates].sort().reverse();
        const today = this.today();
        const yesterday = this.lastNDays(2)[0];

        // Must include today or yesterday to have active streak
        if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

        let streak = 1;
        for (let i = 0; i < sorted.length - 1; i++) {
            const diff = this.daysBetween(sorted[i + 1], sorted[i]);
            if (diff === 1) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    },

    bestStreak(completionDates) {
        if (!completionDates || completionDates.length === 0) return 0;
        const sorted = [...new Set(completionDates)].sort();
        let best = 1, current = 1;
        for (let i = 1; i < sorted.length; i++) {
            if (this.daysBetween(sorted[i - 1], sorted[i]) === 1) {
                current++;
                best = Math.max(best, current);
            } else {
                current = 1;
            }
        }
        return best;
    },
};
