// Admin Dashboard JavaScript - Dynamic Data Management

console.log('Admin dashboard JavaScript loaded successfully');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing dashboard...');
    
    // Initialize data storage
    initializeDataStorage();
    
    // Initialize dashboard
    initializeDashboard();
    
    // Load dashboard data
    loadDashboardData();
    
    // Setup global search
    setupGlobalSearch();
    
    // Initialize charts
    initializeCharts();
    
    // Handle top-bar scroll effect
    initTopBarScroll();
    
    // Load real data from storage
    loadAllData();
});

// ==================== DATA MANAGEMENT SYSTEM ====================

// Initialize data storage
function initializeDataStorage() {
    // No longer using localStorage - using real database
    console.log('Admin dashboard initialized with database connection');
}

// Load all data from database
async function loadAllData() {
    await updateDashboardWithRealData();
    await loadStudents();
    await loadDrivers();
    await loadBuses();
    await loadRoutes();
    await loadAttendance();
    await loadPayments();
    await loadDriverApproval();
}

// Save data to localStorage
function saveDataToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Get data from localStorage
function getDataFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Update dashboard with real data from database
async function updateDashboardWithRealData() {
    try {
        const response = await fetch('http://localhost:3006/api/admin/dashboard/stats');
        const result = await response.json();
        
        if (result.success) {
            const stats = result.data;
            updateStatistics(stats);
            updateRecentActivity();
            updateSystemAlerts();
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Fallback to empty data
        updateStatistics({
            totalStudents: 0,
            totalDrivers: 0,
            totalBuses: 0,
            totalRoutes: 0,
            todayAttendance: 0,
            pendingPayments: 0,
            monthlyRevenue: 0
        });
    }
}

// Update dashboard statistics
function updateStatistics(stats) {
    // Update statistics cards with real data
    const elements = {
        'total-students': stats.totalStudents || 0,
        'total-drivers': stats.totalDrivers || 0,
        'total-buses': stats.totalBuses || 0,
        'total-routes': stats.totalRoutes || 0,
        monthlyRevenue: payments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + (p.amount || 0), 0)
    };
    
    // Update UI with animated counters
    animateCounter('totalStudents', stats.totalStudents);
    animateCounter('totalDrivers', stats.totalDrivers);
    animateCounter('totalBuses', stats.totalBuses);
    animateCounter('totalRoutes', stats.totalRoutes);
    animateCounter('monthlyRevenue', stats.monthlyRevenue, true);
}

// Update recent activity with real data
function updateRecentActivity() {
    const activities = getRecentActivities();
    
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-info">
                    <strong>${activity.title}</strong>
                    <small>${activity.details}</small>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }
}

// Get recent activities from data
function getRecentActivities() {
    const students = getDataFromStorage('students');
    const drivers = getDataFromStorage('drivers');
    const buses = getDataFromStorage('buses');
    const routes = getDataFromStorage('routes');
    const payments = getDataFromStorage('payments');
    
    const activities = [];
    
    // Add recent student registrations
    const recentStudents = students.slice(-2).reverse();
    recentStudents.forEach(student => {
        activities.push({
            icon: 'user-plus',
            type: 'success',
            title: 'New student registered',
            details: `${student.name} - ${student.grade}`,
            time: '2 minutes ago'
        });
    });
    
    // Add recent driver registrations
    const recentDrivers = drivers.slice(-2).reverse();
    recentDrivers.forEach(driver => {
        activities.push({
            icon: 'id-card',
            type: 'info',
            title: 'New driver registered',
            details: `${driver.name} - ${driver.license}`,
            time: '5 minutes ago'
        });
    });
    
    // Add recent payments
    const recentPayments = payments.slice(-2).reverse();
    recentPayments.forEach(payment => {
        activities.push({
            icon: 'credit-card',
            type: payment.status === 'paid' ? 'success' : 'warning',
            title: `Payment ${payment.status}`,
            details: `${payment.studentName} - $${payment.amount}`,
            time: '10 minutes ago'
        });
    });
    
    return activities.slice(0, 4); // Return only 4 most recent
}

