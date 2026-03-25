/**
 * ============================================================
 * STUDENT RESULT DASHBOARD - Main Dashboard JavaScript
 * ============================================================
 */

const API_BASE = 'http://localhost:8080/api';

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavToggle();
    loadDashboardStats();
    loadStudents();
    loadFilters();
    loadNotices();
    initSearchListeners();

    // Hide loading screen after data loads
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1200);
});

// ==================== PARTICLES BACKGROUND ====================

function initParticles() {
    const container = document.getElementById('particlesBg');
    const count = 40;
    for (let i = 0; i < count; i++) {
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

// ==================== DASHBOARD STATS ====================

async function loadDashboardStats() {
    try {
        const res = await fetch(`${API_BASE}/dashboard/stats`);
        const data = await res.json();

        animateCounter('totalStudents', data.totalStudents, '');
        animateCounter('averageMarks', data.averageMarks, '%');
        animateCounter('passRate', data.passPercentage, '%');

        if (data.topper && data.topper.name) {
            document.getElementById('topperName').textContent = data.topper.name;
            document.getElementById('topperCourse').textContent = `${data.topper.course} - Sem ${data.topper.semester}`;

            // Topper Section
            const avatar = data.topper.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.topper.name}`;
            document.getElementById('topperAvatar').src = avatar;
            document.getElementById('topperFullName').textContent = data.topper.name;
            document.getElementById('topperCourseDetail').textContent = `📚 ${data.topper.course} | Semester ${data.topper.semester}`;
            document.getElementById('topperRoll').textContent = `🎫 ${data.topper.rollNumber}`;
            document.getElementById('topperPercentage').textContent = `${data.topper.percentage}%`;

            // Make topper card clickable
            document.getElementById('topperCard').style.cursor = 'pointer';
            document.getElementById('topperCard').onclick = () => {
                window.location.href = `student.html?id=${data.topper.id}`;
            };
        }
    } catch (err) {
        console.error('Failed to load dashboard stats:', err);
        showToast('Failed to connect to server. Make sure backend is running.', 'error');
    }
}

// ==================== COUNT-UP ANIMATION ====================

function animateCounter(elementId, target, suffix = '') {
    const el = document.getElementById(elementId);
    if (!el) return;

    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    const isFloat = target % 1 !== 0;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (target - start) * eased;

        if (isFloat) {
            el.textContent = current.toFixed(1) + suffix;
        } else {
            el.textContent = Math.floor(current) + suffix;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ==================== LOAD STUDENTS ====================

let allStudents = [];

async function loadStudents() {
    try {
        const res = await fetch(`${API_BASE}/students`);
        allStudents = await res.json();
        renderStudentsTable(allStudents);
        loadCharts(allStudents);
    } catch (err) {
        console.error('Failed to load students:', err);
    }
}

function renderStudentsTable(students) {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;

    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>No students found</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = students.map(s => {
        const avatar = s.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`;
        return `
        <tr onclick="window.location.href='student.html?id=${s.id}'">
            <td>
                <div class="student-cell">
                    <img class="student-avatar" src="${avatar}" alt="${s.name}">
                    <span>${s.name}</span>
                </div>
            </td>
            <td>${s.rollNumber}</td>
            <td>${s.course}</td>
            <td>Sem ${s.semester}</td>
            <td>${s.email || '—'}</td>
        </tr>`;
    }).join('');
}

// ==================== SEARCH & FILTER ====================

function initSearchListeners() {
    const searchInput = document.getElementById('searchInput');
    const courseFilter = document.getElementById('courseFilter');
    const semesterFilter = document.getElementById('semesterFilter');
    const suggestionsBox = document.getElementById('searchSuggestions');

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const query = searchInput.value.trim();
                if (query.length >= 2) {
                    // Show suggestions
                    try {
                        const res = await fetch(`${API_BASE}/students/search?q=${encodeURIComponent(query)}`);
                        const results = await res.json();
                        showSuggestions(results);
                        renderStudentsTable(results);
                    } catch (err) {
                        console.error('Search error:', err);
                    }
                } else if (query.length === 0) {
                    hideSuggestions();
                    applyFilters();
                }
            }, 300);
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(hideSuggestions, 200);
        });
    }

    if (courseFilter) courseFilter.addEventListener('change', applyFilters);
    if (semesterFilter) semesterFilter.addEventListener('change', applyFilters);
}

