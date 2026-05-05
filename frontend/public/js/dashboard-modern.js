/**
 * Modern Dashboard Features
 * Animated counters, glassmorphism effects, timeline, and interactive elements
 */

class ModernDashboard {
    constructor() {
        this.init();
    }

    init() {
        this.initAnimatedCounters();
        this.initTimelineFilters();
        this.initChartUpdates();
        this.initAlertRefresh();
        this.initGlassmorphismEffects();
        this.initProgressBars();
        this.initActivityTracking();
    }

    // ==================== ANIMATED COUNTERS ====================
    initAnimatedCounters() {
        const counters = document.querySelectorAll('.animated-counter');
        const speed = 200;

        const animateCounter = (counter) => {
            const target = parseInt(counter.getAttribute('data-target'));
            const prefix = counter.getAttribute('data-prefix') || '';
            const format = counter.getAttribute('data-format') || 'number';
            const increment = target / speed;

            const updateCounter = () => {
                const current = parseInt(counter.innerText.replace(/[^0-9]/g, ''));
                if (current < target) {
                    const newValue = Math.ceil(current + increment);
                    counter.innerText = prefix + this.formatNumber(newValue, format);
                    setTimeout(updateCounter, 10);
                } else {
                    counter.innerText = prefix + this.formatNumber(target, format);
                }
            };

            updateCounter();
        };

        // Use Intersection Observer to trigger animation when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    formatNumber(num, format) {
        switch (format) {
            case 'currency':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(num);
            case 'percentage':
                return num + '%';
            default:
                if (num >= 1000) {
                    return (num / 1000).toFixed(1) + 'K';
                }
                return num.toString();
        }
    }

