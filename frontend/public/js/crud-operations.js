/**
 * CRUD Operations Module
 * Complete implementation of all Create, Read, Update, Delete operations
 * for the Smart School Transport Management System
 */

const API_BASE_URL = 'http://localhost:3003/api';
let currentEditId = null;
let currentSection = null;

// ==================== UTILITY FUNCTIONS ====================

// Get admin token from localStorage
function getToken() {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
}

// Show loading state
function showLoading(button, show = true) {
    if (!button) return;
    const originalText = button.innerHTML;
    if (show) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        button.dataset.originalText = originalText;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || originalText;
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) {
        // Create toast if not exists
        const newToast = document.createElement('div');
        newToast.id = 'toast';
        newToast.className = `toast ${type}`;
        newToast.innerHTML = `<span class="toast-icon"></span><span class="toast-message">${message}</span>`;
        document.body.appendChild(newToast);
        
        setTimeout(() => {
            newToast.classList.remove('show');
            setTimeout(() => newToast.remove(), 300);
        }, 3000);
    } else {
        const icon = toast.querySelector('.toast-icon');
        const msg = toast.querySelector('.toast-message');
        
        icon.innerHTML = type === 'success' ? '<i class="fas fa-check"></i>' : 
                        type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' :
                        type === 'warning' ? '<i class="fas fa-exclamation-triangle"></i>' :
                        '<i class="fas fa-info-circle"></i>';
        
        msg.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// API Call function
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const token = getToken();
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return null;
        }

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message || 'An error occurred', 'error');
        return null;
    }
}

// ==================== STUDENT OPERATIONS ====================

