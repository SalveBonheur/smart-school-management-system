// Parent Registration JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize form
    initializeForm();
    
    // Setup form validation
    setupFormValidation();
    
    // Setup form submission
    setupFormSubmission();
});

function initializeForm() {
    const form = document.getElementById('parentRegisterForm');
    if (form) {
        // Clear any existing data
        form.reset();
        
        // Add input animations
        const inputs = form.querySelectorAll('input, select');
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
    }
}

function setupFormValidation() {
    const form = document.getElementById('parentRegisterForm');
    if (!form) return;
    
    // Real-time validation
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const password = document.getElementById('password');
    const studentId = document.getElementById('studentId');
    
    // Full name validation
    if (fullName) {
        fullName.addEventListener('input', function() {
            validateFullName(this);
        });
    }
    
    // Email validation
    if (email) {
        email.addEventListener('input', function() {
            validateEmail(this);
        });
    }
    
    // Phone validation
    if (phone) {
        phone.addEventListener('input', function() {
            validatePhone(this);
        });
    }
    
    // Password validation
    if (password) {
        password.addEventListener('input', function() {
            validatePassword(this);
        });
    }
    
    // Student ID validation
    if (studentId) {
        studentId.addEventListener('change', function() {
            validateStudentId(this);
        });
    }
}

function validateFullName(input) {
    const value = input.value.trim();
    const minLength = 3;
    const maxLength = 100;
    
    if (value.length < minLength) {
        showFieldError(input, `Name must be at least ${minLength} characters`);
        return false;
    }
    
    if (value.length > maxLength) {
        showFieldError(input, `Name must not exceed ${maxLength} characters`);
        return false;
    }
    
    // Check if name contains only letters and spaces
    if (!/^[a-zA-Z\s\-']+$/.test(value)) {
        showFieldError(input, 'Name can only contain letters, spaces, hyphens, and apostrophes');
        return false;
    }
    
    clearFieldError(input);
    return true;
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

function validatePhone(input) {
    const value = input.value.trim();
    const phoneRegex = /^\+250\s?\d{3}\s?\d{3}\s?\d{3}$/;
    
    if (!value) {
        showFieldError(input, 'Phone number is required');
        return false;
    }
    
    if (!phoneRegex.test(value)) {
        showFieldError(input, 'Please enter a valid Rwandan phone number (+250 XXX XXX XXX)');
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
    
    if (value.length < 6) {
        showFieldError(input, 'Password must be at least 6 characters');
        return false;
    }
    
    if (value.length < 8) {
        showFieldWarning(input, 'Password should be at least 8 characters for better security');
        return true;
    }
    
    // Check for strong password
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    if (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar) {
        clearFieldError(input);
        return true;
    }
    
    showFieldWarning(input, 'Consider using uppercase, lowercase, numbers, and special characters');
    return true;
}

function validateStudentId(input) {
    const value = input.value;
    
    if (!value) {
        showFieldError(input, 'Please select your child\'s student ID');
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

function showFieldWarning(input, message) {
    clearFieldError(input);
    
    input.classList.add('warning');
    
    const warningDiv = document.createElement('div');
    warningDiv.className = 'field-warning';
    warningDiv.textContent = message;
    
    input.parentElement.appendChild(warningDiv);
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
    const form = document.getElementById('parentRegisterForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate all fields
        const fullName = document.getElementById('fullName');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        const password = document.getElementById('password');
        const studentId = document.getElementById('studentId');
        const terms = document.getElementById('terms');
        
        const isFullNameValid = validateFullName(fullName);
        const isEmailValid = validateEmail(email);
        const isPhoneValid = validatePhone(phone);
        const isPasswordValid = validatePassword(password);
        const isStudentIdValid = validateStudentId(studentId);
        
        if (!terms.checked) {
            showToast('Please accept the terms and conditions', 'error');
            return;
        }
        
        if (!isFullNameValid || !isEmailValid || !isPhoneValid || !isPasswordValid || !isStudentIdValid) {
            showToast('Please fix the errors in the form', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitBtn.disabled = true;
        
        try {
            // Prepare form data
            const formData = {
                fullName: fullName.value.trim(),
                email: email.value.trim(),
                phone: phone.value.trim(),
                password: password.value,
                studentId: studentId.value
            };
            
            // Send registration request
            const response = await fetch('http://localhost:3006/api/parents/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showToast('Registration successful! Redirecting to dashboard...', 'success');
                
                // Auto-login by storing parent data directly
                localStorage.setItem('parentToken', `parent-token-${Date.now()}`);
                localStorage.setItem('parentInfo', JSON.stringify({
                    id: result.data.id || 1,
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    studentId: formData.studentId
                }));
                localStorage.setItem('studentInfo', JSON.stringify({
                    id: formData.studentId,
                    studentId: `STU00${formData.studentId}`,
                    firstName: 'Student',
                    lastName: 'Name',
                    grade: 'Grade 5',
                    address: 'Kigali, Rwanda'
                }));
                
                // Redirect directly to dashboard after 2 seconds
                setTimeout(() => {
                    window.location.href = 'parent-dashboard.html';
                }, 2000);
                
            } else {
                // Show error message
                const errorMessage = result.error?.message || 'Registration failed. Please try again.';
                showToast(errorMessage, 'error');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            showToast('Network error. Please check your connection and try again.', 'error');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
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

// Add field error and warning styles to the page
const additionalStyles = `
    .form-group input.error,
    .form-group select.error {
        border-color: rgba(239, 68, 68, 0.5);
        background: rgba(239, 68, 68, 0.05);
    }
    
    .form-group input.warning,
    .form-group select.warning {
        border-color: rgba(245, 158, 11, 0.5);
        background: rgba(245, 158, 11, 0.05);
    }
    
    .field-error,
    .field-warning {
        font-size: 0.85rem;
        margin-top: 0.25rem;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        animation: slideDown 0.3s ease-out;
    }
    
    .field-error {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
    }
    
    .field-warning {
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);
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
`;

// Add styles to page
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
