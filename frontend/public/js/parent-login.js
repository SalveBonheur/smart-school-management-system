// Parent Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize login
    initializeLogin();
    
    // Setup form validation
    setupFormValidation();
    
    // Setup form submission
    setupFormSubmission();
    
    // Check for auto-login after registration
    checkAutoLogin();
});

function initializeLogin() {
    const form = document.getElementById('parentLoginForm');
    if (form) {
        // Clear any existing data
        form.reset();
        
        // Add input animations
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
        });
        
        // Load remembered email if exists
        const rememberedEmail = localStorage.getItem('parentRememberedEmail');
        if (rememberedEmail) {
            document.getElementById('email').value = rememberedEmail;
            document.getElementById('rememberMe').checked = true;
        }
    }
}

function checkAutoLogin() {
    const registrationInfo = localStorage.getItem('parentRegistration');
    if (registrationInfo) {
        const registration = JSON.parse(registrationInfo);
        if (registration.justRegistered) {
            // Fill email from registration
            document.getElementById('email').value = registration.email;
            
            // Show welcome message
            showToast(`Welcome ${registration.fullName}! Please login with your new account.`, 'success');
            
            // Clear registration flag
            registration.justRegistered = false;
            localStorage.setItem('parentRegistration', JSON.stringify(registration));
        }
    }
}

function setupFormValidation() {
    const form = document.getElementById('parentLoginForm');
    if (!form) return;
    
    // Real-time validation
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    
    // Email validation
    if (email) {
        email.addEventListener('input', function() {
            validateEmail(this);
        });
    }
    
    // Password validation
    if (password) {
        password.addEventListener('input', function() {
            validatePassword(this);
        });
    }
}

function validateEmail(input) {
    const value = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!value) {
        showFieldError(input, 'Email is required');
        return false;
    }
    
    if (!emailRegex.test(value)) {
        showFieldError(input, 'Please enter a valid email address');
        return false;
    }
    
    clearFieldError(input);
    return true;
}

function validatePassword(input) {
    const value = input.value;
    
    if (!value) {
        showFieldError(input, 'Password is required');
        return false;
    }
    
    if (value.length < 1) {
        showFieldError(input, 'Password cannot be empty');
        return false;
    }
    
    clearFieldError(input);
    return true;
}

function showFieldError(input, message) {
    clearFieldError(input);
    
    input.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    input.parentElement.appendChild(errorDiv);
}

function clearFieldError(input) {
    input.classList.remove('error', 'warning');
    
    const existingError = input.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    const existingWarning = input.parentElement.querySelector('.field-warning');
    if (existingWarning) {
        existingWarning.remove();
    }
}

function setupFormSubmission() {
    const form = document.getElementById('parentLoginForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate fields
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const rememberMe = document.getElementById('rememberMe');
        
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        
        if (!isEmailValid || !isPasswordValid) {
            showToast('Please fix the errors in the form', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        submitBtn.disabled = true;
        
        try {
            // Prepare login data
            const loginData = {
                email: email.value.trim(),
                password: password.value
            };
            
            // Send login request
            const response = await fetch('http://localhost:3006/api/parents/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Handle remember me
                if (rememberMe.checked) {
                    localStorage.setItem('parentRememberedEmail', loginData.email);
                } else {
                    localStorage.removeItem('parentRememberedEmail');
                }
                
                // Store parent data
                localStorage.setItem('parentToken', result.data.token);
                localStorage.setItem('parentInfo', JSON.stringify(result.data.parent));
                localStorage.setItem('studentInfo', JSON.stringify(result.data.student));
                
                // Clear registration data if exists
                localStorage.removeItem('parentRegistration');
                
                showToast('Login successful! Redirecting to dashboard...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'parent-dashboard.html';
                }, 1500);
                
            } else {
                // Show error message
                const errorMessage = result.error?.message || 'Login failed. Please check your credentials.';
                showToast(errorMessage, 'error');
                
                // Focus on password field for retry
                password.focus();
                password.select();
            }
            
        } catch (error) {
            console.error('Login error:', error);
            showToast('Network error. Please check your connection and try again.', 'error');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

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

// Add field error styles to the page
const additionalStyles = `
    .form-group input.error {
        border-color: rgba(239, 68, 68, 0.5);
        background: rgba(239, 68, 68, 0.05);
    }
    
    .field-error {
        font-size: 0.85rem;
        margin-top: 0.25rem;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
        animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .auth-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }
    
    .auth-btn:disabled:hover {
        transform: none;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    
    .form-group.focused label {
        color: rgba(102, 126, 234, 0.9);
    }
    
    .form-group.focused input {
        border-color: rgba(102, 126, 234, 0.5);
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
`;

// Add styles to page
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
