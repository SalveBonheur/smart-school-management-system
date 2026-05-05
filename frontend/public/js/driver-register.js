// Driver Registration JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('driverRegisterForm');
    const fileInput = document.getElementById('profilePhoto');
    const fileLabel = document.querySelector('.file-upload-label');
    
    // Handle file upload preview
    if (fileInput && fileLabel) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                fileLabel.innerHTML = `
                    <i class="fas fa-check"></i>
                    <span>${file.name}</span>
                `;
                fileLabel.style.borderColor = '#10b981';
                fileLabel.style.background = '#10b981';
                fileLabel.style.color = 'white';
            }
        });
    }
    
    // Handle form submission
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const data = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                licenseNumber: formData.get('licenseNumber'),
                address: formData.get('address'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword'),
                profilePhoto: formData.get('profilePhoto')
            };
            
            // Validate form
            if (!validateForm(data)) {
                return;
            }
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
            submitBtn.disabled = true;
            
            try {
                // Send registration request
                const response = await registerDriver(data);
                
                if (response.success) {
                    showToast('Registration successful! Redirecting to your dashboard...', 'success');
                    // Store the driver info for auto-login
                    localStorage.setItem('driverInfo', JSON.stringify({
                        email: data.email,
                        fullName: data.fullName,
                        justRegistered: true
                    }));
                    setTimeout(() => {
                        window.location.href = 'driver-dashboard.html';
                    }, 2000);
                } else {
                    showToast(response.message || 'Registration failed. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showToast('Registration failed. Please check your connection.', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Add input animations
    addInputAnimations();
});

// Validate registration form
function validateForm(data) {
    const errors = [];
    
    // Name validation
    if (!data.fullName || data.fullName.length < 3) {
        errors.push('Full name must be at least 3 characters');
        showFieldError('fullName');
    } else {
        clearFieldError('fullName');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('Please enter a valid email address');
        showFieldError('email');
    } else {
        clearFieldError('email');
    }
    
    // Phone validation
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (!data.phone || !phoneRegex.test(data.phone)) {
        errors.push('Please enter a valid phone number');
        showFieldError('phone');
    } else {
        clearFieldError('phone');
    }
    
    // License number validation
    if (!data.licenseNumber || data.licenseNumber.length < 5) {
        errors.push('License number must be at least 5 characters');
        showFieldError('licenseNumber');
    } else {
        clearFieldError('licenseNumber');
    }
    
    // Password validation
    if (!data.password || data.password.length < 6) {
        errors.push('Password must be at least 6 characters');
        showFieldError('password');
    } else {
        clearFieldError('password');
    }
    
    // Confirm password validation
    if (data.password !== data.confirmPassword) {
        errors.push('Passwords do not match');
        showFieldError('confirmPassword');
    } else {
        clearFieldError('confirmPassword');
    }
    
    if (errors.length > 0) {
        showToast(errors[0], 'error');
        return false;
    }
    
    return true;
}

// Register driver API call
async function registerDriver(data) {
    try {
        const response = await fetch('http://localhost:3006/api/auth-new/drivers/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Registration API error:', error);
        throw error;
    }
}

// Show field error
function showFieldError(fieldName) {
    const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.add('error');
        
        // Remove existing error message
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }
}

// Clear field error
function clearFieldError(fieldName) {
    const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.remove('error');
        
        // Remove existing error message
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
    const inputs = document.querySelectorAll('input, textarea');
    
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

// Password strength indicator
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = checkPasswordStrength(password);
            updatePasswordStrength(strength);
        });
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = document.getElementById('password').value;
            const confirmPassword = this.value;
            
            if (confirmPassword && password !== confirmPassword) {
                showFieldError('confirmPassword');
            } else {
                clearFieldError('confirmPassword');
            }
        });
    }
});

// Check password strength
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    return strength;
}

// Update password strength indicator
function updatePasswordStrength(strength) {
    // Remove existing strength indicator
    const existingIndicator = document.querySelector('.password-strength');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    const passwordGroup = document.getElementById('password').closest('.form-group');
    const strengthText = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength - 1] || 'Weak';
    const strengthColor = ['#ef4444', '#f59e0b', '#10b981', '#10b981', '#10b981'][strength - 1] || '#ef4444';
    
    const strengthIndicator = document.createElement('div');
    strengthIndicator.className = 'password-strength';
    strengthIndicator.innerHTML = `
        <small style="color: ${strengthColor}; font-size: 0.8rem; margin-top: 0.5rem; display: block;">
            Password Strength: ${strengthText}
        </small>
    `;
    
    passwordGroup.appendChild(strengthIndicator);
}
