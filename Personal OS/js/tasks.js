/* ============================================
   PERSONAL OS — Task Management System
   ============================================ */

const TasksPage = {
    activeFilter: 'active',
    activeCategory: 'all',

    render() {
        const tasks = Data.getCollection('tasks');
        const today = Utils.today();

        const categories = ['all', 'coding', 'study', 'acting', 'health', 'personal'];
        const filters = ['active', 'completed', 'all'];

        // Filter
        let filtered = tasks;
        if (this.activeFilter === 'active') filtered = filtered.filter(t => !t.completed);
        else if (this.activeFilter === 'completed') filtered = filtered.filter(t => t.completed);
        if (this.activeCategory !== 'all') filtered = filtered.filter(t => t.category === this.activeCategory);

        // Sort: priority (high first), then due date (soonest first)
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        filtered.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority];
            if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
            return 0;
        });

        // Stats
        const active = tasks.filter(t => !t.completed);
        const overdue = active.filter(t => t.dueDate && t.dueDate < today);
        const dueToday = active.filter(t => t.dueDate === today);
        const completedToday = tasks.filter(t => t.completed && t.completedDate === today);

        let html = `
            <div class="page-header flex-between">
                <div><h1>Tasks</h1><p>Track action items, deadlines, and priorities.</p></div>
                <button class="btn btn-primary" onclick="TasksPage.showAddForm()">+ New Task</button>
            </div>

            <div class="grid-4 mb-20">
                <div class="stat-block"><div class="stat-label">Active</div><div class="stat-value">${active.length}</div></div>
                <div class="stat-block"><div class="stat-label">Due Today</div>
                    <div class="stat-value ${dueToday.length > 0 ? 'text-yellow' : ''}">${dueToday.length}</div></div>
                <div class="stat-block"><div class="stat-label">Overdue</div>
                    <div class="stat-value ${overdue.length > 0 ? 'text-red' : 'text-green'}">${overdue.length}</div></div>
                <div class="stat-block"><div class="stat-label">Done Today</div>
                    <div class="stat-value text-green">${completedToday.length}</div></div>
            </div>
        `;

        // Filters
        html += `<div class="flex-between mb-20">
            <div class="tabs" style="border:none;margin:0;">
                ${filters.map(f => `<button class="tab ${this.activeFilter === f ? 'active' : ''}" onclick="TasksPage.setFilter('${f}')">${f.charAt(0).toUpperCase() + f.slice(1)}</button>`).join('')}
            </div>
            <div class="flex-gap">
                ${categories.map(c => `<button class="btn btn-sm ${this.activeCategory === c ? 'btn-primary' : 'btn-secondary'}" onclick="TasksPage.setCategory('${c}')">${c === 'all' ? 'All' : c}</button>`).join('')}
            </div>
        </div>`;

        // Overdue warning
        if (overdue.length > 0) {
            html += `<div class="warning-banner">⚠ ${overdue.length} overdue ${Utils.plural(overdue.length, 'task')}! Review and reschedule.</div>`;
        }

        // Task list
        if (filtered.length === 0) {
            html += `<div class="card"><div class="empty-state">
                <div class="empty-state-icon">✓</div>
                <p>${this.activeFilter === 'active' ? 'No active tasks. You\'re all caught up!' : 'No tasks found.'}</p>
                <button class="btn btn-primary" onclick="TasksPage.showAddForm()">Add Task</button>
            </div></div>`;
        } else {
            filtered.forEach(task => {
                const isOverdue = !task.completed && task.dueDate && task.dueDate < today;
                const isDueToday = task.dueDate === today;
                const priorityColors = { high: 'var(--red)', medium: 'var(--yellow)', low: 'var(--green)' };

                html += `
                <div class="card" style="padding:16px 20px;${task.completed ? 'opacity:0.5;' : ''}${isOverdue ? 'border-left:3px solid var(--red);' : ''}">
                    <div class="flex-between">
                        <div class="flex-gap" style="flex:1;">
                            <div class="check-item ${task.completed ? 'checked' : ''}" onclick="TasksPage.toggleTask('${task.id}')" style="padding:0;">
                                <div class="check-box">${task.completed ? '✓' : ''}</div>
                            </div>
                            <div style="flex:1;">
                                <div style="font-size:14px;font-weight:600;${task.completed ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${task.title}</div>
                                ${task.description ? `<div class="text-muted" style="font-size:12px;margin-top:2px;">${task.description}</div>` : ''}
                                <div class="flex-gap mt-10" style="gap:8px;">
                                    <span style="width:8px;height:8px;border-radius:50%;background:${priorityColors[task.priority]};"></span>
                                    <span class="text-muted" style="font-size:11px;">${task.priority}</span>
                                    <span class="tag tag-${task.category === 'personal' ? 'discipline' : task.category}">${task.category}</span>
                                    ${task.dueDate ? `<span class="text-muted" style="font-size:11px;">${isOverdue ? '⚠ ' : ''}${isDueToday ? 'Due today' : Utils.formatDateShort(task.dueDate)}</span>` : ''}
                                    ${task.subtasks && task.subtasks.length > 0 ? `<span class="text-muted" style="font-size:11px;">${task.subtasks.filter(s => s.done).length}/${task.subtasks.length} subtasks</span>` : ''}
                                </div>
                                ${task.subtasks && task.subtasks.length > 0 ? `
                                    <div class="mt-10" style="padding-left:30px;">
                                        ${task.subtasks.map((st, si) => `
                                            <div class="check-item ${st.done ? 'checked' : ''}" onclick="TasksPage.toggleSubtask('${task.id}', ${si})" style="padding:4px 8px;">
                                                <div class="check-box" style="width:14px;height:14px;font-size:9px;">${st.done ? '✓' : ''}</div>
                                                <span class="check-label" style="font-size:12px;">${st.text}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="flex-gap">
                            <button class="btn btn-secondary btn-sm" onclick="TasksPage.showEditForm('${task.id}')">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="TasksPage.deleteTask('${task.id}')">×</button>
                        </div>
                    </div>
                </div>`;
            });
        }

        document.getElementById('content').innerHTML = html;
    },

    setFilter(f) { this.activeFilter = f; this.render(); },
    setCategory(c) { this.activeCategory = c; this.render(); },

    toggleTask(id) {
        const tasks = Data.getCollection('tasks');
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        task.completed = !task.completed;
        task.completedDate = task.completed ? Utils.today() : null;
        Data.set('tasks', tasks);
        if (task.completed) Toast.show(`"${task.title}" completed! ✓`, 'success');
        this.render();
    },

    toggleSubtask(taskId, subIdx) {
        const tasks = Data.getCollection('tasks');
        const task = tasks.find(t => t.id === taskId);
        if (!task || !task.subtasks) return;
        task.subtasks[subIdx].done = !task.subtasks[subIdx].done;
        Data.set('tasks', tasks);
        this.render();
    },

    showAddForm() { this._showForm(null); },
    showEditForm(id) { const t = Data.findInCollection('tasks', id); if (t) this._showForm(t); },

    _showForm(task) {
        const isEdit = !!task;
        const o = document.createElement('div'); o.className = 'modal-overlay'; o.id = 'taskModal';
        o.innerHTML = `<div class="modal">
            <div class="modal-title">${isEdit ? 'Edit Task' : 'New Task'}</div>
            <div class="form-group"><label class="form-label">Title</label>
                <input class="form-input" id="taskTitle" value="${task ? task.title : ''}" placeholder="What needs to be done?"></div>
            <div class="form-group"><label class="form-label">Description (optional)</label>
                <input class="form-input" id="taskDesc" value="${task ? (task.description || '') : ''}" placeholder="Additional details..."></div>
            <div class="form-row-3">
                <div class="form-group"><label class="form-label">Priority</label>
                    <select class="form-select" id="taskPriority">
                        ${['high', 'medium', 'low'].map(p => `<option value="${p}" ${task && task.priority === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select></div>
                <div class="form-group"><label class="form-label">Category</label>
                    <select class="form-select" id="taskCategory">
                        ${['coding', 'study', 'acting', 'health', 'personal'].map(c => `<option value="${c}" ${task && task.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select></div>
                <div class="form-group"><label class="form-label">Due Date</label>
                    <input class="form-input" type="date" id="taskDue" value="${task ? (task.dueDate || '') : ''}"></div>
            </div>
            <div class="form-group"><label class="form-label">Subtasks (one per line)</label>
                <textarea class="form-textarea" id="taskSubs" placeholder="Break it down...">${task && task.subtasks ? task.subtasks.map(s => s.text).join('\n') : ''}</textarea></div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="document.getElementById('taskModal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="TasksPage.saveTask('${isEdit ? task.id : ''}')">${isEdit ? 'Update' : 'Add Task'}</button>
            </div>
        </div>`;
        document.body.appendChild(o);
        o.addEventListener('click', e => { if (e.target === o) o.remove(); });
        document.getElementById('taskTitle').focus();
    },

    saveTask(existingId) {
        const title = document.getElementById('taskTitle').value.trim();
        if (!title) { Toast.show('Title is required', 'warning'); return; }
        const description = document.getElementById('taskDesc').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const category = document.getElementById('taskCategory').value;
        const dueDate = document.getElementById('taskDue').value || null;
        const subsText = document.getElementById('taskSubs').value.split('\n').filter(s => s.trim());

        if (existingId) {
            const tasks = Data.getCollection('tasks');
            const task = tasks.find(t => t.id === existingId);
            const existingSubs = task ? (task.subtasks || []) : [];
            const subtasks = subsText.map(text => {
                const existing = existingSubs.find(s => s.text === text);
                return existing || { text, done: false };
            });
            Data.updateInCollection('tasks', existingId, { title, description, priority, category, dueDate, subtasks });
            Toast.show('Task updated', 'success');
        } else {
            const subtasks = subsText.map(text => ({ text, done: false }));
            Data.addToCollection('tasks', { id: Utils.uid(), title, description, priority, category, dueDate, subtasks, completed: false, completedDate: null, createdDate: Utils.today() });
            Toast.show('Task added!', 'success');
        }
        document.getElementById('taskModal').remove();
        this.render();
    },

    deleteTask(id) {
        if (confirm('Delete this task?')) {
            Data.removeFromCollection('tasks', id);
            this.render();
        }
    }
};
