// Fixed Admin Dashboard JavaScript - Comprehensive Solution

console.log('Fixed admin dashboard JavaScript loaded successfully');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing fixed dashboard...');
    
    // Initialize dashboard
    initializeFixedDashboard();
    
    // Load dashboard data
    loadDashboardData();
    
    // Setup global search
    setupGlobalSearch();
    
    // Initialize charts
    initializeCharts();
    
    // Setup form handlers
    setupFormHandlers();
    
    // Load real data from storage
    loadAllData();
});

// ==================== FORM HANDLERS ====================

function setupFormHandlers() {
    // Student form
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAdminStudent(e);
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const studentModal = document.getElementById('studentModal');
        if (event.target === studentModal) {
            closeStudentModal();
        }
        const driverModal = document.getElementById('driverModal');
        if (event.target === driverModal) {
            closeDriverModal();
        }
        const busModal = document.getElementById('busModal');
        if (event.target === busModal) {
            closeBusModal();
        }
        const routeModal = document.getElementById('routeModal');
        if (event.target === routeModal) {
            closeRouteModal();
        }
    });
}

// ==================== INITIALIZATION ====================

function initializeFixedDashboard() {
    console.log('Initializing fixed dashboard...');
    
    // Ensure all sections are properly hidden except dashboard
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show dashboard by default
    const dashboardSection = document.getElementById('dashboard-section');
    if (dashboardSection) {
        dashboardSection.classList.add('active');
    }
    
    // Set active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === 'dashboard') {
            item.classList.add('active');
        }
    });
    
    console.log('Fixed dashboard initialized');
}

// ==================== NAVIGATION SYSTEM ====================

// Show section - Fixed version with error handling
window.showSection = function(sectionName) {
    console.log('Showing section:', sectionName);
    
    try {
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        
        // Show target section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
            console.log('Successfully showed section:', sectionName);
        } else {
            console.error('Section not found:', sectionName + '-section');
            // Show error message
            showNotification(`Section "${sectionName}" not found`, 'error');
            return;
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
        
    } catch (error) {
        console.error('Error in showSection:', error);
        showNotification('Error switching sections', 'error');
    }
};

// Load section-specific data - Fixed version
function loadSectionData(sectionName) {
    console.log('Loading data for section:', sectionName);
    
    try {
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
            case 'qr-attendance':
                loadQRAttendance();
                break;
            case 'bus-status':
                loadBusStatus();
                break;
            case 'maintenance':
                loadMaintenance();
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
            default:
                console.log('No specific data loader for section:', sectionName);
        }
    } catch (error) {
        console.error('Error loading section data:', error);
        showNotification('Error loading section data', 'error');
    }
}

// ==================== DATA LOADING FUNCTIONS ====================

// Load all data from database
async function loadAllData() {
    try {
        console.log('Loading all data...');
        
        // Load data in parallel
        const promises = [
            updateDashboardWithRealData(),
            loadStudents(),
            loadDrivers(),
            loadBuses(),
            loadRoutes(),
            loadAttendance(),
            loadPayments(),
            loadDriverApproval()
        ];
        
        await Promise.allSettled(promises);
        console.log('All data loaded successfully');
        
    } catch (error) {
        console.error('Error loading all data:', error);
        showNotification('Error loading system data', 'error');
    }
}

// Load dashboard data - Fixed version
async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        
        // Update stats with real data
        await updateDashboardWithRealData();
        
        // Initialize animated counters
        if (window.ModernDashboard) {
            window.ModernDashboard.prototype.initAnimatedCounters();
        }
        
        console.log('Dashboard data loaded');
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard', 'error');
    }
}