// Open student modal for add/edit
window.openStudentModal = async function(studentId = null) {
    const modal = document.getElementById('studentModal');
    const form = document.getElementById('studentForm');
    const title = document.getElementById('studentModalTitle');
    
    if (!modal || !form) {
        showToast('Modal not found', 'error');
        return;
    }

    currentEditId = studentId;
    
    if (studentId) {
        title.textContent = 'Edit Student';
        
        // Load student data
        const result = await apiCall(`/students/${studentId}`);
        if (result && result.data) {
            const student = result.data;
            form.querySelector('[name="firstName"]').value = student.full_name?.split(' ')[0] || '';
            form.querySelector('[name="lastName"]').value = student.full_name?.split(' ').slice(1).join(' ') || '';
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
    }
    currentEditId = null;
};

// Save student (create or update)
window.saveStudent = async function(event) {
    if (event) event.preventDefault();
    
    const form = document.getElementById('studentForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!form.checkValidity()) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }

    const formData = new FormData(form);
    const data = {
        full_name: `${formData.get('firstName')} ${formData.get('lastName')}`,
        parent_email: formData.get('email'),
        parent_phone: formData.get('parentPhone'),
        grade: formData.get('grade'),
        route_id: formData.get('route') || null,
        address: formData.get('address'),
        parent_name: formData.get('parentName'),
        parent_phone: formData.get('parentPhone'),
        parent_email: formData.get('parentEmail'),
        emergency_contact: formData.get('emergencyContact'),
        admission_date: new Date().toISOString().split('T')[0],
        status: 'active'
    };

    showLoading(submitBtn);

    try {
        let result;
        if (currentEditId) {
            result = await apiCall(`/students/${currentEditId}`, 'PUT', data);
            if (result && result.success) {
                showToast('Student updated successfully', 'success');
            }
        } else {
            // For new student, generate student_id
            data.student_id = `STU-${Date.now()}`;
            data.date_of_birth = new Date().toISOString().split('T')[0];
            result = await apiCall('/students', 'POST', data);
            if (result && result.success) {
                showToast('Student added successfully', 'success');
            }
        }

        if (result && result.success) {
            closeStudentModal();
            await loadStudents();
        }
    } catch (error) {
        showToast('Error saving student: ' + error.message, 'error');
    } finally {
        showLoading(submitBtn, false);
    }
};

// Delete student
window.deleteStudent = async function(studentId) {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        return;
    }

    try {
        showToast('Deleting student...', 'info');
        const result = await apiCall(`/students/${studentId}`, 'DELETE');
        
        if (result && result.success) {
            showToast('Student deleted successfully', 'success');
            await loadStudents();
        }
    } catch (error) {
        showToast('Error deleting student: ' + error.message, 'error');
    }
};

// Load and display students
async function loadStudents() {
    try {
        const tbody = document.querySelector('#students-section tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

        const result = await apiCall('/students');
        
        if (!result || !result.data || result.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-users" style="font-size: 3rem; color: #ccc;"></i>
                        <p style="color: #666;">No students registered yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = result.data.map(student => `
            <tr>
                <td>${student.student_id}</td>
                <td>${student.full_name}</td>
                <td>${student.grade}</td>
                <td>${student.parent_phone}</td>
                <td>${student.route_name || 'Not assigned'}</td>
                <td><span class="status-badge ${student.status}">${student.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="openStudentModal('${student.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteStudent('${student.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading students:', error);
        showToast('Error loading students', 'error');
    }
}

// ==================== DRIVER OPERATIONS ====================

// Open driver modal for add/edit
window.openDriverModal = async function(driverId = null) {
    const modal = document.getElementById('driverModal') || createDriverModal();
    const form = document.getElementById('driverForm');
    const title = modal.querySelector('.modal-header h3');
    
    currentEditId = driverId;
    
    if (driverId) {
        title.textContent = 'Edit Driver';
        const result = await apiCall(`/drivers/${driverId}`);
        if (result && result.data) {
            const driver = result.data;
            form.querySelector('[name="fullName"]').value = driver.full_name || '';
            form.querySelector('[name="email"]').value = driver.email || '';
            form.querySelector('[name="phone"]').value = driver.phone || '';
            form.querySelector('[name="licenseNumber"]').value = driver.license_number || '';
            form.querySelector('[name="licenseExpiry"]').value = driver.license_expiry || '';
        }
    } else {
        title.textContent = 'Add New Driver';
        form.reset();
    }
    
    modal.style.display = 'block';
    modal.classList.add('active');
};

// Create driver modal if not exists
function createDriverModal() {
    let modal = document.getElementById('driverModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'driverModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeDriverModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Driver</h3>
                <button class="close-btn" onclick="closeDriverModal()">&times;</button>
            </div>
            <form id="driverForm">
                <div class="modal-body">
                    <div class="form-group">
                        <label>Full Name *</label>
                        <input type="text" name="fullName" required>
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label>Phone *</label>
                        <input type="tel" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label>License Number *</label>
                        <input type="text" name="licenseNumber" required>
                    </div>
                    <div class="form-group">
                        <label>License Expiry *</label>
                        <input type="date" name="licenseExpiry" required>
                    </div>
                    <div class="form-group">
                        <label>Address</label>
                        <textarea name="address" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="closeDriverModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary" onclick="saveDriver(event)">
                        <i class="fas fa-save"></i> Save Driver
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Close driver modal
window.closeDriverModal = function() {
    const modal = document.getElementById('driverModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
    currentEditId = null;
};

// Save driver
window.saveDriver = async function(event) {
    if (event) event.preventDefault();
    
    const form = document.getElementById('driverForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!form.checkValidity()) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }

    const formData = new FormData(form);
    const data = {
        full_name: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        license_number: formData.get('licenseNumber'),
        license_expiry: formData.get('licenseExpiry'),
        address: formData.get('address')
    };

    showLoading(submitBtn);

    try {
        let result;
        if (currentEditId) {
            result = await apiCall(`/drivers/${currentEditId}`, 'PUT', data);
            if (result && result.success) {
                showToast('Driver updated successfully', 'success');
            }
        } else {
            data.hire_date = new Date().toISOString().split('T')[0];
            data.status = 'pending';
            result = await apiCall('/drivers', 'POST', data);
            if (result && result.success) {
                showToast('Driver added successfully', 'success');
            }
        }

        if (result && result.success) {
            closeDriverModal();
            await loadDrivers();
        }
    } catch (error) {
        showToast('Error saving driver: ' + error.message, 'error');
    } finally {
        showLoading(submitBtn, false);
    }
};

// Delete driver
window.deleteDriver = async function(driverId) {
    if (!confirm('Are you sure you want to delete this driver?')) {
        return;
    }

    try {
        showToast('Deleting driver...', 'info');
        const result = await apiCall(`/drivers/${driverId}`, 'DELETE');
        
        if (result && result.success) {
            showToast('Driver deleted successfully', 'success');
            await loadDrivers();
        }
    } catch (error) {
        showToast('Error deleting driver: ' + error.message, 'error');
    }
};

// Load drivers
async function loadDrivers() {
    try {
        const tbody = document.querySelector('#drivers-section tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

        const result = await apiCall('/drivers');
        
        if (!result || !result.data || result.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-id-card" style="font-size: 3rem; color: #ccc;"></i>
                        <p style="color: #666;">No drivers registered yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = result.data.map(driver => `
            <tr>
                <td>${driver.id}</td>
                <td>${driver.full_name}</td>
                <td>${driver.license_number}</td>
                <td>${driver.phone}</td>
                <td>${driver.bus_number || 'Not assigned'}</td>
                <td><span class="status-badge ${driver.status}">${driver.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="openDriverModal('${driver.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteDriver('${driver.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading drivers:', error);
        showToast('Error loading drivers', 'error');
    }
}

// Approve driver
window.approveDriver = async function(driverId) {
    try {
        showToast('Approving driver...', 'info');
        const result = await apiCall(`/drivers/${driverId}/status`, 'PUT', { status: 'approved' });
        
        if (result && result.success) {
            showToast('Driver approved successfully', 'success');
            await loadDrivers();
        }
    } catch (error) {
        showToast('Error approving driver: ' + error.message, 'error');
    }
};

// ==================== BUS OPERATIONS ====================

// Open bus modal
window.openBusModal = async function(busId = null) {
    const modal = document.getElementById('busModal') || createBusModal();
    const form = document.getElementById('busForm');
    const title = modal.querySelector('.modal-header h3');
    
    currentEditId = busId;
    
    // Load drivers for assignment
    const driversResult = await apiCall('/drivers');
    const driverSelect = form.querySelector('[name="driverId"]');
    if (driversResult && driversResult.data) {
        driverSelect.innerHTML = '<option value="">Select Driver</option>' +
            driversResult.data.map(d => `<option value="${d.id}">${d.full_name}</option>`).join('');
    }
    
    if (busId) {
        title.textContent = 'Edit Bus';
        const result = await apiCall(`/buses/${busId}`);
        if (result && result.data) {
            const bus = result.data;
            form.querySelector('[name="busNumber"]').value = bus.bus_number || '';
            form.querySelector('[name="registrationNumber"]').value = bus.registration_number || '';
            form.querySelector('[name="capacity"]').value = bus.capacity || '';
            form.querySelector('[name="model"]').value = bus.model || '';
            form.querySelector('[name="year"]').value = bus.year || '';
            form.querySelector('[name="driverId"]').value = bus.driver_id || '';
        }
    } else {
        title.textContent = 'Add New Bus';
        form.reset();
    }
    
    modal.style.display = 'block';
    modal.classList.add('active');
};

// Create bus modal
function createBusModal() {
    let modal = document.getElementById('busModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'busModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeBusModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Bus</h3>
                <button class="close-btn" onclick="closeBusModal()">&times;</button>
            </div>
            <form id="busForm">
                <div class="modal-body">
                    <div class="form-group">
                        <label>Bus Number *</label>
                        <input type="text" name="busNumber" required>
                    </div>
                    <div class="form-group">
                        <label>Registration Number *</label>
                        <input type="text" name="registrationNumber" required>
                    </div>
                    <div class="form-group">
                        <label>Capacity *</label>
                        <input type="number" name="capacity" required min="1">
                    </div>
                    <div class="form-group">
                        <label>Model</label>
                        <input type="text" name="model">
                    </div>
                    <div class="form-group">
                        <label>Year</label>
                        <input type="number" name="year">
                    </div>
                    <div class="form-group">
                        <label>Assign Driver</label>
                        <select name="driverId">
                            <option value="">Select Driver</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="closeBusModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary" onclick="saveBus(event)">
                        <i class="fas fa-save"></i> Save Bus
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Close bus modal
window.closeBusModal = function() {
    const modal = document.getElementById('busModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
    currentEditId = null;
};

// Save bus
window.saveBus = async function(event) {
    if (event) event.preventDefault();
    
    const form = document.getElementById('busForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!form.checkValidity()) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }

    const formData = new FormData(form);
    const data = {
        bus_number: formData.get('busNumber'),
        registration_number: formData.get('registrationNumber'),
        capacity: parseInt(formData.get('capacity')),
        model: formData.get('model'),
        year: parseInt(formData.get('year')) || new Date().getFullYear(),
        driver_id: formData.get('driverId') || null,
        status: 'active'
    };

    showLoading(submitBtn);

    try {
        let result;
        if (currentEditId) {
            result = await apiCall(`/buses/${currentEditId}`, 'PUT', data);
            if (result && result.success) {
                showToast('Bus updated successfully', 'success');
            }
        } else {
            result = await apiCall('/buses', 'POST', data);
            if (result && result.success) {
                showToast('Bus added successfully', 'success');
            }
        }

        if (result && result.success) {
            closeBusModal();
            await loadBuses();
        }
    } catch (error) {
        showToast('Error saving bus: ' + error.message, 'error');
    } finally {
        showLoading(submitBtn, false);
    }
};

// Delete bus
window.deleteBus = async function(busId) {
    if (!confirm('Are you sure you want to delete this bus?')) {
        return;
    }

    try {
        showToast('Deleting bus...', 'info');
        const result = await apiCall(`/buses/${busId}`, 'DELETE');
        
        if (result && result.success) {
            showToast('Bus deleted successfully', 'success');
            await loadBuses();
        }
    } catch (error) {
        showToast('Error deleting bus: ' + error.message, 'error');
    }
};

// Load buses
async function loadBuses() {
    try {
        const tbody = document.querySelector('#buses-section tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

        const result = await apiCall('/buses');
        
        if (!result || !result.data || result.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-bus" style="font-size: 3rem; color: #ccc;"></i>
                        <p style="color: #666;">No buses registered yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = result.data.map(bus => `
            <tr>
                <td>${bus.bus_number}</td>
                <td>${bus.registration_number}</td>
                <td>${bus.capacity}</td>
                <td>${bus.model}</td>
                <td>${bus.driver_name || 'Not assigned'}</td>
                <td><span class="status-badge ${bus.status}">${bus.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="openBusModal('${bus.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteBus('${bus.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading buses:', error);
        showToast('Error loading buses', 'error');
    }
}

// ==================== ROUTE OPERATIONS ====================

// Open route modal
window.openRouteModal = async function(routeId = null) {
    const modal = document.getElementById('routeModal') || createRouteModal();
    const form = document.getElementById('routeForm');
    const title = modal.querySelector('.modal-header h3');
    
    currentEditId = routeId;
    
    // Load buses for assignment
    const busesResult = await apiCall('/buses');
    const busSelect = form.querySelector('[name="busId"]');
    if (busesResult && busesResult.data) {
        busSelect.innerHTML = '<option value="">Select Bus</option>' +
            busesResult.data.map(b => `<option value="${b.id}">${b.bus_number}</option>`).join('');
    }
    
    if (routeId) {
        title.textContent = 'Edit Route';
        const result = await apiCall(`/routes/${routeId}`);
        if (result && result.data) {
            const route = result.data;
            form.querySelector('[name="routeName"]').value = route.route_name || '';
            form.querySelector('[name="routeCode"]').value = route.route_code || '';
            form.querySelector('[name="description"]').value = route.description || '';
            form.querySelector('[name="distance"]').value = route.total_distance || '';
            form.querySelector('[name="busId"]').value = route.bus_id || '';
        }
    } else {
        title.textContent = 'Create New Route';
        form.reset();
    }
    
    modal.style.display = 'block';
    modal.classList.add('active');
};

// Create route modal
function createRouteModal() {
    let modal = document.getElementById('routeModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'routeModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeRouteModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create New Route</h3>
                <button class="close-btn" onclick="closeRouteModal()">&times;</button>
            </div>
            <form id="routeForm">
                <div class="modal-body">
                    <div class="form-group">
                        <label>Route Name *</label>
                        <input type="text" name="routeName" required>
                    </div>
                    <div class="form-group">
                        <label>Route Code *</label>
                        <input type="text" name="routeCode" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea name="description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Total Distance (km)</label>
                        <input type="number" name="distance" step="0.1" min="0">
                    </div>
                    <div class="form-group">
                        <label>Assign Bus</label>
                        <select name="busId">
                            <option value="">Select Bus</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="closeRouteModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary" onclick="saveRoute(event)">
                        <i class="fas fa-save"></i> Save Route
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Close route modal
window.closeRouteModal = function() {
    const modal = document.getElementById('routeModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
    currentEditId = null;
};

// Save route
window.saveRoute = async function(event) {
    if (event) event.preventDefault();
    
    const form = document.getElementById('routeForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!form.checkValidity()) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }

    const formData = new FormData(form);
    const data = {
        route_name: formData.get('routeName'),
        route_code: formData.get('routeCode'),
        description: formData.get('description'),
        total_distance: parseFloat(formData.get('distance')) || 0,
        bus_id: formData.get('busId') || null,
        status: 'active'
    };

    showLoading(submitBtn);

    try {
        let result;
        if (currentEditId) {
            result = await apiCall(`/routes/${currentEditId}`, 'PUT', data);
            if (result && result.success) {
                showToast('Route updated successfully', 'success');
            }
        } else {
            result = await apiCall('/routes', 'POST', data);
            if (result && result.success) {
                showToast('Route created successfully', 'success');
            }
        }

        if (result && result.success) {
            closeRouteModal();
            await loadRoutes();
        }
    } catch (error) {
        showToast('Error saving route: ' + error.message, 'error');
    } finally {
        showLoading(submitBtn, false);
    }
};

// Delete route
window.deleteRoute = async function(routeId) {
    if (!confirm('Are you sure you want to delete this route?')) {
        return;
    }

    try {
        showToast('Deleting route...', 'info');
        const result = await apiCall(`/routes/${routeId}`, 'DELETE');
        
        if (result && result.success) {
            showToast('Route deleted successfully', 'success');
            await loadRoutes();
        }
    } catch (error) {
        showToast('Error deleting route: ' + error.message, 'error');
    }
};

// Load routes
async function loadRoutes() {
    try {
        const tbody = document.querySelector('#routes-section tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

        const result = await apiCall('/routes');
        
        if (!result || !result.data || result.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-route" style="font-size: 3rem; color: #ccc;"></i>
                        <p style="color: #666;">No routes created yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = result.data.map(route => `
            <tr>
                <td>${route.route_code}</td>
                <td>${route.route_name}</td>
                <td>${route.total_distance} km</td>
                <td>${route.bus_number || 'Not assigned'}</td>
                <td><span class="status-badge ${route.status}">${route.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="openRouteModal('${route.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteRoute('${route.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading routes:', error);
        showToast('Error loading routes', 'error');
    }
}

// ==================== ATTENDANCE OPERATIONS ====================

// Load attendance
async function loadAttendance() {
    try {
        const tbody = document.querySelector('#attendance-section tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

        const result = await apiCall('/attendance');
        
        if (!result || !result.data || result.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-clipboard-check" style="font-size: 3rem; color: #ccc;"></i>
                        <p style="color: #666;">No attendance records yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = result.data.map(record => `
            <tr>
                <td>${record.student_name}</td>
                <td>${new Date(record.date).toLocaleDateString()}</td>
                <td><span class="status-badge ${record.boarding_status}">${record.boarding_status}</span></td>
                <td><span class="status-badge ${record.dropoff_status}">${record.dropoff_status}</span></td>
                <td>
                    <button class="btn-icon" onclick="editAttendance('${record.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading attendance:', error);
        showToast('Error loading attendance', 'error');
    }
}

// Mark attendance
window.markAttendance = async function(studentId, type) {
    try {
        const data = {
            student_id: studentId,
            date: new Date().toISOString().split('T')[0]
        };
        
        if (type === 'boarding') {
            data.boarding_status = 'present';
            data.boarding_time = new Date().toTimeString().split(' ')[0];
        } else if (type === 'dropoff') {
            data.dropoff_status = 'present';
            data.dropoff_time = new Date().toTimeString().split(' ')[0];
        }

        const result = await apiCall('/attendance', 'POST', data);
        
        if (result && result.success) {
            showToast(`${type} marked successfully`, 'success');
            await loadAttendance();
        }
    } catch (error) {
        showToast(`Error marking ${type}: ` + error.message, 'error');
    }
};

// ==================== PAYMENT OPERATIONS ====================

// Load payments
async function loadPayments() {
    try {
        const tbody = document.querySelector('#payments-section tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

        const result = await apiCall('/payments');
        
        if (!result || !result.data || result.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-credit-card" style="font-size: 3rem; color: #ccc;"></i>
                        <p style="color: #666;">No payment records yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = result.data.map(payment => `
            <tr>
                <td>${payment.student_name}</td>
                <td>$${parseFloat(payment.amount).toFixed(2)}</td>
                <td>${new Date(payment.payment_date).toLocaleDateString()}</td>
                <td><span class="status-badge ${payment.status}">${payment.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="generateReceipt('${payment.id}')">
                        <i class="fas fa-receipt"></i> Receipt
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading payments:', error);
        showToast('Error loading payments', 'error');
    }
}

// Record payment
window.recordPayment = async function(studentId) {
    const amount = prompt('Enter payment amount:');
    if (!amount || isNaN(amount)) {
        showToast('Invalid amount', 'error');
        return;
    }

    try {
        showToast('Recording payment...', 'info');
        const result = await apiCall('/payments', 'POST', {
            student_id: parseInt(studentId),
            amount: parseFloat(amount),
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'cash',
            status: 'paid'
        });
        
        if (result && result.success) {
            showToast('Payment recorded successfully', 'success');
            await loadPayments();
        }
    } catch (error) {
        showToast('Error recording payment: ' + error.message, 'error');
    }
};

// Generate receipt
window.generateReceipt = async function(paymentId) {
    try {
        const result = await apiCall(`/payments/${paymentId}`);
        if (result && result.data) {
            const payment = result.data;
            const receiptContent = `
                <div style="padding: 20px; max-width: 400px; margin: 0 auto; border: 1px solid #ccc;">
                    <h2 style="text-align: center;">PAYMENT RECEIPT</h2>
                    <hr>
                    <p><strong>Receipt #:</strong> ${payment.receipt_number}</p>
                    <p><strong>Student:</strong> ${payment.student_name}</p>
                    <p><strong>Amount:</strong> $${parseFloat(payment.amount).toFixed(2)}</p>
                    <p><strong>Date:</strong> ${new Date(payment.payment_date).toLocaleDateString()}</p>
                    <p><strong>Method:</strong> ${payment.payment_method}</p>
                    <p><strong>Status:</strong> ${payment.status}</p>
                    <hr>
                    <p style="text-align: center; font-size: 12px;">Thank you for your payment!</p>
                </div>
            `;
            
            const printWindow = window.open('', '', 'height=500,width=800');
            printWindow.document.write(receiptContent);
            printWindow.document.close();
            printWindow.print();
        }
    } catch (error) {
        showToast('Error generating receipt: ' + error.message, 'error');
    }
};

// ==================== DRIVER APPROVAL ====================

// Load driver approvals
async function loadDriverApproval() {
    try {
        const container = document.querySelector('#driver-approval-section .applications-grid');
        if (!container) return;

        container.innerHTML = '<div style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

        const result = await apiCall('/drivers?status=pending');
        
        if (!result || !result.data || result.data.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: #4caf50;"></i>
                    <p style="color: #666;">No pending driver applications</p>
                </div>
            `;
            return;
        }

        container.innerHTML = result.data.map(driver => `
            <div class="application-card">
                <div class="application-header">
                    <div class="application-info">
                        <h4>${driver.full_name}</h4>
                        <p>Applied: ${new Date(driver.created_at).toLocaleDateString()}</p>
                    </div>
                    <span class="status-badge pending">Pending</span>
                </div>
                <div class="application-details">
                    <div class="detail-item">
                        <i class="fas fa-envelope"></i>
                        <span>${driver.email}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <span>${driver.phone}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-id-card"></i>
                        <span>${driver.license_number}</span>
                    </div>
                </div>
                <div class="application-actions">
                    <button class="btn btn-sm btn-success" onclick="approveDriver('${driver.id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="rejectDriver('${driver.id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading driver approvals:', error);
        showToast('Error loading driver applications', 'error');
    }
}

// Reject driver
window.rejectDriver = async function(driverId) {
    if (!confirm('Are you sure you want to reject this driver application?')) {
        return;
    }

    try {
        showToast('Rejecting application...', 'info');
        const result = await apiCall(`/drivers/${driverId}`, 'DELETE');
        
        if (result && result.success) {
            showToast('Driver application rejected', 'success');
            await loadDriverApproval();
        }
    } catch (error) {
        showToast('Error rejecting application: ' + error.message, 'error');
    }
};

console.log('CRUD Operations module loaded successfully');
