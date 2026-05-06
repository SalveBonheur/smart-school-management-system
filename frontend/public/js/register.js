document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('unifiedRegisterForm');
    const roleRadios = document.querySelectorAll('input[name="role"]');
    const parentFields = document.getElementById('parentFields');
    const driverFields = document.getElementById('driverFields');
    const licenseNumberInput = document.getElementById('licenseNumber');

    // Toggle fields based on role
    roleRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'parent') {
                parentFields.style.display = 'block';
                driverFields.style.display = 'none';
                licenseNumberInput.required = false;
            } else {
                parentFields.style.display = 'none';
                driverFields.style.display = 'block';
                licenseNumberInput.required = true;
            }
        });
    });
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const role = document.querySelector('input[name="role"]:checked').value;
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            
            try {
                // Show loading state
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
                submitBtn.disabled = true;
                
                let endpoint = '';
                let payload = { fullName, email, phone, password };

                if (role === 'parent') {
                    endpoint = '/api/auth-new/parents/register';
                    payload.studentId = document.getElementById('studentId').value;
                } else {
                    endpoint = '/api/auth-new/drivers/register';
                    payload.licenseNumber = document.getElementById('licenseNumber').value;
                }
                
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showToast('Registration successful! Redirecting to login...', 'success');
                    
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showToast(data.message || 'Registration failed', 'error');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Registration error:', error);
                showToast('An error occurred during registration. Please try again.', 'error');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const icon = toast.querySelector('.toast-icon');
    const msg = toast.querySelector('.toast-message');
    
    toast.className = `toast show ${type}`;
    msg.textContent = message;
    
    if (type === 'success') {
        icon.innerHTML = '<i class="fas fa-check-circle"></i>';
    } else if (type === 'error') {
        icon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
    } else {
        icon.innerHTML = '<i class="fas fa-info-circle"></i>';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
