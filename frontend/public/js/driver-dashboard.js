// Driver Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Load driver data
    loadDriverData();
    
    // Update time
    updateTime();
    setInterval(updateTime, 1000);
});

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
    const token = localStorage.getItem('token');
    const driverInfo = localStorage.getItem('userData');
    
    // Handle auto-login for newly registered drivers
    if (!token && driverInfo) {
        const driver = JSON.parse(driverInfo);
        if (driver.justRegistered) {
            // Auto-login newly registered driver
            autoLoginDriver(driver);
            return;
        }
    }
    
    if (!token || !driverInfo) {
        window.location.href = 'driver-login.html';
        return;
    }
    
    // Parse driver info
    const driver = JSON.parse(driverInfo);
    
    // Update UI with driver data
    document.getElementById('driverName').textContent = driver.fullName;
    
    // Load initial data
    loadDriverStats();
    loadSchedule();
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

// Show section
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
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
}

// Load section-specific data
function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'schedule':
            loadSchedule();
            break;
        case 'attendance':
            loadAttendance();
            break;
        case 'notifications':
            loadNotifications();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Auto-login newly registered driver
function autoLoginDriver(driver) {
    // Simulate login response
    const loginResponse = {
        success: true,
        token: 'driver-token-' + Date.now(),
        driver: {
            id: driver.id || 'DRV001',
            fullName: driver.fullName || driver.name,
            email: driver.email,
            phone: driver.phone || '+250 788 123 456',
            license: driver.license || 'RW-DL-2024-001',
            bus: driver.bus || 'BUS-01',
            status: 'active'
        }
    };
    
    // Store token and driver info
    localStorage.setItem('driverToken', loginResponse.token);
    localStorage.setItem('driverInfo', JSON.stringify(loginResponse.driver));
    
    // Remove justRegistered flag
    delete driver.justRegistered;
    localStorage.setItem('driverInfo', JSON.stringify(driver));
    
    // Reload page to initialize dashboard
    window.location.reload();
}

