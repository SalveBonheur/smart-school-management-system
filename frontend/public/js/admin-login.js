// Admin Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('adminLoginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('rememberMe');
    const forgotLink = document.querySelector('.forgot-link');
    
    // Check for remembered credentials
    checkRememberedCredentials();
    
    // Handle form submission
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const rememberMe = rememberCheckbox.checked;
            
            // Validate form
            if (!validateLoginForm(email, password)) {
                return;
            }
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            submitBtn.disabled = true;
            
            try {
                // Send login request
                const response = await loginAdmin(email, password);
                
                if (response.success) {
                    // Store auth token and user info
                    localStorage.setItem('adminToken', response.token);
                    localStorage.setItem('adminInfo', JSON.stringify(response.admin));
                    
                    // Remember credentials if requested
                    if (rememberMe) {
                        localStorage.setItem('rememberedAdmin', JSON.stringify({ email, password }));
                    } else {
                        localStorage.removeItem('rememberedAdmin');
                    }
                    
                    showToast('Login successful! Redirecting to dashboard...', 'success');
                    
                    // Redirect to admin dashboard
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 1500);
                } else {
                    showToast(response.message || 'Login failed. Please check your credentials.', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showToast('Login failed. Please check your connection.', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Handle forgot password
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForgotPasswordModal();
        });
    }
    
    // Add input animations
    addInputAnimations();
});

// Validate login form
function validateLoginForm(email, password) {
    let isValid = true;
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    } else {
        clearFieldError('email');
    }
    
    // Password validation
    if (!password || password.length < 1) {
        showFieldError('password', 'Please enter your password');
        isValid = false;
    } else {
        clearFieldError('password');
    }
    
    return isValid;
}

// Login admin API call
async function loginAdmin(email, password) {
    try {
        const response = await fetch('http://localhost:3006/api/auth-new/admins/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Login API error:', error);
        throw error;
    }
}

// Check for remembered credentials
function checkRememberedCredentials() {
    const remembered = localStorage.getItem('rememberedAdmin');
    if (remembered) {
        try {
            const { email, password } = JSON.parse(remembered);
            document.getElementById('email').value = email;
            document.getElementById('password').value = password;
            document.getElementById('rememberMe').checked = true;
        } catch (e) {
            console.error('Error parsing remembered credentials:', e);
        }
    }
}

// Show forgot password modal
function showForgotPasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Reset Admin Password</h3>
                <button class="modal-close" onclick="closeForgotPasswordModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>Enter your admin email address and we'll send you instructions to reset your password.</p>
                <div class="form-group">
                    <input type="email" id="resetEmail" placeholder="Enter your admin email" required>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="sendPasswordReset()">
                    <i class="fas fa-paper-plane"></i>
                    Send Reset Link
                </button>
                <button class="btn btn-outline" onclick="closeForgotPasswordModal()">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    document.body.appendChild(modal);
    
    // Animate modal in
    setTimeout(() => {
        modal.querySelector('.modal').style.transform = 'scale(1)';
    }, 100);
}

// Close forgot password modal
function closeForgotPasswordModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.querySelector('.modal').style.transform = 'scale(0.8)';
        setTimeout(() => {
            modal.remove();
        }, 200);
    }
}

// Send password reset
async function sendPasswordReset() {
    const email = document.getElementById('resetEmail').value.trim();
    
    if (!email) {
        showToast('Please enter your email address', 'error');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    const resetBtn = event.target;
    const originalText = resetBtn.innerHTML;
    resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    resetBtn.disabled = true;
    
    try {
        const response = await fetch('/api/admins/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Password reset link sent! Check your admin email.', 'success');
            closeForgotPasswordModal();
        } else {
            showToast(result.message || 'Failed to send reset link', 'error');
        }
    } catch (error) {
        console.error('Password reset error:', error);
        showToast('Failed to send reset link. Please try again.', 'error');
    } finally {
        resetBtn.innerHTML = originalText;
        resetBtn.disabled = false;
    }
}

// Show field error
function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (field) {
        const formGroup = field.closest('.input-icon');
        formGroup.classList.add('error');
        
        // Remove existing error message
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
    }
}

// Clear field error
function clearFieldError(fieldName) {
    const field = document.getElementById(fieldName);
    if (field) {
        const formGroup = field.closest('.input-icon');
        formGroup.classList.remove('error');
        
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }
}

// Show toast notification
function showToast(message, type = 'success') {
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

// Add input animations
function addInputAnimations() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        // Add focus effect
        input.addEventListener('focus', function() {
            const formGroup = this.closest('.input-icon');
            if (formGroup) {
                formGroup.querySelector('i').style.color = '#2563eb';
            }
        });
        
        input.addEventListener('blur', function() {
            const formGroup = this.closest('.input-icon');
            if (formGroup) {
                formGroup.querySelector('i').style.color = '#6b7280';
            }
        });
        
        // Add typing animation
        input.addEventListener('input', function() {
            const formGroup = this.closest('.form-group');
            if (formGroup) {
                formGroup.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    formGroup.style.transform = 'scale(1)';
                }, 200);
            }
        });
    });
}

// Add modal styles to page
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .modal-overlay {
        animation: fadeIn 0.3s ease;
    }
    
    .modal {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        transform: scale(0.8);
        transition: transform 0.3s ease;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }
    
    .modal-header h3 {
        color: #1f2937;
        font-size: 1.5rem;
        font-weight: 600;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #6b7280;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .modal-close:hover {
        background: #f3f4f6;
        color: #ef4444;
    }
    
    .modal-body {
        margin-bottom: 1.5rem;
    }
    
    .modal-body p {
        color: #6b7280;
        margin-bottom: 1rem;
        line-height: 1.6;
    }
    
    .modal-footer {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

document.head.appendChild(modalStyles);
