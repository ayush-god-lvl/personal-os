/* ============================================
   PERSONAL OS — Phase System
   ============================================ */

const PhasesPage = {
    render() {
        const phases = Data.getCollection('phases');
        const today = Utils.today();

        let html = `
            <div class="page-header flex-between">
                <div>
                    <h1>Phase System</h1>
                    <p>Strategic progression phases. Only one active at a time.</p>
                </div>
                <button class="btn btn-primary" onclick="PhasesPage.showAddForm()">+ New Phase</button>
            </div>
        `;

        if (phases.length === 0) {
            html += `<div class="card"><div class="empty-state">
                <div class="empty-state-icon">◫</div>
                <p>No phases defined. Create your first phase to start tracking.</p>
                <button class="btn btn-primary" onclick="PhasesPage.showAddForm()">Create Phase</button>
            </div></div>`;
        } else {
            phases.sort((a, b) => a.startDate.localeCompare(b.startDate));

            phases.forEach(phase => {
                const isActive = Utils.isWithinRange(today, phase.startDate, phase.endDate);
                const isCompleted = today > phase.endDate;
                const statusClass = isActive ? 'active' : (isCompleted ? 'completed' : '');
                const statusLabel = isActive ? 'ACTIVE' : (isCompleted ? 'COMPLETED' : 'UPCOMING');
                const statusBadge = isActive ? 'badge-accent' : (isCompleted ? 'badge-green' : 'badge-yellow');

                const totalDays = Utils.daysBetween(phase.startDate, phase.endDate);
                const elapsed = isCompleted ? totalDays : Utils.daysPassed(phase.startDate);
                const pct = Utils.percentage(elapsed, totalDays);

                html += `
                <div class="card phase-card ${statusClass}">
                    <div class="flex-between mb-10">
                        <div>
                            <h3 style="font-size:18px;font-weight:700;">${phase.name}</h3>
                            <span class="text-muted" style="font-size:12px;">${Utils.formatDate(phase.startDate)} → ${Utils.formatDate(phase.endDate)} · ${totalDays} days</span>
                        </div>
                        <div class="flex-gap">
                            <span class="card-badge ${statusBadge}">${statusLabel}</span>
                            <button class="btn btn-secondary btn-sm" onclick="PhasesPage.showEditForm('${phase.id}')">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="PhasesPage.deletePhase('${phase.id}')">×</button>
                        </div>
                    </div>

                    <div class="grid-3 mb-20">
                        <div class="stat-block">
                            <div class="stat-label">Progress</div>
                            <div class="stat-value">${pct}%</div>
                            <div class="progress-bar"><div class="progress-fill ${Utils.progressClass(pct)}" style="width:${pct}%"></div></div>
                        </div>
                        <div class="stat-block">
                            <div class="stat-label">Days Elapsed</div>
                            <div class="stat-value">${elapsed} <span style="font-size:14px;color:var(--text-muted)">/ ${totalDays}</span></div>
                        </div>
                        <div class="stat-block">
                            <div class="stat-label">${isCompleted ? 'Status' : 'Days Left'}</div>
                            <div class="stat-value">${isCompleted ? '✓ Done' : Utils.daysRemaining(phase.endDate)}</div>
                        </div>
                    </div>

                    ${phase.objectives && phase.objectives.length > 0 ? `
                    <div class="mb-10">
                        <div class="stat-label mb-10">Objectives</div>
                        ${phase.objectives.map(o => `<div style="padding:4px 0;font-size:13px;color:var(--text-secondary);">→ ${o}</div>`).join('')}
                    </div>` : ''}

                    ${phase.successMetrics ? `
                    <div class="mb-10">
                        <div class="stat-label mb-10">Success Metrics</div>
                        <div style="font-size:13px;color:var(--text-secondary);">${phase.successMetrics}</div>
                    </div>` : ''}

                    ${phase.skillTargets ? `
                    <div>
                        <div class="stat-label mb-10">Skill Targets</div>
                        <div style="font-size:13px;color:var(--text-secondary);">${phase.skillTargets}</div>
                    </div>` : ''}
                </div>`;
            });
        }

        document.getElementById('content').innerHTML = html;
    },

    showAddForm() {
        this._showForm(null);
    },

    showEditForm(id) {
        const phase = Data.findInCollection('phases', id);
        if (phase) this._showForm(phase);
    },

    _showForm(phase) {
        const isEdit = !!phase;
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'phaseModal';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-title">${isEdit ? 'Edit Phase' : 'New Phase'}</div>
                <div class="form-group">
                    <label class="form-label">Phase Name</label>
                    <input class="form-input" id="phaseName" value="${phase ? phase.name : ''}" placeholder="e.g. Foundation">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Start Date</label>
                        <input class="form-input" type="date" id="phaseStart" value="${phase ? phase.startDate : Utils.today()}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">End Date</label>
                        <input class="form-input" type="date" id="phaseEnd" value="${phase ? phase.endDate : ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Objectives (one per line)</label>
                    <textarea class="form-textarea" id="phaseObj" placeholder="Fix sleep cycle&#10;Complete 2 projects...">${phase && phase.objectives ? phase.objectives.join('\n') : ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Success Metrics</label>
                    <input class="form-input" id="phaseMetrics" value="${phase ? (phase.successMetrics || '') : ''}" placeholder="All objectives completed with consistency > 70%">
                </div>
                <div class="form-group">
                    <label class="form-label">Skill Targets</label>
                    <input class="form-input" id="phaseTargets" value="${phase ? (phase.skillTargets || '') : ''}" placeholder="Pushups: 30, Run 1km < 6min">
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="document.getElementById('phaseModal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="PhasesPage.savePhase('${isEdit ? phase.id : ''}')">${isEdit ? 'Update' : 'Create'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    },

    savePhase(existingId) {
        const name = document.getElementById('phaseName').value.trim();
        const startDate = document.getElementById('phaseStart').value;
        const endDate = document.getElementById('phaseEnd').value;
        const objectives = document.getElementById('phaseObj').value.split('\n').filter(o => o.trim());
        const successMetrics = document.getElementById('phaseMetrics').value.trim();
        const skillTargets = document.getElementById('phaseTargets').value.trim();

        if (!name || !startDate || !endDate) return alert('Name and dates are required.');
        if (endDate <= startDate) return alert('End date must be after start date.');

        if (existingId) {
            Data.updateInCollection('phases', existingId, { name, startDate, endDate, objectives, successMetrics, skillTargets });
        } else {
            Data.addToCollection('phases', { id: Utils.uid(), name, startDate, endDate, objectives, successMetrics, skillTargets });
        }

        document.getElementById('phaseModal').remove();
        this.render();
    },

    deletePhase(id) {
        if (confirm('Delete this phase?')) {
            Data.removeFromCollection('phases', id);
            this.render();
        }
    }
};