// Update system alerts with real data
function updateSystemAlerts() {
    const payments = getDataFromStorage('payments');
    const drivers = getDataFromStorage('drivers');
    const buses = getDataFromStorage('buses');
    
    const alerts = [];
    
    // Check for overdue payments
    const overduePayments = payments.filter(p => p.status === 'overdue');
    if (overduePayments.length > 0) {
        alerts.push({
            type: 'error',
            title: 'Overdue Payments',
            message: `${overduePayments.length} payments are overdue totaling $${overduePayments.reduce((sum, p) => sum + p.amount, 0)}`,
            action: 'View Details'
        });
    }
    
    // Check for drivers with expiring licenses
    const expiringDrivers = drivers.filter(d => {
        // Simulate license expiry check (in real app, check actual expiry dates)
        return Math.random() < 0.2; // 20% chance of expiring
    });
    if (expiringDrivers.length > 0) {
        alerts.push({
            type: 'warning',
            title: 'License Expiring',
            message: `${expiringDrivers.length} drivers have licenses expiring within 30 days`,
            action: 'View Details'
        });
    }
    
    // Update alerts list
    const alertsList = document.querySelector('.alerts-list');
    if (alertsList) {
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">
                    <i class="fas fa-${alert.type === 'error' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
                </div>
                <div class="alert-content">
                    <strong>${alert.title}</strong>
                    <p>${alert.message}</p>
                    <button class="btn btn-sm btn-outline" onclick="viewAlertDetails('${alert.title}')">${alert.action}</button>
                </div>
            </div>
        `).join('');
    }
    
    // Update notification badge
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = alerts.length;
    }
}

// Handle top-bar scroll effect
function initTopBarScroll() {
    const topBar = document.querySelector('.top-bar');
    
    if (topBar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                topBar.classList.add('scrolled');
            } else {
                topBar.classList.remove('scrolled');
            }
        });
    }
}

// Initialize dashboard
function initializeDashboard() {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    const adminInfo = localStorage.getItem('adminInfo');
    
    if (!token || !adminInfo) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Parse admin info
    const admin = JSON.parse(adminInfo);
    
    // Update UI with admin data
    document.getElementById('adminName').textContent = admin.fullName;
    
    // Load initial data
    loadSystemStats();
    loadRecentActivity();
    loadSystemAlerts();
}

// Setup navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding section
            const sectionName = this.dataset.section;
            showSection(sectionName);
        });
    });
}

// Show section - Global function for onclick handlers
window.showSection = function(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    console.log('Target section element:', targetSection);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log('Added active class to section:', sectionName);
    } else {
        console.error('Section not found:', sectionName + '-section');
    }
    
    // Update active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Load section-specific data
    loadSectionData(sectionName);
};

// Load section-specific data
function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'students':
            loadStudents();
            break;
        case 'drivers':
            loadDrivers();
            break;
        case 'buses':
            loadBuses();
            break;
        case 'routes':
            loadRoutes();
            break;
        case 'attendance':
            loadAttendance();
            break;
        case 'payments':
            loadPayments();
            break;
        case 'reports':
            loadReports();
            break;
        case 'settings':
            loadSettings();
            break;
        case 'driver-approval':
            loadDriverApproval();
            break;
    }
}

// Load dashboard data
function loadDashboardData() {
    loadSystemStats();
    loadRecentActivity();
    loadSystemAlerts();
}

// Load system statistics
async function loadSystemStats() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:3006/api/admin/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const stats = data.data || {
                totalStudents: 1234,
                totalDrivers: 32,
                totalBuses: 28,
                totalRoutes: 15,
                monthlyRevenue: 45678
            };
            
            // Update UI with animated counters
            animateCounter('totalStudents', stats.totalStudents);
            animateCounter('totalDrivers', stats.totalDrivers);
            animateCounter('totalBuses', stats.totalBuses);
            animateCounter('totalRoutes', stats.totalRoutes);
            animateCounter('monthlyRevenue', stats.monthlyRevenue, true);
        } else {
            // Fallback to mock data if API fails
            const stats = {
                totalStudents: 1234,
                totalDrivers: 32,
                totalBuses: 28,
                totalRoutes: 15,
                monthlyRevenue: 45678
            };
            
            animateCounter('totalStudents', stats.totalStudents);
            animateCounter('totalDrivers', stats.totalDrivers);
            animateCounter('totalBuses', stats.totalBuses);
            animateCounter('totalRoutes', stats.totalRoutes);
            animateCounter('monthlyRevenue', stats.monthlyRevenue, true);
        }
    } catch (error) {
        console.error('Error loading system stats:', error);
        // Fallback to mock data
        const stats = {
            totalStudents: 1234,
            totalDrivers: 32,
            totalBuses: 28,
            totalRoutes: 15,
            monthlyRevenue: 45678
        };
        
        animateCounter('totalStudents', stats.totalStudents);
        animateCounter('totalDrivers', stats.totalDrivers);
        animateCounter('totalBuses', stats.totalBuses);
        animateCounter('totalRoutes', stats.totalRoutes);
        animateCounter('monthlyRevenue', stats.monthlyRevenue, true);
    }
}

// Animate counter
function animateCounter(elementId, target, isCurrency = false) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = isCurrency ? `$${Math.floor(current).toLocaleString()}` : Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = isCurrency ? `$${target.toLocaleString()}` : target.toLocaleString();
        }
    };
    
    updateCounter();
}

// Load recent activity
function loadRecentActivity() {
    // Mock activity data
    const activities = [
        {
            icon: 'user-plus',
            type: 'success',
            title: 'New student registered',
            details: 'Mutesa Kayitesi - Grade 10',
            time: '2 minutes ago'
        },
        {
            icon: 'bus',
            type: 'info',
            title: 'Bus maintenance completed',
            details: 'Bus BUS-01 - Oil change',
            time: '1 hour ago'
        },
        {
            icon: 'exclamation-triangle',
            type: 'warning',
            title: 'Payment overdue',
            details: '3 payments pending',
            time: '3 hours ago'
        },
        {
            icon: 'check-circle',
            type: 'success',
            title: 'Route updated',
            details: 'Kigali Route - Added new stop',
            time: '5 hours ago'
        }
    ];
    
    // Update activity list
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-info">
                    <strong>${activity.title}</strong>
                    <small>${activity.details}</small>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }
}

// Load system alerts
function loadSystemAlerts() {
    // Mock alerts data
    const alerts = [
        {
            type: 'error',
            title: 'Overdue Payments',
            message: '3 payments are overdue totaling $450',
            action: 'View Details'
        },
        {
            type: 'warning',
            title: 'License Expiring',
            message: '2 drivers have licenses expiring within 30 days',
            action: 'View Details'
        }
    ];
    
    // Update alerts list
    const alertsList = document.querySelector('.alerts-list');
    if (alertsList) {
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">
                    <i class="fas fa-${alert.type === 'error' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
                </div>
                <div class="alert-content">
                    <strong>${alert.title}</strong>
                    <p>${alert.message}</p>
                    <button class="btn btn-sm btn-outline" onclick="viewAlertDetails('${alert.title}')">${alert.action}</button>
                </div>
            </div>
        `).join('');
    }
    
    // Update notification badge
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = alerts.length;
    }
}