function showSuggestions(students) {
    const box = document.getElementById('searchSuggestions');
    if (!box || students.length === 0) {
        hideSuggestions();
        return;
    }

    box.innerHTML = students.slice(0, 6).map(s => {
        const avatar = s.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`;
        return `
        <div class="suggestion-item" onclick="window.location.href='student.html?id=${s.id}'">
            <img src="${avatar}" alt="${s.name}">
            <div>
                <div class="suggestion-name">${s.name}</div>
                <div class="suggestion-detail">${s.rollNumber} · ${s.course} · Sem ${s.semester}</div>
            </div>
        </div>`;
    }).join('');

    box.classList.add('active');
}

function hideSuggestions() {
    const box = document.getElementById('searchSuggestions');
    if (box) box.classList.remove('active');
}

async function applyFilters() {
    const course = document.getElementById('courseFilter')?.value || '';
    const semester = document.getElementById('semesterFilter')?.value || '';

    let url = `${API_BASE}/students/filter?`;
    if (course) url += `course=${encodeURIComponent(course)}&`;
    if (semester) url += `semester=${semester}&`;

    try {
        const res = await fetch(url);
        const students = await res.json();
        renderStudentsTable(students);
    } catch (err) {
        console.error('Filter error:', err);
    }
}

async function loadFilters() {
    try {
        const [coursesRes, semestersRes] = await Promise.all([
            fetch(`${API_BASE}/students/courses`),
            fetch(`${API_BASE}/students/semesters`)
        ]);

        const courses = await coursesRes.json();
        const semesters = await semestersRes.json();

        const courseSelect = document.getElementById('courseFilter');
        const semesterSelect = document.getElementById('semesterFilter');

        if (courseSelect) {
            courses.forEach(c => {
                courseSelect.innerHTML += `<option value="${c}">${c}</option>`;
            });
        }

        if (semesterSelect) {
            semesters.forEach(s => {
                semesterSelect.innerHTML += `<option value="${s}">Semester ${s}</option>`;
            });
        }
    } catch (err) {
        console.error('Failed to load filters:', err);
    }
}

// ==================== NOTICE BOARD ====================

async function loadNotices() {
    try {
        const res = await fetch(`${API_BASE}/notices`);
        const notices = await res.json();
        const marquee = document.getElementById('noticeMarquee');
        if (!marquee || notices.length === 0) return;

        // Duplicate notices for seamless loop
        const noticeHTML = notices.map(n =>
            `<div class="notice-item"><span class="notice-dot"></span>${n.title}</div>`
        ).join('');

        marquee.innerHTML = noticeHTML + noticeHTML;
    } catch (err) {
        console.error('Failed to load notices:', err);
    }
}

// ==================== CHARTS ====================

async function loadCharts(students) {
    if (!students || students.length === 0) return;

    // Fetch marks for all students to compute course averages
    try {
        const marksRes = await fetch(`${API_BASE}/marks`);
        const allMarks = await marksRes.json();

        renderCourseChart(students, allMarks);
        renderStudentChart(students, allMarks);
    } catch (err) {
        console.error('Failed to load charts:', err);
    }
}

function renderCourseChart(students, allMarks) {
    const ctx = document.getElementById('courseChart');
    if (!ctx) return;

    // Group students by course and compute avg
    const courseMap = {};
    students.forEach(s => {
        if (!courseMap[s.course]) courseMap[s.course] = [];
        const studentMarks = allMarks.filter(m => m.studentId === s.id && m.semester === s.semester);
        if (studentMarks.length > 0) {
            const avg = studentMarks.reduce((sum, m) => sum + (m.marks / m.maxMarks * 100), 0) / studentMarks.length;
            courseMap[s.course].push(avg);
        }
    });

    const labels = Object.keys(courseMap);
    const data = labels.map(c => {
        const avgs = courseMap[c];
        return avgs.length > 0 ? +(avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1) : 0;
    });

    const colors = ['rgba(0, 212, 255, 0.8)', 'rgba(180, 74, 255, 0.8)', 'rgba(0, 255, 136, 0.8)', 'rgba(255, 140, 0, 0.8)'];
    const borderColors = ['#00d4ff', '#b44aff', '#00ff88', '#ff8c00'];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average %',
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: borderColors.slice(0, labels.length),
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 46, 0.95)',
                    titleColor: '#00d4ff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(0, 212, 255, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter' } }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

function renderStudentChart(students, allMarks) {
    const ctx = document.getElementById('studentChart');
    if (!ctx) return;

    // Show top 6 students by their current semester avg
    const studentAvgs = students.map(s => {
        const marks = allMarks.filter(m => m.studentId === s.id && m.semester === s.semester);
        const avg = marks.length > 0
            ? marks.reduce((sum, m) => sum + (m.marks / m.maxMarks * 100), 0) / marks.length
            : 0;
        return { name: s.name, avg: +avg.toFixed(1) };
    }).sort((a, b) => b.avg - a.avg).slice(0, 6);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: studentAvgs.map(s => s.name.split(' ')[0]),
            datasets: [{
                label: 'Performance %',
                data: studentAvgs.map(s => s.avg),
                borderColor: '#b44aff',
                backgroundColor: 'rgba(180, 74, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#b44aff',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 9
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 46, 0.95)',
                    titleColor: '#b44aff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(180, 74, 255, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter' } }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
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