// Load students - Fixed version with better error handling
async function loadStudents() {
    try {
        console.log('Loading students...');
        
        const token = localStorage.getItem('adminToken');
        if (!token) {
            console.log('No admin token found, showing empty state');
            showEmptyStudentsTable();
            return;
        }
        
        const response = await fetch('http://localhost:3006/api/admin/students', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const tbody = document.querySelector('#students-section tbody');
        
        if (tbody) {
            if (!result.success || result.data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 2rem;">
                            <div style="text-align: center;">
                                <i class="fas fa-users" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                                <p style="color: #666;">No students registered yet</p>
                                <p style="color: #999; font-size: 0.9rem;">Click "Add Student" to get started</p>
                            </div>
                        </td>
                    </tr>
                `;
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
                                    <strong>${student.full_name || 'N/A'}</strong>
                                    <small>${student.parent_email || 'No email'}</small>
                                </div>
                            </div>
                        </td>
                        <td>${student.grade || 'N/A'}</td>
                        <td>${student.parent_phone || 'N/A'}</td>
                        <td>${student.route_name || 'Not assigned'}</td>
                        <td><span class="status-badge ${student.status || 'active'}">${student.status || 'Active'}</span></td>
                        <td>
                            <button class="btn-icon" onclick="editStudent('${student.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="deleteStudent('${student.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
                
                // Initialize enhanced table if available
                if (window.EnhancedTable) {
                    const table = document.querySelector('#students-section table');
                    if (table && !table.dataset.enhanced) {
                        table.dataset.enhanced = 'true';
                        new window.EnhancedTable('students-section', {
                            itemsPerPage: 10,
                            sortable: true,
                            filterable: true,
                            exportable: true
                        });
                    }
                }
            }
        }
        
        console.log('Students loaded successfully');
        
    } catch (error) {
        console.error('Error loading students:', error);
        showEmptyStudentsTable();
        showNotification('Error loading students', 'error');
    }
}

// Show empty students table
function showEmptyStudentsTable() {
    const tbody = document.querySelector('#students-section tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    <div style="text-align: center;">
                        <i class="fas fa-users" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                        <p style="color: #666;">No students registered yet</p>
                        <p style="color: #999; font-size: 0.9rem;">Click "Add Student" to get started</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Load drivers - Fixed version
async function loadDrivers() {
    try {
        console.log('Loading drivers...');
        
        const token = localStorage.getItem('adminToken');
        if (!token) {
            showEmptyDriversTable();
            return;
        }
        
        const response = await fetch('http://localhost:3006/api/admin/drivers', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const tbody = document.querySelector('#drivers-section tbody');
        
        if (tbody) {
            if (!result.success || result.data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 2rem;">
                            <div style="text-align: center;">
                                <i class="fas fa-id-card" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                                <p style="color: #666;">No drivers registered yet</p>
                                <p style="color: #999; font-size: 0.9rem;">Click "Add Driver" to get started</p>
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = result.data.map(driver => `
                    <tr>
                        <td>#${driver.id}</td>
                        <td>${driver.first_name} ${driver.last_name}</td>
                        <td>${driver.license_number}</td>
                        <td>${driver.phone}</td>
                        <td>${driver.assigned_bus || 'Not assigned'}</td>
                        <td><span class="status-badge ${driver.status || 'active'}">${driver.status || 'Active'}</span></td>
                        <td>
                            <button class="btn-icon" onclick="editDriver('${driver.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="deleteDriver('${driver.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }
        
        console.log('Drivers loaded successfully');
        
    } catch (error) {
        console.error('Error loading drivers:', error);
        showEmptyDriversTable();
        showNotification('Error loading drivers', 'error');
    }
}

// Show empty drivers table
function showEmptyDriversTable() {
    const tbody = document.querySelector('#drivers-section tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    <div style="text-align: center;">
                        <i class="fas fa-id-card" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                        <p style="color: #666;">No drivers registered yet</p>
                        <p style="color: #999; font-size: 0.9rem;">Click "Add Driver" to get started</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Placeholder functions for other data loaders
async function loadBuses() {
    console.log('Loading buses...');
    // Implementation similar to loadStudents
}

async function loadRoutes() {
    console.log('Loading routes...');
    // Implementation similar to loadStudents
}

async function loadAttendance() {
    console.log('Loading attendance...');
    // Implementation similar to loadStudents
}

async function loadPayments() {
    console.log('Loading payments...');
    // Implementation similar to loadStudents
}

async function loadQRAttendance() {
    console.log('Loading QR attendance...');
    // Implementation for QR attendance
}

async function loadBusStatus() {
    console.log('Loading bus status...');
    // Implementation for bus status
}

async function loadMaintenance() {
    console.log('Loading maintenance...');
    // Implementation for maintenance
}

async function loadReports() {
    console.log('Loading reports...');
    // Implementation for reports
}

async function loadSettings() {
    console.log('Loading settings...');
    // Implementation for settings
}

async function loadDriverApproval() {
    console.log('Loading driver approval...');
    // Implementation for driver approval
}

// ==================== UTILITY FUNCTIONS ====================

// Update dashboard with real data
async function updateDashboardWithRealData() {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        
        // Fetch dashboard statistics
        const response = await fetch('http://localhost:3006/api/admin/dashboard-stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const stats = await response.json();
            
            // Update dashboard counters
            updateCounter('totalStudents', stats.totalStudents || 0);
            updateCounter('totalDrivers', stats.totalDrivers || 0);
            updateCounter('totalBuses', stats.totalBuses || 0);
            updateCounter('totalRoutes', stats.totalRoutes || 0);
            updateCounter('monthlyRevenue', stats.monthlyRevenue || 0);
        }
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

// Update counter with animation
function updateCounter(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = typeof value === 'number' && value > 999 ? 
            (value / 1000).toFixed(1) + 'K+' : value.toString();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Use existing toast system or create simple alert
    if (window.ModernDashboard && window.ModernDashboard.prototype.showToast) {
        window.ModernDashboard.prototype.showToast(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// Setup global search
function setupGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            console.log('Global search:', searchTerm);
            // Implement global search logic
        });
    }
}

// Initialize charts
function initializeCharts() {
    console.log('Initializing charts...');
    // Chart initialization code
}

// ==================== MODAL FUNCTIONS ====================

// Open student modal
window.openStudentModal = function(studentId = null) {
    console.log('Opening student modal:', studentId);
    const modal = document.getElementById('studentModal');
    const form = document.getElementById('studentForm');
    const title = document.getElementById('studentModalTitle');
    
    if (!modal || !form) {
        showNotification('Modal not found', 'error');
        return;
    }
    
    // Store the student ID for editing
    modal.dataset.studentId = studentId || '';
    
    if (studentId) {
        title.textContent = 'Edit Student';
        // Load student data for editing
        loadStudentForEdit(studentId);
    } else {
        title.textContent = 'Add New Student';
        form.reset();
    }
    
    modal.style.display = 'block';
    modal.classList.add('active');
};

// Close student modal
window.closeStudentModal = function() {
    const modal = document.getElementById('studentModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        modal.dataset.studentId = '';
    }
};

// Load student data for editing
async function loadStudentForEdit(studentId) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`http://localhost:3006/api/admin/students`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            const student = result.data.find(s => s.id == studentId);
            if (student) {
                const form = document.getElementById('studentForm');
                // Parse full_name into first and last name
                const fullName = student.full_name || '';
                const nameParts = fullName.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                form.querySelector('[name="firstName"]').value = firstName;
                form.querySelector('[name="lastName"]').value = lastName;
                form.querySelector('[name="email"]').value = student.parent_email || '';
                form.querySelector('[name="phone"]').value = student.parent_phone || '';
                form.querySelector('[name="grade"]').value = student.grade || '';
                form.querySelector('[name="route"]').value = student.route_id || '';
                form.querySelector('[name="address"]').value = student.address || '';
                form.querySelector('[name="parentName"]').value = student.parent_name || '';
                form.querySelector('[name="parentPhone"]').value = student.parent_phone || '';
                form.querySelector('[name="parentEmail"]').value = student.parent_email || '';
                form.querySelector('[name="emergencyContact"]').value = student.emergency_contact || '';
            }
        }
    } catch (error) {
        console.error('Error loading student for edit:', error);
        showNotification('Error loading student data', 'error');
    }
}

// Save admin student (create or update)
async function saveAdminStudent(event) {
    if (event) event.preventDefault();
    
    const form = document.getElementById('studentForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const modal = document.getElementById('studentModal');
    const studentId = modal ? modal.dataset.studentId : '';
    
    if (!form.checkValidity()) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    const formData = new FormData(form);
    const routeValue = formData.get('route');
    const routeId = routeValue && !isNaN(parseInt(routeValue)) ? parseInt(routeValue) : null;

    const data = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        grade: formData.get('grade'),
        routeId: routeId,
        address: formData.get('address'),
        parentName: formData.get('parentName'),
        parentPhone: formData.get('parentPhone'),
        parentEmail: formData.get('parentEmail'),
        emergencyContact: formData.get('emergencyContact'),
        parentId: null // Will be set if parent exists
    };
    
    // Show loading
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    }
    
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
                body: JSON.stringify(data)
            });
        } else {
            // Create new student
            response = await fetch('http://localhost:3006/api/admin/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
        }
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showNotification(studentId ? 'Student updated successfully' : 'Student added successfully', 'success');
            closeStudentModal();
            await loadStudents();
        } else {
            showNotification(result.error || 'Error saving student', 'error');
        }
    } catch (error) {
        console.error('Error saving student:', error);
        showNotification('Error saving student: ' + error.message, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Student';
        }
    }
}

