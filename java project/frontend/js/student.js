/**
 * ============================================================
 * STUDENT RESULT DASHBOARD - Student Profile JavaScript
 * ============================================================
 */

const API_BASE = 'http://localhost:8080/api';

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavToggle();

    const params = new URLSearchParams(window.location.search);
    const studentId = params.get('id');

    if (!studentId) {
        showToast('No student ID provided', 'error');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }

    loadStudentProfile(studentId);

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

// ==================== LOAD STUDENT PROFILE ====================

async function loadStudentProfile(id) {
    try {
        const res = await fetch(`${API_BASE}/students/profile/${id}`);
        if (!res.ok) throw new Error('Student not found');
        const data = await res.json();

        const student = data.student;
        const currentMarks = data.currentMarks || [];
        const semesterPercentages = data.semesterPercentages || {};
        const status = data.status;
        const rank = data.rank;
        const totalInCourse = data.totalInCourse;

        // === Profile Header ===
        const avatar = student.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`;
        document.getElementById('profileAvatar').src = avatar;
        document.getElementById('profileName').textContent = student.name;
        document.getElementById('profileCourse').textContent = student.course;
        document.getElementById('profileSemester').textContent = student.semester;
        document.getElementById('profileRoll').textContent = student.rollNumber;
        document.getElementById('profileEmail').textContent = student.email || '—';
        document.getElementById('profilePhone').textContent = student.phone || '—';
        document.title = `${student.name} | Result Dashboard`;

        // Status Badge
        const statusBadge = document.getElementById('profileStatus');
        statusBadge.textContent = status;
        statusBadge.className = `profile-status-badge ${status.toLowerCase()}`;

        // Rank Badge
        document.getElementById('profileRank').innerHTML = `🏅 Rank: ${rank} of ${totalInCourse} in ${student.course} Sem ${student.semester}`;

        // === Marks Grid with Animated Progress Bars ===
        renderMarks(currentMarks);

        // === Growth Chart (Semester-wise) ===
        renderGrowthChart(semesterPercentages);

        // === Subject Comparison Chart ===
        renderSubjectChart(currentMarks);

        // === AI Prediction ===
        renderAIPrediction(semesterPercentages, data.currentPercentage, status);

    } catch (err) {
        console.error('Failed to load student profile:', err);
        showToast('Failed to load student profile', 'error');
    }
}

// ==================== RENDER MARKS ====================

function renderMarks(marks) {
    const grid = document.getElementById('marksGrid');
    if (!grid) return;

    if (marks.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No marks found for current semester</p></div>';
        return;
    }

    grid.innerHTML = marks.map((m, i) => {
        const percentage = Math.round((m.marks / m.maxMarks) * 100);
        let colorClass = 'high';
        if (percentage < 40) colorClass = 'fail';
        else if (percentage < 60) colorClass = 'low';
        else if (percentage < 80) colorClass = 'medium';

        return `
        <div class="mark-row" style="animation-delay: ${i * 0.1}s">
            <div class="mark-subject">${m.subject}</div>
            <div class="mark-score" style="color: ${percentage >= 40 ? 'var(--neon-green)' : 'var(--neon-pink)'}">${m.marks}/${m.maxMarks}</div>
            <div class="progress-bar-wrapper">
                <div class="progress-bar-fill ${colorClass}" data-width="${percentage}" style="width: 0%"></div>
            </div>
        </div>`;
    }).join('');

    // Animate progress bars after render
    setTimeout(() => {
        document.querySelectorAll('.progress-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.width + '%';
        });
    }, 300);
}

// ==================== GROWTH CHART ====================

function renderGrowthChart(semesterPercentages) {
    const ctx = document.getElementById('growthChart');
    if (!ctx) return;

    const semesters = Object.keys(semesterPercentages).sort((a, b) => a - b);
    const percentages = semesters.map(s => semesterPercentages[s]);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: semesters.map(s => `Sem ${s}`),
            datasets: [{
                label: 'Average %',
                data: percentages,
                borderColor: '#00d4ff',
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx: c, chartArea } = chart;
                    if (!chartArea) return 'rgba(0, 212, 255, 0.1)';
                    const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
                    gradient.addColorStop(1, 'rgba(0, 212, 255, 0.01)');
                    return gradient;
                },
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00d4ff',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 7,
                pointHoverRadius: 10
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
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => `Average: ${context.parsed.y}%`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter' }, callback: v => v + '%' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter' } }
                }
            },
            animation: { duration: 2000, easing: 'easeOutQuart' }
        }
    });
}

// ==================== SUBJECT COMPARISON CHART ====================

function renderSubjectChart(marks) {
    const ctx = document.getElementById('subjectChart');
    if (!ctx || marks.length === 0) return;

    const colors = [
        'rgba(0, 212, 255, 0.8)',
        'rgba(180, 74, 255, 0.8)',
        'rgba(0, 255, 136, 0.8)',
        'rgba(255, 140, 0, 0.8)',
        'rgba(255, 45, 120, 0.8)',
        'rgba(0, 245, 212, 0.8)'
    ];

    const borderColors = ['#00d4ff', '#b44aff', '#00ff88', '#ff8c00', '#ff2d78', '#00f5d4'];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: marks.map(m => m.subject.length > 12 ? m.subject.substring(0, 12) + '...' : m.subject),
            datasets: [{
                label: 'Marks',
                data: marks.map(m => m.marks),
                backgroundColor: colors.slice(0, marks.length),
                borderColor: borderColors.slice(0, marks.length),
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 46, 0.95)',
                    titleColor: '#b44aff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(180, 74, 255, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => {
                            const mark = marks[context.dataIndex];
                            return `${mark.marks}/${mark.maxMarks} (${Math.round(mark.marks / mark.maxMarks * 100)}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: marks[0]?.maxMarks || 100,
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter' } }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter', size: 11 } }
                }
            },
            animation: { duration: 2000, easing: 'easeOutQuart' }
        }
    });
}

