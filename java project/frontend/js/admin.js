/**
 * ============================================================
 * STUDENT RESULT DASHBOARD - Admin Panel JavaScript
 * ============================================================
 */

const API_BASE = 'http://localhost:8080/api';

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavToggle();
    loadAdminStudents();
    loadStudentDropdowns();
    loadAdminNotices();

    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1200);
});

// ==================== PARTICLES ====================

function initParticles() {
    const container = document.getElementById('particlesBg');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (6 + Math.random() * 6) + 's';
        container.appendChild(particle);
    }
}

// ==================== NAV TOGGLE ====================

function initNavToggle() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('active'));
    }
}

// ==================== TAB SWITCHING ====================

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabName}`);
    });
}

// =====================================================
// STUDENTS CRUD
// =====================================================

async function loadAdminStudents() {
    try {
        const res = await fetch(`${API_BASE}/students`);
        const students = await res.json();
        renderAdminStudents(students);
    } catch (err) {
        console.error('Failed to load students:', err);
        showToast('Failed to connect to server', 'error');
    }
}

function renderAdminStudents(students) {
    const list = document.getElementById('adminStudentsList');
    if (!list) return;

    if (students.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No students yet</p></div>';
        return;
    }

    list.innerHTML = students.map(s => {
        const avatar = s.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`;
        return `
        <div class="admin-student-item">
            <div class="admin-student-info">
                <img src="${avatar}" alt="${s.name}">
                <div>
                    <div class="admin-student-name">${s.name}</div>
                    <div class="admin-student-detail">${s.rollNumber} · ${s.course} · Sem ${s.semester}</div>
                </div>
            </div>
            <div class="admin-student-actions">
                <button class="btn btn-outline btn-sm" onclick="editStudent(${s.id})">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id}, '${s.name}')">🗑️</button>
            </div>
        </div>`;
    }).join('');
}

async function handleStudentSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('studentId').value;
    const student = {
        name: document.getElementById('studentName').value,
        rollNumber: document.getElementById('studentRoll').value,
        course: document.getElementById('studentCourse').value,
        semester: parseInt(document.getElementById('studentSemester').value),
        email: document.getElementById('studentEmail').value,
        phone: document.getElementById('studentPhone').value,
        profilePicture: document.getElementById('studentPicture').value || `https://api.dicebear.com/7.x/avataaars/svg?seed=${document.getElementById('studentName').value}`
    };

    try {
        const url = id ? `${API_BASE}/students/${id}` : `${API_BASE}/students`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });

        if (!res.ok) throw new Error('Failed to save');

        showToast(id ? 'Student updated successfully!' : 'Student added successfully!', 'success');
        resetStudentForm();
        loadAdminStudents();
        loadStudentDropdowns();
    } catch (err) {
        console.error('Save error:', err);
        showToast('Failed to save student. Check console for details.', 'error');
    }
}

async function editStudent(id) {
    try {
        const res = await fetch(`${API_BASE}/students/${id}`);
        const s = await res.json();

        document.getElementById('studentId').value = s.id;
        document.getElementById('studentName').value = s.name;
        document.getElementById('studentRoll').value = s.rollNumber;
        document.getElementById('studentCourse').value = s.course;
        document.getElementById('studentSemester').value = s.semester;
        document.getElementById('studentEmail').value = s.email || '';
        document.getElementById('studentPhone').value = s.phone || '';
        document.getElementById('studentPicture').value = s.profilePicture || '';

        document.getElementById('studentFormTitle').textContent = '✏️ EDIT STUDENT';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        showToast('Failed to load student data', 'error');
    }
}