    // ==================== TIMELINE FILTERS ====================
    initTimelineFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const timelineItems = document.querySelectorAll('.timeline-item');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('onclick').match(/'([^']+)'/)[1];
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Filter timeline items
                timelineItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        item.style.display = 'block';
                        item.style.animation = 'fadeInUp 0.5s ease';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // ==================== CHART UPDATES ====================
    initChartUpdates() {
        // Chart filter handlers
        window.updateEnrollmentChart = (period) => {
            this.showToast(`Updating enrollment chart for last ${period} days`, 'info');
            this.updateChart('enrollmentChart', period);
        };

        window.updateRevenueChart = (period) => {
            this.showToast(`Updating revenue chart for ${period} view`, 'info');
            this.updateChart('revenueChart', period);
        };
    }

    updateChart(chartId, period) {
        // Simulate chart update with animation
        const chart = document.getElementById(chartId);
        if (chart) {
            chart.style.opacity = '0.5';
            setTimeout(() => {
                chart.style.opacity = '1';
                this.showToast('Chart updated successfully', 'success');
            }, 1000);
        }
    }

    // ==================== ALERT SYSTEM ====================
    initAlertRefresh() {
        window.refreshAlerts = () => {
            this.showToast('Refreshing alerts...', 'info');
            this.simulateAlertRefresh();
        };

        window.viewMaintenance = (busId) => {
            this.showToast(`Opening maintenance details for Bus ${busId}`, 'info');
        };

        window.viewPayment = (paymentId) => {
            this.showToast(`Opening payment details #${paymentId}`, 'info');
        };

        window.reviewApplication = (appId) => {
            this.showToast(`Opening driver application #${appId}`, 'info');
        };
    }

    simulateAlertRefresh() {
        const alertsList = document.getElementById('alertsList');
        if (alertsList) {
            alertsList.style.opacity = '0.5';
            setTimeout(() => {
                alertsList.style.opacity = '1';
                this.addNewAlert();
            }, 1000);
        }
    }

    addNewAlert() {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;

        const newAlert = document.createElement('div');
        newAlert.className = 'alert-item success';
        newAlert.style.animation = 'fadeInUp 0.5s ease';
        newAlert.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="alert-content">
                <h4>System Update</h4>
                <p>Dashboard refreshed with latest data</p>
                <small>Just now</small>
            </div>
            <button class="alert-action" onclick="viewAlert('new')">
                <i class="fas fa-arrow-right"></i>
            </button>
        `;

        alertsList.insertBefore(newAlert, alertsList.firstChild);
        this.showToast('New alert added', 'success');
    }

    // ==================== GLASSMORPHISM EFFECTS ====================
    initGlassmorphismEffects() {
        // Add hover effects to glass cards
        const glassCards = document.querySelectorAll('.glass-stat-card, .glass-chart-card');
        
        glassCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.addGlassmorphismGlow(card);
            });

            card.addEventListener('mouseleave', () => {
                this.removeGlassmorphismGlow(card);
            });
        });
    }

    addGlassmorphismGlow(element) {
        element.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)';
    }

    removeGlassmorphismGlow(element) {
        element.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.15)';
    }

    // ==================== PROGRESS BARS ====================
    initProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                    observer.unobserve(bar);
                }
            });
        }, { threshold: 0.5 });

        progressBars.forEach(bar => {
            observer.observe(bar);
        });
    }

    // ==================== ACTIVITY TRACKING ====================
    initActivityTracking() {
        // Simulate real-time activity updates
        setInterval(() => {
            this.updateRecentActivity();
        }, 30000); // Update every 30 seconds

        // Timeline action handlers
        window.viewStudent = (studentId) => {
            this.showToast(`Opening student profile #${studentId}`, 'info');
        };

        window.viewReceipt = (receiptId) => {
            this.showToast(`Opening receipt #${receiptId}`, 'info');
        };

        window.viewRoute = (routeId) => {
            this.showToast(`Opening route ${routeId} details`, 'info');
        };

        window.downloadReport = (reportType) => {
            this.showToast(`Downloading ${reportType} report`, 'success');
        };

        window.loadMoreActivities = () => {
            this.loadMoreTimelineActivities();
        };
    }

    updateRecentActivity() {
        const activities = [
            { type: 'students', icon: 'fa-user-plus', title: 'New Student Registered', desc: 'Auto-refresh check completed' },
            { type: 'payments', icon: 'fa-dollar-sign', title: 'Payment Reminder Sent', desc: 'Automated reminders processed' },
            { type: 'system', icon: 'fa-sync', title: 'System Synced', desc: 'All databases synchronized' }
        ];

        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        this.addTimelineActivity(randomActivity);
    }

    addTimelineActivity(activity) {
        const timeline = document.getElementById('activityTimeline');
        if (!timeline) return;

        const newItem = document.createElement('div');
        newItem.className = `timeline-item ${activity.type}`;
        newItem.style.animation = 'fadeInUp 0.5s ease';
        newItem.setAttribute('data-category', activity.type);
        
        const markerClass = activity.type === 'students' ? 'success' : 
                           activity.type === 'payments' ? 'success' : 'info';

        newItem.innerHTML = `
            <div class="timeline-marker ${markerClass}">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="timeline-content">
                <div class="timeline-time">Just now</div>
                <h4>${activity.title}</h4>
                <p>${activity.desc}</p>
                <div class="timeline-actions">
                    <button class="btn-icon" onclick="viewActivity('${Date.now()}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;

        timeline.insertBefore(newItem, timeline.firstChild);

        // Remove old items if too many
        const items = timeline.querySelectorAll('.timeline-item');
        if (items.length > 10) {
            items[items.length - 1].remove();
        }
    }

    loadMoreTimelineActivities() {
        this.showToast('Loading more activities...', 'info');
        
        setTimeout(() => {
            const timeline = document.getElementById('activityTimeline');
            if (!timeline) return;

            for (let i = 0; i < 3; i++) {
                const activities = [
                    { type: 'students', icon: 'fa-user-graduate', title: 'Student Updated', desc: 'Profile information updated' },
                    { type: 'payments', icon: 'fa-credit-card', title: 'Payment Processed', desc: 'Monthly payment received' },
                    { type: 'system', icon: 'fa-cog', title: 'System Maintenance', desc: 'Scheduled maintenance completed' }
                ];

                const randomActivity = activities[Math.floor(Math.random() * activities.length)];
                this.addTimelineActivity(randomActivity);
            }

            this.showToast('3 more activities loaded', 'success');
        }, 1000);
    }

    // ==================== TOAST NOTIFICATIONS ====================
    showToast(message, type = 'info') {
        // Check if toast container exists, create if not
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: ${this.getToastColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 250px;
            animation: slideInRight 0.3s ease;
            backdrop-filter: blur(10px);
        `;

        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    getToastColor(type) {
        const colors = {
            success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            info: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
        };
        return colors[type] || colors.info;
    }

    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // ==================== UTILITY FUNCTIONS ====================
    viewActivity(activityId) {
        this.showToast(`Viewing activity #${activityId}`, 'info');
    }

    viewAlert(alertId) {
        this.showToast(`Viewing alert #${alertId}`, 'info');
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .toast-container {
        pointer-events: none;
    }

    .toast {
        pointer-events: auto;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ModernDashboard();
});

// Export for global access
window.ModernDashboard = ModernDashboard;
