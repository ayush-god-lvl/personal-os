/* ============================================
   PERSONAL OS — Academic Control Panel
   ============================================ */

const AcademicsPage = {
    activeSubject: null,

    render() {
        const academics = Data.getCollection('academics');
        if (!this.activeSubject && academics.length > 0) this.activeSubject = academics[0].id;

        let html = `
            <div class="page-header"><h1>Academic Control Panel</h1>
            <p>Track chapters, test scores, revisions, and mastery per subject.</p></div>
            <div class="tabs">
                ${academics.map(s => `<button class="tab ${this.activeSubject === s.id ? 'active' : ''}" onclick="AcademicsPage.setSubject('${s.id}')">${s.subject}</button>`).join('')}
            </div>
        `;

        const subj = academics.find(s => s.id === this.activeSubject);
        if (!subj) {
            html += `<div class="card"><div class="empty-state"><p>No subjects found.</p></div></div>`;
            document.getElementById('content').innerHTML = html; return;
        }

        const chapters = subj.chapters || [];
        const completed = chapters.filter(c => c.completed).length;
        const totalTests = chapters.filter(c => c.testScore !== null);
        const avgScore = totalTests.length > 0 ? Math.round(Utils.average(totalTests.map(c => c.testScore))) : 0;
        const totalRevisions = chapters.reduce((s, c) => s + c.revisionCount, 0);
        const weakCount = (subj.weakTopics || []).length;
        const mastery = this.calcMastery(subj);

        // Overview
        html += `<div class="grid-4 mb-20">
            <div class="stat-block"><div class="stat-label">Chapters Done</div><div class="stat-value">${completed}/${chapters.length}</div></div>
            <div class="stat-block"><div class="stat-label">Test Average</div><div class="stat-value ${Utils.scoreColorClass(avgScore)}">${avgScore}%</div></div>
            <div class="stat-block"><div class="stat-label">Total Revisions</div><div class="stat-value">${totalRevisions}</div></div>
            <div class="stat-block"><div class="stat-label">Mastery</div>
                <div class="stat-value ${Utils.scoreColorClass(mastery)}">${mastery}%</div>
                <div class="progress-bar"><div class="progress-fill ${Utils.progressClass(mastery)}" style="width:${mastery}%"></div></div></div>
        </div>`;

        // Chapters table
        html += `<div class="card"><div class="card-header"><span class="card-title">Chapters</span>
            <button class="btn btn-primary btn-sm" onclick="AcademicsPage.showAddChapter()">+ Add Chapter</button></div>
            <table class="data-table"><thead><tr><th>Chapter</th><th>Status</th><th>Difficulty</th><th>Test Score</th><th>Revisions</th><th>Actions</th></tr></thead><tbody>`;

        chapters.forEach((ch, i) => {
            const diffStars = '★'.repeat(ch.difficulty) + '☆'.repeat(5 - ch.difficulty);
            html += `<tr>
                <td><strong>${ch.name}</strong></td>
                <td><span class="card-badge ${ch.completed ? 'badge-green' : 'badge-yellow'}">${ch.completed ? 'Done' : 'Pending'}</span></td>
                <td style="color:var(--yellow);font-size:12px;">${diffStars}</td>
                <td>${ch.testScore !== null ? `<strong>${ch.testScore}%</strong>` : '—'}</td>
                <td>${ch.revisionCount}</td>
                <td class="flex-gap">
                    <button class="btn btn-secondary btn-sm" onclick="AcademicsPage.toggleChapter(${i})">${ch.completed ? 'Undo' : '✓'}</button>
                    <button class="btn btn-secondary btn-sm" onclick="AcademicsPage.logScore(${i})">Score</button>
                    <button class="btn btn-secondary btn-sm" onclick="AcademicsPage.addRevision(${i})">+Rev</button>
                    <button class="btn btn-danger btn-sm" onclick="AcademicsPage.removeChapter(${i})">×</button>
                </td></tr>`;
        });
        html += `</tbody></table></div>`;

        // Weak Topics
        html += `<div class="card"><div class="card-header"><span class="card-title">Weak Topics</span>
            <button class="btn btn-secondary btn-sm" onclick="AcademicsPage.addWeakTopic()">+ Add</button></div>`;
        if (weakCount === 0) {
            html += `<div class="text-muted" style="font-size:13px;padding:8px 0;">No weak topics logged.</div>`;
        } else {
            (subj.weakTopics || []).forEach((t, i) => {
                html += `<div class="flex-between" style="padding:6px 0;border-bottom:1px solid var(--border);">
                    <span style="font-size:13px;">${t}</span>
                    <button class="btn btn-danger btn-sm" onclick="AcademicsPage.removeWeakTopic(${i})">×</button></div>`;
            });
        }
        html += `</div>`;

        document.getElementById('content').innerHTML = html;
    },

    setSubject(id) { this.activeSubject = id; this.render(); },

    calcMastery(subj) {
        const chapters = subj.chapters || [];
        if (chapters.length === 0) return 0;
        const tests = chapters.filter(c => c.testScore !== null);
        const testAvg = tests.length > 0 ? Utils.average(tests.map(c => c.testScore)) : 0;
        const maxRevisions = Math.max(1, ...chapters.map(c => c.revisionCount));
        const avgRevision = Utils.average(chapters.map(c => c.revisionCount));
        const revisionScore = Math.min(100, (avgRevision / 3) * 100);
        const weakTopicScore = Math.max(0, 100 - (subj.weakTopics || []).length * 20);
        return Math.round(testAvg * 0.4 + revisionScore * 0.3 + weakTopicScore * 0.3);
    },

    toggleChapter(idx) {
        const academics = Data.getCollection('academics');
        const subj = academics.find(s => s.id === this.activeSubject);
        if (subj) { subj.chapters[idx].completed = !subj.chapters[idx].completed; Data.set('academics', academics); this.render(); }
    },

    logScore(idx) {
        const score = prompt('Enter test score (0-100):');
        if (score === null) return;
        const val = parseInt(score);
        if (isNaN(val) || val < 0 || val > 100) return alert('Invalid score.');
        const academics = Data.getCollection('academics');
        const subj = academics.find(s => s.id === this.activeSubject);
        if (subj) { subj.chapters[idx].testScore = val; Data.set('academics', academics); this.render(); }
    },

    addRevision(idx) {
        const academics = Data.getCollection('academics');
        const subj = academics.find(s => s.id === this.activeSubject);
        if (subj) { subj.chapters[idx].revisionCount++; Data.set('academics', academics); this.render(); }
    },

    showAddChapter() {
        const name = prompt('Chapter name:');
        if (!name) return;
        const diff = parseInt(prompt('Difficulty (1-5):') || '3');
        const academics = Data.getCollection('academics');
        const subj = academics.find(s => s.id === this.activeSubject);
        if (subj) {
            subj.chapters.push({ name, completed: false, difficulty: Utils.clamp(diff, 1, 5), testScore: null, revisionCount: 0 });
            Data.set('academics', academics); this.render();
        }
    },

    removeChapter(idx) {
        if (!confirm('Remove this chapter?')) return;
        const academics = Data.getCollection('academics');
        const subj = academics.find(s => s.id === this.activeSubject);
        if (subj) { subj.chapters.splice(idx, 1); Data.set('academics', academics); this.render(); }
    },

    addWeakTopic() {
        const topic = prompt('Weak topic name:');
        if (!topic) return;
        const academics = Data.getCollection('academics');
        const subj = academics.find(s => s.id === this.activeSubject);
        if (subj) { if (!subj.weakTopics) subj.weakTopics = []; subj.weakTopics.push(topic); Data.set('academics', academics); this.render(); }
    },

    removeWeakTopic(idx) {
        const academics = Data.getCollection('academics');
        const subj = academics.find(s => s.id === this.activeSubject);
        if (subj) { subj.weakTopics.splice(idx, 1); Data.set('academics', academics); this.render(); }
    }
};