// Edit student
window.editStudent = function(studentId) {
    openStudentModal(studentId);
};

// Delete student
window.deleteStudent = async function(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`http://localhost:3006/api/admin/students/${studentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showNotification('Student deleted successfully', 'success');
            await loadStudents();
        } else {
            showNotification(result.error || 'Error deleting student', 'error');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showNotification('Error deleting student: ' + error.message, 'error');
    }
};

// Edit driver
window.editDriver = function(driverId) {
    console.log('Editing driver:', driverId);
    showNotification('Edit driver feature coming soon', 'info');
};

// Delete driver
window.deleteDriver = function(driverId) {
    console.log('Deleting driver:', driverId);
    if (confirm('Are you sure you want to delete this driver?')) {
        showNotification('Delete driver feature coming soon', 'info');
    }
};

// Export functions
window.exportStudents = function() {
    console.log('Exporting students...');
    showNotification('Export students feature coming soon', 'info');
};

window.exportDrivers = function() {
    console.log('Exporting drivers...');
    showNotification('Export drivers feature coming soon', 'info');
};

// ==================== SYSTEM FUNCTIONS ====================

// Logout
window.logout = function() {
    console.log('Logging out...');
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html';
};

// Refresh data
window.refreshData = function() {
    console.log('Refreshing data...');
    loadAllData();
    showNotification('Data refreshed', 'success');
};

// Toggle sidebar
window.toggleSidebar = function() {
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
};

console.log('Fixed admin dashboard JavaScript loaded completely');
