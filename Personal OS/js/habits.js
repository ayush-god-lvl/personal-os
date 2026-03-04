/* ============================================
   PERSONAL OS — Habit Tracking System
   ============================================ */

const HabitsPage = {
    activeCategory: 'all',

    render() {
        const habits = Data.getCollection('habits');
        const today = Utils.today();
        const categories = ['all', 'health', 'coding', 'acting', 'academics', 'discipline'];

        let html = `
            <div class="page-header flex-between">
                <div>
                    <h1>Habit Tracker</h1>
                    <p>Daily and weekly habit tracking with streak analytics.</p>
                </div>
                <button class="btn btn-primary" onclick="HabitsPage.showAddForm()">+ New Habit</button>
            </div>
        `;

        // Category tabs
        html += `<div class="tabs">`;
        categories.forEach(cat => {
            const label = cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1);
            html += `<button class="tab ${this.activeCategory === cat ? 'active' : ''}" onclick="HabitsPage.setCategory('${cat}')">${label}</button>`;
        });
        html += `</div>`;

        // Filter habits
        const filtered = this.activeCategory === 'all' ? habits : habits.filter(h => h.category === this.activeCategory);

        if (filtered.length === 0) {
            html += `<div class="card"><div class="empty-state">
                <div class="empty-state-icon">◩</div>
                <p>No habits${this.activeCategory !== 'all' ? ' in this category' : ''}. Add one to start tracking.</p>
            </div></div>`;
        }

        // Overview stats
        const dailyHabits = habits.filter(h => h.frequency === 'daily');
        const doneToday = dailyHabits.filter(h => h.completions && h.completions.includes(today)).length;
        const last30 = Utils.lastNDays(30);
        const totalPossible30 = dailyHabits.length * 30;
        const totalDone30 = dailyHabits.reduce((s, h) => s + (h.completions || []).filter(d => last30.includes(d)).length, 0);

        html += `<div class="grid-4 mb-20">
            <div class="stat-block">
                <div class="stat-label">Today</div>
                <div class="stat-value">${doneToday}/${dailyHabits.length}</div>
                <div class="stat-sub">habits completed</div>
            </div>
            <div class="stat-block">
                <div class="stat-label">30-Day Consistency</div>
                <div class="stat-value ${Utils.scoreColorClass(Utils.percentage(totalDone30, totalPossible30))}">${Utils.percentage(totalDone30, totalPossible30)}%</div>
            </div>
            <div class="stat-block">
                <div class="stat-label">Total Habits</div>
                <div class="stat-value">${habits.length}</div>
            </div>
            <div class="stat-block">
                <div class="stat-label">Best Streak</div>
                <div class="stat-value">${Math.max(0, ...habits.map(h => Utils.bestStreak(h.completions || [])))}</div>
                <div class="stat-sub">days</div>
            </div>
        </div>`;

        // Habit cards
        filtered.forEach(h => {
            const completions = h.completions || [];
            const done = completions.includes(today);
            const streak = Utils.calculateStreak(completions);
            const best = Utils.bestStreak(completions);
            const last30Completions = completions.filter(d => last30.includes(d)).length;
            const consistency = h.frequency === 'daily' ? Utils.percentage(last30Completions, 30) : Utils.percentage(last30Completions, 4);
            const missed = h.frequency === 'daily' ? 30 - last30Completions : 4 - last30Completions;

            html += `
            <div class="card">
                <div class="flex-between mb-10">
                    <div class="flex-gap">
                        <div class="check-item ${done ? 'checked' : ''}" onclick="HabitsPage.toggleHabit('${h.id}')" style="padding:0;">
                            <div class="check-box">${done ? '✓' : ''}</div>
                        </div>
                        <div>
                            <strong style="font-size:15px;">${h.name}</strong>
                            <div class="text-muted" style="font-size:11px;">${h.minRequirement} · ${h.frequency}</div>
                        </div>
                    </div>
                    <div class="flex-gap">
                        <span class="tag tag-${h.category}">${h.category}</span>
                        <button class="btn btn-secondary btn-sm" onclick="HabitsPage.showEditForm('${h.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="HabitsPage.deleteHabit('${h.id}')">×</button>
                    </div>
                </div>
                <div class="grid-4">
                    <div class="stat-block">
                        <div class="stat-label">Current Streak</div>
                        <div class="stat-value ${Utils.scoreColorClass(streak > 0 ? 70 : 30)}">${streak}</div>
                        <div class="stat-sub">days</div>
                    </div>
                    <div class="stat-block">
                        <div class="stat-label">Best Streak</div>
                        <div class="stat-value">${best}</div>
                        <div class="stat-sub">days</div>
                    </div>
                    <div class="stat-block">
                        <div class="stat-label">Consistency</div>
                        <div class="stat-value ${Utils.scoreColorClass(consistency)}">${consistency}%</div>
                        <div class="stat-sub">30 days</div>
                    </div>
                    <div class="stat-block">
                        <div class="stat-label">Missed</div>
                        <div class="stat-value ${missed > 10 ? 'text-red' : ''}">${missed}</div>
                        <div class="stat-sub">days (30d)</div>
                    </div>
                </div>

                <div class="mt-10">
                    <div class="stat-label mb-10">Last 28 Days</div>
                    <div class="heatmap">
                        ${Utils.lastNDays(28).map(d => {
                const isDone = completions.includes(d);
                const level = isDone ? 'l4' : '';
                return `<div class="heatmap-cell ${level}" title="${Utils.formatDateShort(d)}${isDone ? ' ✓' : ''}"></div>`;
            }).join('')}
                    </div>
                </div>
            </div>`;
        });

        document.getElementById('content').innerHTML = html;
    },

    setCategory(cat) {
        this.activeCategory = cat;
        this.render();
    },

    toggleHabit(id) {
        const habits = Data.getCollection('habits');
        const today = Utils.today();
        const habit = habits.find(h => h.id === id);
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

    showAddForm() {
        this._showForm(null);
    },

    showEditForm(id) {
        const h = Data.findInCollection('habits', id);
        if (h) this._showForm(h);
    },

    _showForm(habit) {
        const isEdit = !!habit;
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'habitModal';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-title">${isEdit ? 'Edit Habit' : 'New Habit'}</div>
                <div class="form-group">
                    <label class="form-label">Habit Name</label>
                    <input class="form-input" id="habitName" value="${habit ? habit.name : ''}" placeholder="e.g. Morning Workout">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select class="form-select" id="habitCat">
                            ${['health', 'coding', 'acting', 'academics', 'discipline'].map(c =>
            `<option value="${c}" ${habit && habit.category === c ? 'selected' : ''}>${c.charAt(0).toUpperCase() + c.slice(1)}</option>`
        ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Frequency</label>
                        <select class="form-select" id="habitFreq">
                            <option value="daily" ${habit && habit.frequency === 'daily' ? 'selected' : ''}>Daily</option>
                            <option value="weekly" ${habit && habit.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Minimum Requirement</label>
                    <input class="form-input" id="habitMin" value="${habit ? habit.minRequirement : ''}" placeholder="e.g. 30 min exercise">
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="document.getElementById('habitModal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="HabitsPage.saveHabit('${isEdit ? habit.id : ''}')">${isEdit ? 'Update' : 'Add'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    },

    saveHabit(existingId) {
        const name = document.getElementById('habitName').value.trim();
        const category = document.getElementById('habitCat').value;
        const frequency = document.getElementById('habitFreq').value;
        const minRequirement = document.getElementById('habitMin').value.trim();

        if (!name) return alert('Habit name is required.');

        if (existingId) {
            Data.updateInCollection('habits', existingId, { name, category, frequency, minRequirement });
        } else {
            Data.addToCollection('habits', { id: Utils.uid(), name, category, frequency, minRequirement, completions: [] });
        }

        document.getElementById('habitModal').remove();
        this.render();
    },

    deleteHabit(id) {
        if (confirm('Delete this habit?')) {
            Data.removeFromCollection('habits', id);
            this.render();
        }
    }
};