async function deleteStudent(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all their marks.`)) return;

    try {
        const res = await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');

        showToast('Student deleted successfully', 'success');
        loadAdminStudents();
        loadStudentDropdowns();
    } catch (err) {
        showToast('Failed to delete student', 'error');
    }
}

function resetStudentForm() {
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    document.getElementById('studentFormTitle').textContent = '➕ ADD NEW STUDENT';
}

// =====================================================
// MARKS CRUD
// =====================================================

async function loadStudentDropdowns() {
    try {
        const res = await fetch(`${API_BASE}/students`);
        const students = await res.json();

        const options = students.map(s =>
            `<option value="${s.id}">${s.name} (${s.rollNumber})</option>`
        ).join('');

        const markStudentSelect = document.getElementById('markStudentId');
        const filterSelect = document.getElementById('marksFilterStudent');

        if (markStudentSelect) {
            markStudentSelect.innerHTML = '<option value="">Choose student...</option>' + options;
        }
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">All Students</option>' + options;
        }
    } catch (err) {
        console.error('Failed to load student dropdowns:', err);
    }
}

async function handleMarkSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('markId').value;
    const mark = {
        studentId: parseInt(document.getElementById('markStudentId').value),
        subject: document.getElementById('markSubject').value,
        semester: parseInt(document.getElementById('markSemester').value),
        marks: parseInt(document.getElementById('markMarks').value),
        maxMarks: parseInt(document.getElementById('markMaxMarks').value)
    };

    try {
        const url = id ? `${API_BASE}/marks/${id}` : `${API_BASE}/marks`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mark)
        });

        if (!res.ok) throw new Error('Failed to save');

        showToast(id ? 'Marks updated!' : 'Marks added!', 'success');
        resetMarkForm();
        loadMarksByStudent();
    } catch (err) {
        showToast('Failed to save marks', 'error');
    }
}

async function loadMarksByStudent() {
    const studentId = document.getElementById('marksFilterStudent')?.value;
    try {
        const url = studentId
            ? `${API_BASE}/marks/student/${studentId}`
            : `${API_BASE}/marks`;

        const res = await fetch(url);
        const marks = await res.json();
        renderAdminMarks(marks.slice(0, 50)); // Limit display
    } catch (err) {
        console.error('Failed to load marks:', err);
    }
}

function renderAdminMarks(marks) {
    const list = document.getElementById('adminMarksList');
    if (!list) return;

    if (marks.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No marks found</p></div>';
        return;
    }

    list.innerHTML = marks.map(m => `
        <div class="admin-student-item">
            <div>
                <div class="admin-student-name">${m.subject}</div>
                <div class="admin-student-detail">Student #${m.studentId} · Sem ${m.semester} · ${m.marks}/${m.maxMarks}</div>
            </div>
            <div class="admin-student-actions">
                <button class="btn btn-outline btn-sm" onclick="editMark(${m.id})">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteMark(${m.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function editMark(id) {
    try {
        // Fetch all marks and find the one
        const res = await fetch(`${API_BASE}/marks`);
        const marks = await res.json();
        const m = marks.find(mark => mark.id === id);
        if (!m) return;

        document.getElementById('markId').value = m.id;
        document.getElementById('markStudentId').value = m.studentId;
        document.getElementById('markSubject').value = m.subject;
        document.getElementById('markSemester').value = m.semester;
        document.getElementById('markMarks').value = m.marks;
        document.getElementById('markMaxMarks').value = m.maxMarks;

        document.getElementById('markFormTitle').textContent = '✏️ EDIT MARKS';
        switchTab('marks');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        showToast('Failed to load mark data', 'error');
    }
}

async function deleteMark(id) {
    if (!confirm('Delete this mark entry?')) return;

    try {
        await fetch(`${API_BASE}/marks/${id}`, { method: 'DELETE' });
        showToast('Mark deleted', 'success');
        loadMarksByStudent();
    } catch (err) {
        showToast('Failed to delete mark', 'error');
    }
}

function resetMarkForm() {
    document.getElementById('markForm').reset();
    document.getElementById('markId').value = '';
    document.getElementById('markFormTitle').textContent = '➕ ADD MARKS';
}

// =====================================================
// NOTICES CRUD
// =====================================================

async function loadAdminNotices() {
    try {
        const res = await fetch(`${API_BASE}/notices`);
        const notices = await res.json();
        renderAdminNotices(notices);
    } catch (err) {
        console.error('Failed to load notices:', err);
    }
}

function renderAdminNotices(notices) {
    const list = document.getElementById('adminNoticesList');
    if (!list) return;

    if (notices.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No notices yet</p></div>';
        return;
    }

    list.innerHTML = notices.map(n => `
        <div class="admin-notice-item">
            <div>
                <div class="admin-notice-title">${n.title}</div>
                <div class="admin-notice-content">${n.content || ''}</div>
            </div>
            <div class="admin-student-actions">
                <button class="btn btn-outline btn-sm" onclick="editNotice(${n.id})">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteNotice(${n.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function handleNoticeSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('noticeId').value;
    const notice = {
        title: document.getElementById('noticeTitle').value,
        content: document.getElementById('noticeContent').value
    };

    try {
        const url = id ? `${API_BASE}/notices/${id}` : `${API_BASE}/notices`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notice)
        });

        if (!res.ok) throw new Error('Failed to save');

        showToast(id ? 'Notice updated!' : 'Notice added!', 'success');
        resetNoticeForm();
        loadAdminNotices();
    } catch (err) {
        showToast('Failed to save notice', 'error');
    }
}

async function editNotice(id) {
    try {
        const res = await fetch(`${API_BASE}/notices`);
        const notices = await res.json();
        const n = notices.find(notice => notice.id === id);
        if (!n) return;

        document.getElementById('noticeId').value = n.id;
        document.getElementById('noticeTitle').value = n.title;
        document.getElementById('noticeContent').value = n.content || '';

        document.getElementById('noticeFormTitle').textContent = '✏️ EDIT NOTICE';
        switchTab('notices');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        showToast('Failed to load notice data', 'error');
    }
}

async function deleteNotice(id) {
    if (!confirm('Delete this notice?')) return;

    try {
        await fetch(`${API_BASE}/notices/${id}`, { method: 'DELETE' });
        showToast('Notice deleted', 'success');
        loadAdminNotices();
    } catch (err) {
        showToast('Failed to delete notice', 'error');
    }
}

function resetNoticeForm() {
    document.getElementById('noticeForm').reset();
    document.getElementById('noticeId').value = '';
    document.getElementById('noticeFormTitle').textContent = '➕ ADD NOTICE';
}

// ==================== TOAST ====================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.className = `toast ${type}`;
    toast.innerHTML = `${icons[type] || ''} ${message}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}