// ==================== AI PERFORMANCE PREDICTION ====================

function renderAIPrediction(semesterPercentages, currentPercentage, status) {
    const container = document.getElementById('aiPrediction');
    if (!container) return;

    const semesters = Object.keys(semesterPercentages).sort((a, b) => a - b);
    const values = semesters.map(s => semesterPercentages[s]);

    // Simple linear regression for prediction
    let predictedNext = currentPercentage;
    let trend = 'Stable';
    let trendColor = 'var(--neon-blue)';
    let trendIcon = '➡️';

    if (values.length >= 2) {
        const diffs = [];
        for (let i = 1; i < values.length; i++) {
            diffs.push(values[i] - values[i - 1]);
        }
        const avgGrowth = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        predictedNext = Math.min(100, Math.max(0, currentPercentage + avgGrowth));

        if (avgGrowth > 2) {
            trend = 'Improving';
            trendColor = 'var(--neon-green)';
            trendIcon = '📈';
        } else if (avgGrowth < -2) {
            trend = 'Declining';
            trendColor = 'var(--neon-pink)';
            trendIcon = '📉';
        }
    }

    // Grade prediction
    let grade = 'F';
    if (predictedNext >= 90) grade = 'A+';
    else if (predictedNext >= 80) grade = 'A';
    else if (predictedNext >= 70) grade = 'B+';
    else if (predictedNext >= 60) grade = 'B';
    else if (predictedNext >= 50) grade = 'C';
    else if (predictedNext >= 40) grade = 'D';

    container.innerHTML = `
        <div class="glass-card" style="flex:1; min-width: 200px; text-align:center; padding: 1.5rem;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${trendIcon}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.3rem;">Performance Trend</div>
            <div style="font-family: 'Orbitron', sans-serif; font-size: 1.2rem; font-weight: 700; color: ${trendColor};">${trend}</div>
        </div>
        <div class="glass-card" style="flex:1; min-width: 200px; text-align:center; padding: 1.5rem;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔮</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.3rem;">Predicted Next Sem</div>
            <div style="font-family: 'Orbitron', sans-serif; font-size: 1.2rem; font-weight: 700; color: var(--neon-cyan);">${predictedNext.toFixed(1)}%</div>
        </div>
        <div class="glass-card" style="flex:1; min-width: 200px; text-align:center; padding: 1.5rem;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎯</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.3rem;">Expected Grade</div>
            <div style="font-family: 'Orbitron', sans-serif; font-size: 1.2rem; font-weight: 700; color: var(--neon-purple);">${grade}</div>
        </div>
        <div class="glass-card" style="flex:1; min-width: 200px; text-align:center; padding: 1.5rem;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${status === 'PASS' ? '✅' : '❌'}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.3rem;">Current Status</div>
            <div style="font-family: 'Orbitron', sans-serif; font-size: 1.2rem; font-weight: 700; color: ${status === 'PASS' ? 'var(--neon-green)' : 'var(--neon-pink)'};">${status}</div>
        </div>
    `;
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
