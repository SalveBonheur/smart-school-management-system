// Parent Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Setup navigation
    setupNavigation();
    
    // Load parent data
    loadParentData();
    
    // Load dashboard data
    loadDashboardData();
    
    // Setup global search
    setupGlobalSearch();
    
    // Update time
    updateTime();
    setInterval(updateTime, 1000);
});

// Initialize dashboard
function initializeDashboard() {
    // Check authentication
    const token = localStorage.getItem('parentToken');
    const parentInfo = localStorage.getItem('parentInfo');
    const studentInfo = localStorage.getItem('studentInfo');
    
    if (!token || !parentInfo) {
        window.location.href = 'parent-login.html';
        return;
    }
    
    // Parse data
    const parent = JSON.parse(parentInfo);
    const student = studentInfo ? JSON.parse(studentInfo) : null;
    
    // Update UI with parent data
    document.getElementById('parentName').textContent = parent.fullName;
    
    // Update UI with student data
    if (student) {
        updateStudentInfo(student);
    }
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
    
    // Update page title
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace('-', ' ');
    }
    
    // Load section-specific data
    loadSectionData(sectionName);
}

// Load section-specific data
function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'profile':
            loadProfileData();
            break;
        case 'attendance':
            loadAttendanceData();
            break;
        case 'payments':
            loadPaymentsData();
            break;
        case 'notifications':
            loadNotificationsData();
            break;
        case 'transport-card':
            loadTransportCardData();
            break;
    }
}

// Load parent data
function loadParentData() {
    const parentInfo = localStorage.getItem('parentInfo');
    const studentInfo = localStorage.getItem('studentInfo');
    
    if (parentInfo) {
        const parent = JSON.parse(parentInfo);
        document.getElementById('parentName').textContent = parent.fullName;
    }
    
    if (studentInfo) {
        const student = JSON.parse(studentInfo);
        updateStudentInfo(student);
    }
}

// Update student information across the dashboard
function updateStudentInfo(student) {
    // Dashboard stats
    document.getElementById('studentName').textContent = `${student.firstName} ${student.lastName}`;
    document.getElementById('studentGrade').textContent = student.grade;
    document.getElementById('busNumber').textContent = student.busNumber || 'Not Assigned';
    document.getElementById('routeName').textContent = student.routeName || 'Not Assigned';
    document.getElementById('driverName').textContent = student.driverName || 'Not Assigned';
    document.getElementById('driverPhone').textContent = student.driverPhone || 'Not Available';
    document.getElementById('pickupLocation').textContent = student.address || 'Not Available';
    
    // Profile section
    document.getElementById('profileStudentName').textContent = `${student.firstName} ${student.lastName}`;
    document.getElementById('profileStudentId').textContent = student.studentId;
    document.getElementById('profileGrade').textContent = student.grade;
    document.getElementById('profileAddress').textContent = student.address || 'Not Available';
    document.getElementById('profileBusNumber').textContent = student.busNumber || 'Not Assigned';
    document.getElementById('profileRouteName').textContent = student.routeName || 'Not Assigned';
    document.getElementById('profilePickupLocation').textContent = student.address || 'Not Available';
    document.getElementById('profileDriverName').textContent = student.driverName || 'Not Assigned';
    document.getElementById('profileDriverPhone').textContent = student.driverPhone || 'Not Available';
    
    // Transport card
    document.getElementById('cardStudentName').textContent = `${student.firstName} ${student.lastName}`;
    document.getElementById('cardStudentId').textContent = student.studentId;
    document.getElementById('cardGrade').textContent = student.grade;
    document.getElementById('cardBusNumber').textContent = student.busNumber || 'Not Assigned';
    document.getElementById('cardRouteName').textContent = student.routeName || 'Not Assigned';
}

// Load dashboard data
function loadDashboardData() {
    const studentInfo = localStorage.getItem('studentInfo');
    if (studentInfo) {
        const student = JSON.parse(studentInfo);
        updateStudentInfo(student);
    }
    
    // Load recent activity
    loadRecentActivity();
}