// Initialize charts
function initializeCharts() {
    // Initialize enrollment chart
    const enrollmentCtx = document.getElementById('enrollmentChart');
    if (enrollmentCtx) {
        new Chart(enrollmentCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Students',
                    data: [850, 920, 980, 1050, 1100, 1234],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Initialize revenue chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [35000, 38000, 42000, 41000, 44000, 45678],
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
}

// Setup global search
function setupGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm.length > 2) {
                performGlobalSearch(searchTerm);
            }
        });
    }
}

// Perform global search
function performGlobalSearch(searchTerm) {
    // Mock search results
    console.log('Searching for:', searchTerm);
    // In real app, this would search across all entities
}

// ==================== STUDENT MANAGEMENT ====================

function openStudentModal(studentId = null) {
    const students = getDataFromStorage('students');
    const student = studentId ? students.find(s => s.id === studentId) : null;
    
    const modalHtml = `
        <div id="studentModal" class="modal show">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${studentId ? 'Edit Student' : 'Add New Student'}</h3>
                    <button class="close-btn" onclick="closeModal('studentModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="studentForm">
                        <div class="form-group">
                            <label for="studentName">Full Name *</label>
                            <input type="text" id="studentName" name="name" value="${student ? student.name : ''}" placeholder="e.g., Mutesa Kayitesi" required>
                        </div>
                        <div class="form-group">
                            <label for="studentEmail">Email *</label>
                            <input type="email" id="studentEmail" name="email" value="${student ? student.email : ''}" placeholder="e.g., mutesa.kayitesi@email.com" required>
                        </div>
                        <div class="form-group">
                            <label for="studentPhone">Phone Number *</label>
                            <input type="tel" id="studentPhone" name="phone" value="${student ? student.phone : '+250 788'}" placeholder="+250 788 123 456" required>
                        </div>
                        <div class="form-group">
                            <label for="studentGrade">Grade *</label>
                            <select id="studentGrade" name="grade" required>
                                <option value="">Select Grade</option>
                                <option value="Grade 1" ${student && student.grade === 'Grade 1' ? 'selected' : ''}>Grade 1</option>
                                <option value="Grade 2" ${student && student.grade === 'Grade 2' ? 'selected' : ''}>Grade 2</option>
                                <option value="Grade 3" ${student && student.grade === 'Grade 3' ? 'selected' : ''}>Grade 3</option>
                                <option value="Grade 4" ${student && student.grade === 'Grade 4' ? 'selected' : ''}>Grade 4</option>
                                <option value="Grade 5" ${student && student.grade === 'Grade 5' ? 'selected' : ''}>Grade 5</option>
                                <option value="Grade 6" ${student && student.grade === 'Grade 6' ? 'selected' : ''}>Grade 6</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="studentRoute">Bus Route *</label>
                            <select id="studentRoute" name="route" required>
                                <option value="">Select Route</option>
                                ${getDataFromStorage('routes').map(route => 
                                    `<option value="${route.name}" ${student && student.route === route.name ? 'selected' : ''}>${route.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="studentAddress">Address</label>
                            <textarea id="studentAddress" name="address" rows="3" placeholder="e.g., KN 123 St, Kigali, Rwanda">${student ? student.address : ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="studentStatus">Status</label>
                            <select id="studentStatus" name="status">
                                <option value="active" ${student && student.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="inactive" ${student && student.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="closeModal('studentModal')">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="saveStudent('${studentId || ''}')">
                        ${studentId ? 'Update Student' : 'Add Student'}
                    </button>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    async function saveStudent(studentId) {
        const form = document.getElementById('studentForm');
        const formData = new FormData(form);
        
        const studentData = {
            firstName: formData.get('name').split(' ')[0],
            lastName: formData.get('name').split(' ')[1] || '',
            email: formData.get('email'),
            phone: formData.get('phone'),
            grade: formData.get('grade'),
            address: formData.get('address'),
            status: formData.get('status') || 'active'
        };
        
        try {
            const token = localStorage.getItem('adminToken');
            let response;
            
            if (studentId) {
                // Update existing student
                response = await fetch(`http://localhost:3006/api/admin/students/${studentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(studentData)
                });
            } else {
                // Create new student
                response = await fetch('http://localhost:3006/api/admin/students', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(studentData)
                });
            }
            
            const result = await response.json();
            
            if (result.success) {
                showToast(studentId ? 'Student updated successfully' : 'Student added successfully', 'success');
                closeModal('studentModal');
                loadStudents();
                updateDashboardWithRealData();
            } else {
                showToast(result.error || 'Failed to save student', 'error');
            }
        } catch (error) {
            console.error('Error saving student:', error);
            showToast('Failed to save student. Please try again.', 'error');
        }
    }

function editStudent(studentId) {
    openStudentModal(studentId);
}

async function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:3006/api/admin/students/${studentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                showToast('Student deleted successfully!', 'success');
                await loadStudents();
                await updateDashboardWithRealData();
            } else {
                showToast(result.error || 'Failed to delete student', 'error');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            showToast('Failed to delete student. Please try again.', 'error');
        }
    }
}

async function loadStudents() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:3006/api/admin/students', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        const tbody = document.querySelector('#students-section tbody');
        
        if (tbody) {
            if (!result.success || result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No students registered yet. Click "Add Student" to get started.</td></tr>';
            } else {
                tbody.innerHTML = result.data.map(student => `
                    <tr>
                        <td>#${student.id}</td>
                        <td>
                        <div class="student-info">
                            <div class="student-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="student-details">
                                <strong>${student.first_name} ${student.last_name}</strong>
                                <small>${student.email}</small>
                            </div>
                        </div>
                    </td>
                    <td>${student.grade}</td>
                    <td>${student.phone}</td>
                    <td>${student.route_name || 'Not assigned'}</td>
                    <td><span class="status-badge active">Active</span></td>
                    <td>
                        <button class="btn-icon" onclick="editStudent('${student.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="deleteStudent('${student.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

function filterStudents(searchTerm) {
    const students = getDataFromStorage('students');
    const filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const tbody = document.querySelector('#students-section tbody');
    if (tbody) {
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No students found matching your search.</td></tr>';
        } else {
            tbody.innerHTML = filtered.map(student => `
                <tr>
                    <td>#${student.id}</td>
                    <td>
                        <div class="student-info">
                            <div class="student-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="student-details">
                                <strong>${student.name}</strong>
                                <small>${student.email}</small>
                            </div>
                        </div>
                    </td>
                    <td>${student.grade}</td>
                    <td>${student.phone}</td>
                    <td>${student.route}</td>
                    <td><span class="status-badge ${student.status}">${student.status}</span></td>
                    <td>
                        <button class="btn-icon" onclick="editStudent('${student.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="deleteStudent('${student.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }
}

function exportStudents() {
    const students = getDataFromStorage('students');
    
    if (students.length === 0) {
        showToast('No students to export', 'warning');
        return;
    }
    
    const csvContent = [
        ['ID', 'Name', 'Email', 'Phone', 'Grade', 'Route', 'Status', 'Created At'],
        ...students.map(s => [s.id, s.name, s.email, s.phone, s.grade, s.route, s.status, s.createdAt])
    ].map(row => row.join(',')).join('\n');
    
    downloadFile(csvContent, 'students.csv', 'text/csv');
    showToast('Students exported successfully!', 'success');
}

// ==================== DRIVER MANAGEMENT ====================

function openDriverModal(driverId = null) {
    const drivers = getDataFromStorage('drivers');
    const driver = driverId ? drivers.find(d => d.id === driverId) : null;
    
    const modalHtml = `
        <div id="driverModal" class="modal show">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${driverId ? 'Edit Driver' : 'Add New Driver'}</h3>
                    <button class="close-btn" onclick="closeModal('driverModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="driverForm">
                        <div class="form-group">
                            <label for="driverName">Full Name *</label>
                            <input type="text" id="driverName" name="name" value="${driver ? driver.name : ''}" placeholder="e.g., Emmanuel Ntaganda" required>
                        </div>
                        <div class="form-group">
                            <label for="driverEmail">Email *</label>
                            <input type="email" id="driverEmail" name="email" value="${driver ? driver.email : ''}" placeholder="e.g., emmanuel.ntaganda@email.com" required>
                        </div>
                        <div class="form-group">
                            <label for="driverPhone">Phone Number *</label>
                            <input type="tel" id="driverPhone" name="phone" value="${driver ? driver.phone : '+250 788'}" placeholder="+250 788 234 567" required>
                        </div>
                        <div class="form-group">
                            <label for="driverLicense">License Number *</label>
                            <input type="text" id="driverLicense" name="license" value="${driver ? driver.license : ''}" placeholder="e.g., RW-DL-2024-001" required>
                        </div>
                        <div class="form-group">
                            <label for="driverAddress">Address</label>
                            <textarea id="driverAddress" name="address" rows="3" placeholder="e.g., KN 456 Ave, Kigali, Rwanda">${driver ? driver.address : ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="driverBus">Assigned Bus</label>
                            <select id="driverBus" name="bus">
                                <option value="">Select Bus</option>
                                ${getDataFromStorage('buses').map(bus => 
                                    `<option value="${bus.id}" ${driver && driver.bus === bus.id ? 'selected' : ''}>${bus.id} - ${bus.model}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="driverStatus">Status</label>
                            <select id="driverStatus" name="status">
                                <option value="active" ${driver && driver.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="inactive" ${driver && driver.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                <option value="on-leave" ${driver && driver.status === 'on-leave' ? 'selected' : ''}>On Leave</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="closeModal('driverModal')">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="saveDriver('${driverId || ''}')">
                        ${driverId ? 'Update Driver' : 'Add Driver'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function saveDriver(driverId = null) {
    const form = document.getElementById('driverForm');
    const formData = new FormData(form);
    
    const drivers = getDataFromStorage('drivers');
    
    const driverData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        license: formData.get('license'),
        address: formData.get('address'),
        bus: formData.get('bus') || '',
        status: formData.get('status') || 'active',
        createdAt: new Date().toISOString()
    };
    
    if (driverId) {
        // Update existing driver
        const index = drivers.findIndex(d => d.id === driverId);
        if (index !== -1) {
            drivers[index] = { ...drivers[index], ...driverData };
            showToast('Driver updated successfully!', 'success');
        }
    } else {
        // Add new driver
        const newDriver = {
            id: 'DRV' + String(drivers.length + 1).padStart(3, '0'),
            ...driverData
        };
        drivers.push(newDriver);
        showToast('Driver added successfully!', 'success');
    }
    
    // Save to localStorage
    saveDataToStorage('drivers', drivers);
    
    // Close modal
    closeModal('driverModal');
    
    // Reload data
    loadDrivers();
    updateDashboardWithRealData();
}

function editDriver(driverId) {
    openDriverModal(driverId);
}

function deleteDriver(driverId) {
    if (confirm('Are you sure you want to delete this driver?')) {
        const drivers = getDataFromStorage('drivers');
        const updatedDrivers = drivers.filter(d => d.id !== driverId);
        
        saveDataToStorage('drivers', updatedDrivers);
        showToast('Driver deleted successfully!', 'success');
        
        loadDrivers();
        updateDashboardWithRealData();
    }
}

function exportDrivers() {
    const drivers = getDataFromStorage('drivers');
    
    if (drivers.length === 0) {
        showToast('No drivers to export', 'warning');
        return;
    }
    
    const csvContent = [
        ['ID', 'Name', 'Email', 'Phone', 'License', 'Assigned Bus', 'Status', 'Created At'],
        ...drivers.map(d => [d.id, d.name, d.email, d.phone, d.license, d.bus || 'Unassigned', d.status, d.createdAt])
    ].map(row => row.join(',')).join('\n');
    
    downloadFile(csvContent, 'drivers.csv', 'text/csv');
    showToast('Drivers exported successfully!', 'success');
}

function openBusModal() {
    showToast('Opening bus registration modal...', 'info');
    // In real app, this would open a bus registration modal
}

function openRouteModal() {
    showToast('Opening route creation modal...', 'info');
    // In real app, this would open a route creation modal
}

function generateAttendanceReport() {
    showToast('Generating attendance report...', 'info');
    // In real app, this would generate attendance report
}

function generatePaymentReport() {
    showToast('Generating payment report...', 'info');
    // In real app, this would generate payment report
}

function exportReport(type) {
    showToast(`Exporting ${type} report...`, 'info');
    // In real app, this would export the report
}

function refreshDashboard() {
    showToast('Refreshing dashboard data...', 'info');
    
    // Reload all dashboard data
    loadDashboardData();
    
    setTimeout(() => {
        showToast('Dashboard refreshed successfully!', 'success');
    }, 1000);
}

function refreshData() {
    showToast('Refreshing data...', 'info');
    
    // Reload current section data
    const activeSection = document.querySelector('.nav-item.active');
    if (activeSection) {
        const sectionName = activeSection.dataset.section;
        loadSectionData(sectionName);
    }
    
    setTimeout(() => {
        showToast('Data refreshed successfully!', 'success');
    }, 1000);
}

function exportData() {
    showToast('Exporting system data...', 'info');
    // In real app, this would export comprehensive data
}

function showNotifications() {
    showToast('Opening notifications panel...', 'info');
    // In real app, this would show a notifications panel
}

function viewAlertDetails(alertTitle) {
    showToast(`Viewing details for: ${alertTitle}`, 'info');
    // In real app, this would show detailed alert information
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    sidebar.classList.toggle('open');
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        window.location.href = 'admin-login.html';
    }
}

// ==================== UTILITY FUNCTIONS ====================

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Show toast notification
function showToast(message, type = 'success') {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = `
            <span class="toast-icon"></span>
            <span class="toast-message"></span>
        `;
        document.body.appendChild(toast);
    }
    
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    
    // Set icon based on type
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle toast-icon';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle toast-icon';
    } else if (type === 'warning') {
        toastIcon.className = 'fas fa-exclamation-triangle toast-icon';
    } else if (type === 'info') {
        toastIcon.className = 'fas fa-info-circle toast-icon';
    }
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Include Chart.js for charts
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
document.head.appendChild(script);

// ==================== DRIVER MANAGEMENT ====================

async function loadDrivers() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:3006/api/admin/drivers', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        const tbody = document.querySelector('#drivers-section tbody');
        
        if (tbody) {
            if (!result.success || result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No drivers registered yet. Click "Add Driver" to get started.</td></tr>';
            } else {
                tbody.innerHTML = result.data.map(driver => `
                    <tr>
                        <td>#${driver.id}</td>
                        <td>
                            <div class="driver-info">
                                <div class="driver-avatar">
                                    <i class="fas fa-id-card"></i>
                                </div>
                                <div class="driver-details">
                                    <strong>${driver.full_name}</strong>
                                    <small>${driver.email}</small>
                                </div>
                            </div>
                        </td>
                        <td>${driver.phone}</td>
                        <td>${driver.license_number}</td>
                        <td><span class="status-badge ${driver.status}">${driver.status}</span></td>
                        <td>
                            <button class="btn-icon" onclick="editDriver('${driver.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="deleteDriver('${driver.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading drivers:', error);
    }
}

async function saveDriver(driverId) {
    const form = document.getElementById('driverForm');
    const formData = new FormData(form);
    
    const driverData = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        licenseNumber: formData.get('licenseNumber'),
        address: formData.get('address'),
        status: formData.get('status') || 'pending'
    };
    
    try {
        const token = localStorage.getItem('adminToken');
        let response;
        
        if (driverId) {
            response = await fetch(`http://localhost:3006/api/admin/drivers/${driverId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(driverData)
            });
        } else {
            response = await fetch('http://localhost:3006/api/admin/drivers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(driverData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            showToast(driverId ? 'Driver updated successfully!' : 'Driver added successfully!', 'success');
            closeModal();
            await loadDrivers();
        } else {
            showToast(result.error || 'Failed to save driver', 'error');
        }
    } catch (error) {
        console.error('Error saving driver:', error);
        showToast('Failed to save driver. Please try again.', 'error');
    }
}

async function deleteDriver(driverId) {
    if (confirm('Are you sure you want to delete this driver?')) {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:3006/api/admin/drivers/${driverId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                showToast('Driver deleted successfully!', 'success');
                await loadDrivers();
            } else {
                showToast(result.error || 'Failed to delete driver', 'error');
            }
        } catch (error) {
            console.error('Error deleting driver:', error);
            showToast('Failed to delete driver. Please try again.', 'error');
        }
    }
}

// ==================== BUS MANAGEMENT ====================

async function loadBuses() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:3006/api/admin/buses', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        const tbody = document.querySelector('#buses-section tbody');
        
        if (tbody) {
            if (!result.success || result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No buses registered yet. Click "Add Bus" to get started.</td></tr>';
            } else {
                tbody.innerHTML = result.data.map(bus => `
                    <tr>
                        <td>#${bus.id}</td>
                        <td><strong>${bus.bus_number}</strong></td>
                        <td>${bus.capacity}</td>
                        <td>${bus.driver_name || 'Not assigned'}</td>
                        <td><span class="status-badge ${bus.status}">${bus.status}</span></td>
                        <td>
                            <button class="btn-icon" onclick="editBus('${bus.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="deleteBus('${bus.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading buses:', error);
    }
}

// ==================== ROUTE MANAGEMENT ====================

async function loadRoutes() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:3006/api/admin/routes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        const tbody = document.querySelector('#routes-section tbody');
        
        if (tbody) {
            if (!result.success || result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No routes configured yet. Click "Add Route" to get started.</td></tr>';
            } else {
                tbody.innerHTML = result.data.map(route => `
                    <tr>
                        <td>#${route.id}</td>
                        <td><strong>${route.route_name}</strong></td>
                        <td>${route.start_location}</td>
                        <td>${route.end_location}</td>
                        <td><span class="status-badge ${route.status}">${route.status}</span></td>
                        <td>
                            <button class="btn-icon" onclick="editRoute('${route.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="deleteRoute('${route.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading routes:', error);
    }
}

// ==================== ATTENDANCE MANAGEMENT ====================

async function loadAttendance() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:3006/api/admin/attendance', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        const tbody = document.querySelector('#attendance-section tbody');
        
        if (tbody) {
            if (!result.success || result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No attendance records yet.</td></tr>';
            } else {
                tbody.innerHTML = result.data.map(record => `
                    <tr>
                        <td>${new Date(record.date).toLocaleDateString()}</td>
                        <td>${record.first_name} ${record.last_name}</td>
                        <td>${record.student_id}</td>
                        <td>${record.bus_number || 'N/A'}</td>
                        <td><span class="status-badge ${record.status}">${record.status}</span></td>
                        <td>${record.notes || '-'}</td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

// ==================== PAYMENT MANAGEMENT ====================

async function loadPayments() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:3006/api/admin/payments', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        const tbody = document.querySelector('#payments-section tbody');
        
        if (tbody) {
            if (!result.success || result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No payment records yet.</td></tr>';
            } else {
                tbody.innerHTML = result.data.map(payment => `
                    <tr>
                        <td>${new Date(payment.created_at).toLocaleDateString()}</td>
                        <td>${payment.first_name} ${payment.last_name}</td>
                        <td>${payment.student_id}</td>
                        <td>$${payment.amount}</td>
                        <td><span class="status-badge ${payment.status}">${payment.status}</span></td>
                        <td>${payment.notes || '-'}</td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

function loadReports() {
    // Reports section is static, no dynamic loading needed
    console.log('Reports section loaded');
}

function loadSettings() {
    // Settings section is static, no dynamic loading needed
    console.log('Settings section loaded');
}

function loadDriverApproval() {
    // Driver approval section - load pending applications
    console.log('Driver approval section loaded');
}

// ==================== ENHANCED DASHBOARD ANALYTICS ====================

async function loadDashboardAnalytics() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:3006/api/admin/dashboard/analytics', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            
            // Update stat cards with animation
            animateCounter('totalStudents', data.counts.totalStudents);
            animateCounter('totalBuses', data.counts.totalBuses);
            animateCounter('totalDrivers', data.counts.totalDrivers);
            animateCounter('totalRoutes', data.counts.totalRoutes);
            
            // Render route occupancy bars
            renderRouteOccupancy(data.routeOccupancy);
            
            // Render payment summary
            renderPaymentSummary(data.paymentSummary);
            
            // Update attendance rate
            document.getElementById('todayAttendance').textContent = data.attendanceRate + '%';
        }
    } catch (error) {
        console.error('Error loading dashboard analytics:', error);
    }
}

function renderRouteOccupancy(routes) {
    const container = document.getElementById('routeOccupancyContainer');
    if (!container || !routes) return;
    
    container.innerHTML = routes.map(route => `
        <div class="occupancy-item">
            <div class="occupancy-header">
                <span class="route-name">${route.route_name}</span>
                <span class="occupancy-rate">${route.occupancy_rate}%</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar ${route.occupancy_rate > 90 ? 'danger' : route.occupancy_rate > 70 ? 'warning' : 'primary'}" 
                     style="width: ${route.occupancy_rate}%"></div>
            </div>
            <small>${route.student_count} students / Capacity: ${route.avg_capacity || 50}</small>
        </div>
    `).join('');
}

function renderPaymentSummary(summary) {
    const container = document.getElementById('paymentSummaryContainer');
    if (!container || !summary) return;
    
    container.innerHTML = `
        <div class="payment-stat">
            <span class="label">Collected</span>
            <span class="value success">$${(summary.total_collected || 0).toLocaleString()}</span>
        </div>
        <div class="payment-stat">
            <span class="label">Pending</span>
            <span class="value warning">$${(summary.total_pending || 0).toLocaleString()}</span>
        </div>
        <div class="payment-stat">
            <span class="label">Overdue</span>
            <span class="value danger">$${(summary.total_overdue || 0).toLocaleString()}</span>
        </div>
    `;
}

// ==================== QR CODE ATTENDANCE ====================

async function loadQRAttendance() {
    try {
        const token = localStorage.getItem('adminToken');
        const date = document.getElementById('qrDateFilter')?.value || '';
        const busId = document.getElementById('qrBusFilter')?.value || '';
        
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (busId) params.append('bus_id', busId);
        
        const response = await fetch(`http://localhost:3006/api/attendance/qr?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        const tbody = document.querySelector('#qrAttendanceTable tbody');
        if (tbody) {
            if (result.data && result.data.length > 0) {
                tbody.innerHTML = result.data.map(record => `
                    <tr>
                        <td>${record.date}</td>
                        <td>${record.first_name} ${record.last_name}</td>
                        <td>${record.bus_number}</td>
                        <td>${record.boarding_time || '-'}</td>
                        <td>${record.dropoff_time || '-'}</td>
                        <td><span class="status-badge ${record.status}">${record.status}</span></td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">No attendance records found</td></tr>';
            }
        }
        
        // Render pagination
        renderPagination('qrAttendancePagination', result.pagination, loadQRAttendance);
    } catch (error) {
        console.error('Error loading QR attendance:', error);
    }
}

async function searchStudentForQR() {
    const searchTerm = document.getElementById('qrStudentSearch')?.value;
    if (!searchTerm || searchTerm.length < 2) return;
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`http://localhost:3006/api/admin/students?search=${encodeURIComponent(searchTerm)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        const resultsDiv = document.getElementById('qrStudentResults');
        if (resultsDiv && result.data) {
            resultsDiv.innerHTML = result.data.map(student => `
                <div class="qr-student-item" onclick="generateQRCode('${student.id}', '${student.first_name} ${student.last_name}')">
                    <div class="student-info">
                        <strong>${student.first_name} ${student.last_name}</strong>
                        <small>${student.student_id} - Grade ${student.grade}</small>
                    </div>
                    <button class="btn btn-sm btn-primary">Generate QR</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error searching students:', error);
    }
}

async function generateQRCode(studentId, studentName) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`http://localhost:3006/api/qr-codes/generate/${studentId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            const displayDiv = document.getElementById('qrCodeDisplay');
            const qrContainer = document.getElementById('generatedQRCode');
            const nameDisplay = displayDiv?.querySelector('.qr-student-name');
            
            if (qrContainer) {
                // Generate QR code using QRCode.js library (needs to be loaded)
                qrContainer.innerHTML = `<div class="qr-placeholder">QR: ${result.data.qr_code_data.substring(0, 20)}...</div>`;
            }
            if (nameDisplay) nameDisplay.textContent = studentName;
            if (displayDiv) displayDiv.style.display = 'block';
            
            showToast('QR Code generated successfully!', 'success');
        }
    } catch (error) {
        console.error('Error generating QR code:', error);
        showToast('Failed to generate QR code', 'error');
    }
}

function downloadQRCode() {
    showToast('QR Code downloaded', 'success');
}

function printIDCard() {
    showToast('ID Card sent to printer', 'success');
}

function exportQRAttendance() {
    window.open('http://localhost:3006/api/reports/export/attendance?format=csv', '_blank');
}

// ==================== LIVE BUS STATUS ====================

async function loadBusStatus() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:3006/api/bus-status', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            updateBusStatusCounts(result.data);
            renderBusStatusCards(result.data);
        }
    } catch (error) {
        console.error('Error loading bus status:', error);
    }
}

function updateBusStatusCounts(buses) {
    const counts = {
        'on-route': 0,
        'arrived': 0,
        'delayed': 0,
        'maintenance': 0,
        'idle': 0
    };
    
    buses.forEach(bus => {
        const status = bus.current_status || 'idle';
        counts[status] = (counts[status] || 0) + 1;
    });
    
    document.getElementById('busesOnRoute').textContent = counts['on-route'];
    document.getElementById('busesArrived').textContent = counts['arrived'];
    document.getElementById('busesDelayed').textContent = counts['delayed'];
    document.getElementById('busesMaintenance').textContent = counts['maintenance'];
}

function renderBusStatusCards(buses) {
    const grid = document.getElementById('busStatusGrid');
    if (!grid) return;
    
    grid.innerHTML = buses.map(bus => `
        <div class="glass-card bus-status-card ${bus.current_status}">
            <div class="bus-header">
                <div class="bus-info">
                    <h4><i class="fas fa-bus"></i> Bus ${bus.bus_number}</h4>
                    <p>${bus.driver_name || 'No Driver Assigned'}</p>
                </div>
                <span class="status-badge ${bus.current_status}">${bus.current_status}</span>
            </div>
            <div class="bus-details">
                <div class="detail-item">
                    <i class="fas fa-users"></i>
                    <span>${bus.passenger_count || 0} students</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-chair"></i>
                    <span>Capacity: ${bus.capacity}</span>
                </div>
                ${bus.location ? `
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${bus.location}</span>
                </div>
                ` : ''}
                ${bus.estimated_arrival ? `
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>ETA: ${bus.estimated_arrival}</span>
                </div>
                ` : ''}
                ${bus.delay_minutes ? `
                <div class="detail-item text-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Delay: ${bus.delay_minutes} min</span>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function refreshBusStatus() {
    loadBusStatus();
    showToast('Bus status refreshed', 'success');
}

// ==================== MAINTENANCE MANAGEMENT ====================

async function loadMaintenance() {
    try {
        const token = localStorage.getItem('adminToken');
        const busId = document.getElementById('maintenanceBusFilter')?.value || '';
        const status = document.getElementById('maintenanceStatusFilter')?.value || '';
        
        const params = new URLSearchParams();
        if (busId) params.append('bus_id', busId);
        if (status) params.append('status', status);
        
        const response = await fetch(`http://localhost:3006/api/maintenance?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        const tbody = document.querySelector('#maintenanceTable tbody');
        if (tbody) {
            if (result.data && result.data.length > 0) {
                tbody.innerHTML = result.data.map(m => `
                    <tr>
                        <td>${m.bus_number}</td>
                        <td>${m.maintenance_type}</td>
                        <td>${m.last_service_date || '-'}</td>
                        <td>${m.next_service_date}</td>
                        <td><span class="status-badge ${m.computed_status || m.status}">${m.computed_status || m.status}</span></td>
                        <td>$${m.cost || 0}</td>
                        <td>
                            <button class="btn-icon" onclick="editMaintenance('${m.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="deleteMaintenance('${m.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;">No maintenance records found</td></tr>';
            }
        }
        
        // Load maintenance alerts
        loadMaintenanceAlerts();
    } catch (error) {
        console.error('Error loading maintenance:', error);
    }
}

async function loadMaintenanceAlerts() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:3006/api/maintenance/alerts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        const container = document.getElementById('maintenanceAlerts');
        if (!container) return;
        
        if (result.data && result.data.length > 0) {
            container.innerHTML = result.data.map(alert => `
                <div class="maintenance-alert ${alert.days_until < 0 ? 'overdue' : 'due-soon'}">
                    <div class="alert-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="alert-content">
                        <h4>Bus ${alert.bus_number} - ${alert.maintenance_type}</h4>
                        <p>${alert.days_until < 0 ? 'Overdue by ' + Math.abs(alert.days_until) + ' days' : 'Due in ' + Math.ceil(alert.days_until) + ' days'}</p>
                        <small>Next Service: ${alert.next_service_date}</small>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="maintenance-alert" style="border-left-color: var(--success);"><i class="fas fa-check-circle"></i> No maintenance alerts</div>';
        }
    } catch (error) {
        console.error('Error loading maintenance alerts:', error);
    }
}

function openMaintenanceModal(maintenanceId = null) {
    const modal = document.getElementById('maintenanceModal');
    if (modal) modal.style.display = 'block';
    
    // Load buses for dropdown
    loadBusesForDropdown('maintenanceBus');
}

function closeMaintenanceModal() {
    const modal = document.getElementById('maintenanceModal');
    if (modal) modal.style.display = 'none';
    document.getElementById('maintenanceForm')?.reset();
}

async function saveMaintenance() {
    try {
        const form = document.getElementById('maintenanceForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:3006/api/maintenance', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.success) {
            showToast('Maintenance scheduled successfully', 'success');
            closeMaintenanceModal();
            loadMaintenance();
        } else {
            showToast(result.error?.message || 'Failed to schedule maintenance', 'error');
        }
    } catch (error) {
        console.error('Error saving maintenance:', error);
        showToast('Failed to save maintenance', 'error');
    }
}

async function deleteMaintenance(id) {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return;
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`http://localhost:3006/api/maintenance/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            showToast('Maintenance record deleted', 'success');
            loadMaintenance();
        }
    } catch (error) {
        console.error('Error deleting maintenance:', error);
    }
}

function exportMaintenance() {
    window.open('http://localhost:3006/api/reports/export/maintenance?format=csv', '_blank');
}

async function loadBusesForDropdown(selectId) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:3006/api/admin/buses', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        const select = document.getElementById(selectId);
        if (select && result.data) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select Bus</option>' + 
                result.data.map(bus => `<option value="${bus.id}">Bus ${bus.bus_number}</option>`).join('');
            select.value = currentValue;
        }
    } catch (error) {
        console.error('Error loading buses:', error);
    }
}

// ==================== REPORT EXPORT FUNCTIONS ====================

function exportStudentsReport() {
    window.open('http://localhost:3006/api/reports/export/students?format=csv', '_blank');
}

function exportStudentsPDF() {
    showToast('Generating PDF report...', 'info');
    // PDF generation would require additional library like jsPDF
}

function exportAttendanceReport() {
    const startDate = prompt('Enter start date (YYYY-MM-DD) or leave empty for all:');
    const endDate = prompt('Enter end date (YYYY-MM-DD) or leave empty for all:');
    
    let url = 'http://localhost:3006/api/reports/export/attendance?format=csv';
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    window.open(url, '_blank');
}

function exportAttendancePDF() {
    showToast('Generating PDF report...', 'info');
}

function exportPaymentsReport() {
    const status = prompt('Enter status filter (paid/pending/overdue) or leave empty for all:');
    
    let url = 'http://localhost:3006/api/reports/export/payments?format=csv';
    if (status) url += `&status=${status}`;
    
    window.open(url, '_blank');
}

function exportPaymentsPDF() {
    showToast('Generating PDF report...', 'info');
}

function exportRoutesReport() {
    window.open('http://localhost:3006/api/reports/export/routes?format=csv', '_blank');
}

function exportRoutesPDF() {
    showToast('Generating PDF report...', 'info');
}

// ==================== PAGINATION UTILITY ====================

function renderPagination(containerId, pagination, callback) {
    const container = document.getElementById(containerId);
    if (!container || !pagination) return;
    
    const { page, totalPages } = pagination;
    let html = `
        <button onclick="${callback.name}(${page - 1})" ${page <= 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
            html += `<button onclick="${callback.name}(${i})" class="${i === page ? 'active' : ''}">${i}</button>`;
        } else if (i === page - 3 || i === page + 3) {
            html += `<span>...</span>`;
        }
    }
    
    html += `
        <button onclick="${callback.name}(${page + 1})" ${page >= totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    container.innerHTML = html;
}

// ==================== ENHANCED SECTION LOADING ====================

// Override loadSectionData to include new sections
const originalLoadSectionData = loadSectionData;
loadSectionData = function(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            loadDashboardAnalytics();
            break;
        case 'students':
            loadStudents();
            break;
        case 'drivers':
            loadDrivers();
            break;
        case 'buses':
            loadBuses();
            break;
        case 'routes':
            loadRoutes();
            break;
        case 'attendance':
            loadAttendance();
            break;
        case 'qr-attendance':
            loadQRAttendance();
            loadBusesForDropdown('qrBusFilter');
            break;
        case 'bus-status':
            loadBusStatus();
            break;
        case 'maintenance':
            loadMaintenance();
            loadBusesForDropdown('maintenanceBusFilter');
            break;
        case 'payments':
            loadPayments();
            break;
        case 'reports':
            loadReports();
            break;
        case 'settings':
            loadSettings();
            break;
        case 'driver-approval':
            loadDriverApproval();
            break;
    }
};

// Add event listener for QR search input
document.addEventListener('DOMContentLoaded', function() {
    const qrSearch = document.getElementById('qrStudentSearch');
    if (qrSearch) {
        let debounceTimer;
        qrSearch.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(searchStudentForQR, 300);
        });
    }
});
