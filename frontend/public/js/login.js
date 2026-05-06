document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('unifiedLoginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            try {
                // Show loading state
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
                submitBtn.disabled = true;
                
                const response = await fetch('http://localhost:3002/api/auth-new/unified/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Save token and user data
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userData', JSON.stringify(data.user));
                    
                    showToast('Login successful! Redirecting...', 'success');
                    
                    // Redirect based on role
                    setTimeout(() => {
                        if (data.user.role === 'admin' || data.user.role === 'super_admin') {
                            window.location.href = 'admin-dashboard.html';
                        } else if (data.user.role === 'driver') {
                            window.location.href = 'driver-dashboard.html';
                        } else if (data.user.role === 'parent') {
                            window.location.href = 'parent-dashboard.html';
                        } else {
                            window.location.href = 'landing.html';
                        }
                    }, 1500);
                } else {
                    showToast(data.message || 'Login failed', 'error');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Login error:', error);
                showToast('An error occurred during login. Please try again.', 'error');
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