// Load recent activity
function loadRecentActivity() {
    const activities = [
        {
            icon: 'info-circle',
            type: 'info',
            title: 'Welcome to Smart Transport',
            details: 'Track your child\'s transport activities',
            time: 'Just now'
        }
    ];
    
    const activityList = document.getElementById('recentActivity');
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

// Load profile data
function loadProfileData() {
    // Profile data is already loaded in updateStudentInfo
    console.log('Profile data loaded');
}

// Load attendance data
async function loadAttendanceData() {
    const parentInfo = localStorage.getItem('parentInfo');
    if (!parentInfo) return;
    
    const parent = JSON.parse(parentInfo);
    
    try {
        const response = await fetch(`http://localhost:3006/api/parents/attendance/${parent.id}`);
        const result = await response.json();
        
        if (result.success) {
            const attendance = result.data;
            displayAttendanceData(attendance);
        } else {
            console.error('Failed to load attendance data');
        }
    } catch (error) {
        console.error('Error loading attendance data:', error);
        // Show mock data for demo
        displayMockAttendanceData();
    }
}

// Display attendance data
function displayAttendanceData(attendance) {
    const tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;
    
    if (attendance.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No attendance records available</td></tr>';
        return;
    }
    
    // Calculate statistics
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;
    const lateCount = attendance.filter(a => a.status === 'late').length;
    
    document.getElementById('presentCount').textContent = presentCount;
    document.getElementById('absentCount').textContent = absentCount;
    document.getElementById('lateCount').textContent = lateCount;
    
    // Display attendance records
    tbody.innerHTML = attendance.map(record => `
        <tr>
            <td>${new Date(record.date).toLocaleDateString()}</td>
            <td>${record.check_in || 'N/A'}</td>
            <td>${record.check_out || 'N/A'}</td>
            <td><span class="status-badge ${record.status}">${record.status}</span></td>
            <td>${record.bus_number || 'N/A'}</td>
        </tr>
    `).join('');
}

// Display mock attendance data
function displayMockAttendanceData() {
    const mockAttendance = [
        {
            date: new Date().toISOString().split('T')[0],
            check_in: '07:30 AM',
            check_out: '03:30 PM',
            status: 'present',
            bus_number: 'BUS-001'
        },
        {
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            check_in: '07:45 AM',
            check_out: '03:30 PM',
            status: 'late',
            bus_number: 'BUS-001'
        }
    ];
    
    displayAttendanceData(mockAttendance);
}

// Load payments data
async function loadPaymentsData() {
    const parentInfo = localStorage.getItem('parentInfo');
    if (!parentInfo) return;
    
    const parent = JSON.parse(parentInfo);
    
    try {
        const response = await fetch(`http://localhost:3006/api/parents/payments/${parent.id}`);
        const result = await response.json();
        
        if (result.success) {
            const { payments, summary } = result.data;
            displayPaymentsData(payments, summary);
        } else {
            console.error('Failed to load payments data');
        }
    } catch (error) {
        console.error('Error loading payments data:', error);
        // Show mock data for demo
        displayMockPaymentsData();
    }
}

// Display payments data
function displayPaymentsData(payments, summary) {
    const tbody = document.getElementById('paymentTableBody');
    if (!tbody) return;
    
    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No payment records available</td></tr>';
        return;
    }
    
    // Update summary
    document.getElementById('totalPaid').textContent = `RWF ${summary.totalPaid.toLocaleString()}`;
    document.getElementById('totalUnpaid').textContent = `RWF ${summary.totalUnpaid.toLocaleString()}`;
    
    // Display payment records
    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td>${new Date(payment.payment_date).toLocaleDateString()}</td>
            <td>RWF ${parseFloat(payment.amount).toLocaleString()}</td>
            <td>${payment.payment_method || 'Cash'}</td>
            <td><span class="status-badge ${payment.status}">${payment.status}</span></td>
            <td>${payment.description || 'Transport Fee'}</td>
        </tr>
    `).join('');
}

// Display mock payments data
function displayMockPaymentsData() {
    const mockPayments = [
        {
            payment_date: new Date().toISOString().split('T')[0],
            amount: 50000,
            payment_method: 'Mobile Money',
            status: 'paid',
            description: 'Monthly Transport Fee'
        },
        {
            payment_date: new Date(Date.now() - 2592000000).toISOString().split('T')[0],
            amount: 50000,
            payment_method: 'Cash',
            status: 'paid',
            description: 'Monthly Transport Fee'
        }
    ];
    
    const mockSummary = {
        totalPaid: 100000,
        totalUnpaid: 0,
        balance: 0
    };
    
    displayPaymentsData(mockPayments, mockSummary);
}

// Load notifications data
function loadNotificationsData() {
    const notifications = [
        {
            icon: 'info-circle',
            type: 'info',
            title: 'Welcome to Smart Transport',
            message: 'You can track your child\'s transport activities here',
            time: 'Just now'
        },
        {
            icon: 'check-circle',
            type: 'success',
            title: 'Bus Assignment Confirmed',
            message: 'Your child has been assigned to Bus BUS-001',
            time: '2 hours ago'
        }
    ];
    
    const notificationList = document.getElementById('notificationList');
    if (notificationList) {
        notificationList.innerHTML = notifications.map(notification => `
            <div class="notification-item">
                <div class="notification-icon ${notification.type}">
                    <i class="fas fa-${notification.icon}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <span class="notification-time">${notification.time}</span>
                </div>
            </div>
        `).join('');
    }
    
    // Update notification badge
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = notifications.length;
    }
}

// Load transport card data
function loadTransportCardData() {
    // Transport card data is already loaded in updateStudentInfo
    console.log('Transport card data loaded');
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
    console.log('Searching for:', searchTerm);
    // In real app, this would search across all sections
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
    sidebar.classList.toggle('collapsed');
    
    const mainContent = document.querySelector('.main-content');
    mainContent.classList.toggle('expanded');
}

// Refresh data
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

// Show notifications
function showNotifications() {
    showToast('Opening notifications...', 'info');
    // In real app, this would show a notifications panel
}

// Download transport card
function downloadTransportCard() {
    showToast('Downloading transport card...', 'info');
    
    // Create a simple PDF download (in real app, use a proper PDF library)
    const studentInfo = localStorage.getItem('studentInfo');
    if (studentInfo) {
        const student = JSON.parse(studentInfo);
        
        // Create a simple text file for demo
        const cardContent = `
SMART TRANSPORT CARD
==================

Student Name: ${student.firstName} ${student.lastName}
Student ID: ${student.studentId}
Grade: ${student.grade}
Bus Number: ${student.busNumber || 'Not Assigned'}
Route: ${student.routeName || 'Not Assigned'}
Driver: ${student.driverName || 'Not Assigned'}
Driver Phone: ${student.driverPhone || 'Not Available'}

Valid for: 2024-2025 Academic Year
        `;
        
        const blob = new Blob([cardContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transport-card-${student.studentId}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showToast('Transport card downloaded successfully!', 'success');
    }
}

// Print transport card
function printTransportCard() {
    showToast('Preparing print...', 'info');
    
    // Create a print-friendly version
    const studentInfo = localStorage.getItem('studentInfo');
    if (studentInfo) {
        const student = JSON.parse(studentInfo);
        
        const printContent = `
            <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
                <h2>SMART TRANSPORT CARD</h2>
                <div style="border: 2px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 10px;">
                    <h3>${student.firstName} ${student.lastName}</h3>
                    <p><strong>ID:</strong> ${student.studentId}</p>
                    <p><strong>Grade:</strong> ${student.grade}</p>
                    <p><strong>Bus:</strong> ${student.busNumber || 'Not Assigned'}</p>
                    <p><strong>Route:</strong> ${student.routeName || 'Not Assigned'}</p>
                    <p><strong>Driver:</strong> ${student.driverName || 'Not Assigned'}</p>
                </div>
                <p style="font-size: 12px; color: #666;">Valid for 2024-2025 Academic Year</p>
            </div>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
        
        showToast('Print dialog opened!', 'success');
    }
}

// Update time
function updateTime() {
    const timeElements = document.querySelectorAll('.current-time');
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    timeElements.forEach(element => {
        element.textContent = timeString;
    });
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('parentToken');
        localStorage.removeItem('parentInfo');
        localStorage.removeItem('studentInfo');
        window.location.href = 'parent-login.html';
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></span>
        <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide toast after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Add status badge styles
const statusStyles = `
    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .status-badge.present {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        border: 1px solid rgba(34, 197, 94, 0.3);
    }
    
    .status-badge.absent {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }
    
    .status-badge.late {
        background: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
    }
    
    .status-badge.paid {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        border: 1px solid rgba(34, 197, 94, 0.3);
    }
    
    .status-badge.unpaid {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }
`;

// Add styles to page
const styleSheet = document.createElement('style');
styleSheet.textContent = statusStyles;
document.head.appendChild(styleSheet);