// Load driver data
async function loadDriverData() {
    const driverInfo = localStorage.getItem('driverInfo');
    if (driverInfo) {
        const driver = JSON.parse(driverInfo);
        
        // Update UI with driver data
        document.getElementById('driverName').textContent = driver.fullName || driver.name;
        document.getElementById('driverLicense').textContent = driver.licenseNumber || driver.license;
        document.getElementById('driverPhone').textContent = driver.phone;
        
        // Load dashboard data
        await loadDashboardData();
        await loadAssignedStudents();
        await loadSchedule();
        await loadNotifications();
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const driverInfo = JSON.parse(localStorage.getItem('userData'));
        const token = localStorage.getItem('token');
        
        // Mock statistics for now (would be enhanced with real driver stats API)
        const stats = {
            todayTrips: 2,
            totalStudents: 45,
            onTimeRate: 95,
            thisWeekRevenue: 750
        };
        
        // Update UI with animated counters
        animateCounter('todayTrips', stats.todayTrips);
        animateCounter('totalStudents', stats.totalStudents);
        animateCounter('onTimeRate', stats.onTimeRate);
        animateCounter('thisWeekRevenue', stats.thisWeekRevenue, true);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
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

// Load schedule
async function loadSchedule() {
    try {
        const driverInfo = JSON.parse(localStorage.getItem('userData'));
        
        // Mock schedule data for now (would be enhanced with real schedule API)
        const schedule = [
            {
                time: '07:00 AM',
                route: 'North Route',
                bus: 'BUS-01',
                students: 23,
                status: 'completed'
            },
            {
                time: '02:30 PM',
                route: 'North Route',
                bus: 'BUS-01',
                students: 22,
                status: 'upcoming'
            }
        ];
        
        // Update schedule list
        const scheduleList = document.querySelector('.schedule-list');
        if (scheduleList) {
            scheduleList.innerHTML = schedule.map(item => `
                <div class="schedule-item">
                    <div class="schedule-time">${item.time}</div>
                    <div class="schedule-details">
                        <h4>${item.route}</h4>
                        <p>Bus: ${item.bus} | Students: ${item.students}</p>
                    </div>
                    <div class="schedule-status">
                        <span class="status-badge ${item.status}">${item.status}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading schedule:', error);
    }
}

// Update time
function updateTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        timeElement.innerHTML = `${timeString}<br><small>${dateString}</small>`;
    }
}

// Quick action functions
function startTrip() {
    showToast('Starting trip...', 'info');
    // In real app, this would start GPS tracking and notify admin
}

function markAttendance() {
    showToast('Opening attendance modal...', 'info');
    // In real app, this would open an attendance modal
}

function sendEmergencyAlert() {
    if (confirm('Are you sure you want to send an emergency alert?')) {
        showToast('Emergency alert sent!', 'error');
        // In real app, this would notify admin and emergency services
    }
}

function viewRouteMap() {
    showToast('Opening route map...', 'info');
    // In real app, this would open a map view
}

// Profile functions
function viewProfile() {
    showToast('Loading profile...', 'info');
    // In real app, this would show driver profile details
}

function editProfile() {
    showToast('Opening profile editor...', 'info');
    // In real app, this would open a profile editing modal
}

// Settings functions
function viewSettings() {
    showToast('Loading settings...', 'info');
    // In real app, this would show driver settings
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    
    // Set icon based on type
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
    } else if (type === 'info') {
        toastIcon.className = 'fas fa-info-circle';
    }
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Load dashboard data
function loadDashboardData() {
    loadDriverStats();
    loadSchedule();
}

// Load profile data
function loadProfile() {
    showToast('Loading profile...', 'info');
    // In real app, this would load and display driver profile
}

// Load settings data
function loadSettings() {
    showToast('Loading settings...', 'info');
    // In real app, this would load and display driver settings
}

// Load attendance data
async function loadAttendance() {
    const driverInfo = JSON.parse(localStorage.getItem('userData') || '{}');
    const tbody = document.querySelector('#attendance-section tbody');
    
    if (tbody) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3003/api/drivers/students', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                tbody.innerHTML = result.data.map(student => `
                    <tr>
                        <td>${student.student_id}</td>
                        <td>
                            <div class="student-info">
                                <div class="student-avatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="student-details">
                                    <strong>${student.first_name} ${student.last_name}</strong>
                                    <small>Grade ${student.grade}</small>
                                </div>
                            </div>
                        </td>
                        <td>${student.grade}</td>
                        <td>${student.parent_phone || 'N/A'}</td>
                        <td>
                            <button class="btn btn-sm btn-success" onclick="markAttendance(${student.id}, 'present')">
                                <i class="fas fa-check"></i> Present
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="markAttendance(${student.id}, 'absent')">
                                <i class="fas fa-times"></i> Absent
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No students assigned to your route yet.</td></tr>';
            }
        } catch (error) {
            console.error('Error loading attendance data:', error);
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Error loading students. Please try again.</td></tr>';
        }
    }
}

// Mark student attendance
async function markAttendance(studentId, status) {
    try {
        const token = localStorage.getItem('token');
        const today = new Date().toISOString().split('T')[0];
        
        const response = await fetch('http://localhost:3003/api/drivers/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                studentId: studentId,
                status: status,
                date: today,
                notes: 'Marked by driver'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(`Student marked as ${status}`, 'success');
        } else {
            showToast('Failed to mark attendance', 'error');
        }
    } catch (error) {
        console.error('Error marking attendance:', error);
        showToast('Error marking attendance', 'error');
    }
}

// Load notifications
function loadNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
    
    if (notificationsList) {
        // Mock notifications data
        const notifications = [
            {
                icon: 'info-circle',
                type: 'info',
                title: 'Route Update',
                message: 'Your morning route has been updated with a new stop.',
                time: '2 hours ago'
            },
            {
                icon: 'exclamation-triangle',
                type: 'warning',
                title: 'Maintenance Reminder',
                message: 'Bus maintenance scheduled for next weekend.',
                time: '1 day ago'
            },
            {
                icon: 'check-circle',
                type: 'success',
                title: 'Performance Review',
                message: 'Great job this month! Your on-time performance is 98%.',
                time: '3 days ago'
            }
        ];
        
        notificationsList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.type}">
                <div class="notification-icon">
                    <i class="fas fa-${notification.icon}"></i>
                </div>
                <div class="notification-content">
                    <strong>${notification.title}</strong>
                    <p>${notification.message}</p>
                    <small>${notification.time}</small>
                </div>
            </div>
        `).join('');
    }
}

// QR Code functions
function generateNewQR() {
    const driverInfoStr = localStorage.getItem('userData');
    if (!driverInfoStr) return;
    
    const driver = JSON.parse(driverInfoStr);
    const date = new Date().toISOString().split('T')[0];
    
    // Create a payload that parents will scan
    const payload = JSON.stringify({
        driverId: driver.id,
        busId: driver.busId || 'BUS-UNKNOWN',
        date: date,
        session: new Date().getHours() < 12 ? 'morning' : 'afternoon'
    });
    
    // Generate new QR Code via API
    const qrImage = document.getElementById('qrImage');
    if (qrImage) {
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(payload)}`;
        showToast('Generated new QR code successfully!', 'success');
    }
}

function printQR() {
    const qrImage = document.getElementById('qrImage');
    if (!qrImage) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Print QR Code</title>
            <style>
                body { text-align: center; font-family: Arial, sans-serif; padding-top: 50px; }
                img { width: 300px; height: 300px; }
            </style>
        </head>
        <body>
            <h1>Bus Attendance QR</h1>
            <img src="${qrImage.src}" />
            <p>Parents: Scan this code using the Parent Dashboard</p>
        </body>
        </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}
