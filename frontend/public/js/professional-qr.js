/**
 * Professional QR Code Attendance System
 * Smart School Transport - Rwanda
 */

// QR Code State Management
const QRState = {
    currentStudent: null,
    isScanning: false,
    recentScans: [],
    generatedQRCodes: [],
    scanStats: {
        today: 0,
        week: 0,
        month: 0,
        total: 0
    }
};

// Initialize QR System
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Professional QR System...');
    initializeQRSystem();
    loadQRStats();
    loadRecentScans();
});

// ==================== INITIALIZATION ====================

function initializeQRSystem() {
    // Load students into dropdown
    loadStudentsForQR();
    
    // Set up event listeners
    setupQREventListeners();
    
    console.log('QR System initialized');
}

function setupQREventListeners() {
    // Student selection change
    const studentSelect = document.getElementById('qrStudentSelect');
    if (studentSelect) {
        studentSelect.addEventListener('change', handleStudentSelection);
    }
    
    // Generate QR button
    const generateBtn = document.getElementById('generateQRBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateStudentQR);
    }
    
    // Download QR button
    const downloadBtn = document.getElementById('downloadQRBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadQRCode);
    }
    
    // Print QR button
    const printBtn = document.getElementById('printQRBtn');
    if (printBtn) {
        printBtn.addEventListener('click', printQRCode);
    }
    
    // Start scanning button
    const scanBtn = document.getElementById('startScanBtn');
    if (scanBtn) {
        scanBtn.addEventListener('click', toggleQRScanner);
    }
}

// ==================== QR GENERATOR ====================

async function loadStudentsForQR() {
    const studentSelect = document.getElementById('qrStudentSelect');
    if (!studentSelect) return;
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:3003/api/admin/students', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                studentSelect.innerHTML = `
                    <option value="">Select a student...</option>
                    ${result.data.map(student => `
                        <option value="${student.id}" data-name="${student.first_name} ${student.last_name}" data-grade="${student.grade}">
                            ${student.first_name} ${student.last_name} - ${student.grade}
                        </option>
                    `).join('')}
                `;
            } else {
                // Load sample data
                loadSampleStudentsForQR();
            }
        } else {
            loadSampleStudentsForQR();
        }
    } catch (error) {
        console.log('Loading sample students for demo');
        loadSampleStudentsForQR();
    }
}

function loadSampleStudentsForQR() {
    const studentSelect = document.getElementById('qrStudentSelect');
    if (!studentSelect) return;
    
    const sampleStudents = [
        { id: 1, first_name: 'John', last_name: 'Doe', grade: 'Grade 10' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', grade: 'Grade 11' },
        { id: 3, first_name: 'Michael', last_name: 'Johnson', grade: 'Grade 9' },
        { id: 4, first_name: 'Sarah', last_name: 'Williams', grade: 'Grade 12' },
        { id: 5, first_name: 'David', last_name: 'Brown', grade: 'Grade 10' }
    ];
    
    studentSelect.innerHTML = `
        <option value="">Select a student...</option>
        ${sampleStudents.map(student => `
            <option value="${student.id}" data-name="${student.first_name} ${student.last_name}" data-grade="${student.grade}">
                ${student.first_name} ${student.last_name} - ${student.grade}
            </option>
        `).join('')}
    `;
}

function handleStudentSelection(event) {
    const selectedOption = event.target.options[event.target.selectedIndex];
    
    if (selectedOption.value) {
        QRState.currentStudent = {
            id: selectedOption.value,
            name: selectedOption.dataset.name,
            grade: selectedOption.dataset.grade
        };
        
        // Enable generate button
        const generateBtn = document.getElementById('generateQRBtn');
        if (generateBtn) {
            generateBtn.disabled = false;
        }
    } else {
        QRState.currentStudent = null;
        const generateBtn = document.getElementById('generateQRBtn');
        if (generateBtn) {
            generateBtn.disabled = true;
        }
    }
}

function generateStudentQR() {
    if (!QRState.currentStudent) {
        showNotification('Please select a student first', 'error');
        return;
    }
    
    const student = QRState.currentStudent;
    
    // Generate QR code data
    const qrData = {
        studentId: student.id,
        name: student.name,
        grade: student.grade,
        timestamp: new Date().toISOString(),
        type: 'attendance',
        school: 'Smart School Transport'
    };
    
    // Display QR code
    displayQRCode(qrData, student);
    
    // Add to generated list
    QRState.generatedQRCodes.push({
        ...qrData,
        generatedAt: new Date()
    });
    
    // Show success notification
    showNotification(`QR Code generated for ${student.name}`, 'success');
    
    // Enable action buttons
    document.getElementById('downloadQRBtn').disabled = false;
    document.getElementById('printQRBtn').disabled = false;
}

function displayQRCode(data, student) {
    const placeholder = document.getElementById('qrPlaceholder');
    const generated = document.getElementById('qrGenerated');
    const qrImage = document.getElementById('qrCodeImage');
    const studentInfo = document.getElementById('qrStudentInfo');
    
    if (placeholder) placeholder.style.display = 'none';
    if (generated) generated.classList.add('show');
    
    // Generate QR code using API
    if (qrImage) {
        const qrDataString = JSON.stringify(data);
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrDataString)}`;
    }
    
    // Display student info
    if (studentInfo) {
        studentInfo.innerHTML = `
            <div class="student-info-header">
                <div class="student-avatar-large">${student.name.charAt(0)}</div>
                <div class="student-info-details">
                    <h4>${student.name}</h4>
                    <p>${student.grade}</p>
                </div>
            </div>
        `;
    }
}

function downloadQRCode() {
    const qrImage = document.getElementById('qrCodeImage');
    if (!qrImage || !qrImage.src) {
        showNotification('No QR code to download', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.href = qrImage.src;
    link.download = `QR-${QRState.currentStudent?.name || 'Student'}-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('QR Code downloaded successfully', 'success');
}

function printQRCode() {
    const qrImage = document.getElementById('qrCodeImage');
    if (!qrImage || !qrImage.src) {
        showNotification('No QR code to print', 'error');
        return;
    }
    
    const student = QRState.currentStudent || { name: 'Student', grade: '' };
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Print QR Code - ${student.name}</title>
            <style>
                body {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    font-family: 'Inter', sans-serif;
                    background: #f9fafb;
                }
                .qr-container {
                    text-align: center;
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                }
                .qr-image {
                    width: 250px;
                    height: 250px;
                    margin-bottom: 20px;
                }
                .student-name {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 8px;
                }
                .student-grade {
                    font-size: 1rem;
                    color: #6b7280;
                }
                .school-name {
                    font-size: 0.875rem;
                    color: #9ca3af;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                }
            </style>
        </head>
        <body>
            <div class="qr-container">
                <img src="${qrImage.src}" class="qr-image" alt="QR Code">
                <div class="student-name">${student.name}</div>
                <div class="student-grade">${student.grade}</div>
                <div class="school-name">Smart School Transport - Rwanda</div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
    
    showNotification('QR Code sent to printer', 'success');
}

// ==================== QR SCANNER ====================

function toggleQRScanner() {
    const viewport = document.getElementById('qrScannerViewport');
    const overlay = document.getElementById('qrScannerOverlay');
    const btn = document.getElementById('startScanBtn');
    
    if (!QRState.isScanning) {
        // Start scanning
        QRState.isScanning = true;
        if (viewport) viewport.classList.add('scanning');
        if (overlay) overlay.style.display = 'none';
        if (btn) {
            btn.innerHTML = '<i class="fas fa-stop"></i> Stop Scanning';
            btn.classList.add('active');
        }
        
        // Start simulated scanning for demo
        simulateQRScanning();
        
        showNotification('QR Scanner started', 'success');
    } else {
        // Stop scanning
        QRState.isScanning = false;
        if (viewport) viewport.classList.remove('scanning');
        if (overlay) overlay.style.display = 'flex';
        if (btn) {
            btn.innerHTML = '<i class="fas fa-camera"></i> Start Scanning';
            btn.classList.remove('active');
        }
        
        // Stop scanning
        if (QRState.scanInterval) {
            clearInterval(QRState.scanInterval);
        }
    }
}

function simulateQRScanning() {
    // Simulate successful scans at random intervals
    QRState.scanInterval = setInterval(() => {
        if (QRState.isScanning && Math.random() > 0.7) {
            simulateSuccessfulScan();
        }
    }, 2500);
}

function simulateSuccessfulScan() {
    const sampleStudents = [
        { id: 1, name: 'John Doe', grade: 'Grade 10' },
        { id: 2, name: 'Jane Smith', grade: 'Grade 11' },
        { id: 3, name: 'Michael Johnson', grade: 'Grade 9' },
        { id: 4, name: 'Sarah Williams', grade: 'Grade 12' },
        { id: 5, name: 'David Brown', grade: 'Grade 10' }
    ];
    
    const randomStudent = sampleStudents[Math.floor(Math.random() * sampleStudents.length)];
    
    const scanResult = {
        studentId: randomStudent.id,
        name: randomStudent.name,
        grade: randomStudent.grade,
        timestamp: new Date(),
        status: 'success'
    };
    
    handleSuccessfulScan(scanResult);
}

function handleSuccessfulScan(scanData) {
    // Add to recent scans
    QRState.recentScans.unshift(scanData);
    if (QRState.recentScans.length > 10) {
        QRState.recentScans.pop();
    }
    
    // Update stats
    QRState.scanStats.today++;
    QRState.scanStats.total++;
    
    // Show student info card
    showStudentInfoCard(scanData);
    
    // Update recent scans table
    updateRecentScansTable();
    
    // Update stats display
    updateQRStats();
    
    // Save to localStorage
    saveRecentScans();
    
    showNotification(`Attendance recorded for ${scanData.name}`, 'success');
}

function showStudentInfoCard(studentData) {
    const card = document.getElementById('studentInfoCard');
    
    if (card) {
        card.innerHTML = `
            <div class="student-info-header">
                <div class="student-avatar-large">${studentData.name.charAt(0)}</div>
                <div class="student-info-details">
                    <h4>${studentData.name}</h4>
                    <p>${studentData.grade}</p>
                    <span class="scan-status success">
                        <i class="fas fa-check-circle"></i> Checked In
                    </span>
                </div>
            </div>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 0.75rem; color: #6b7280; margin: 0;">
                    <i class="fas fa-clock"></i> 
                    Checked in at ${studentData.timestamp.toLocaleTimeString()}
                </p>
            </div>
        `;
        card.classList.add('show');
        
        // Hide after 5 seconds
        setTimeout(() => {
            card.classList.remove('show');
        }, 5000);
    }
}

function updateRecentScansTable() {
    const tbody = document.getElementById('recentScansTable');
    if (!tbody) return;
    
    if (QRState.recentScans.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 2rem; color: #9ca3af;">
                    No recent scans
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = QRState.recentScans.map(scan => `
        <tr>
            <td>
                <strong>${scan.name}</strong>
                <br><small style="color: #6b7280;">${scan.grade}</small>
            </td>
            <td>${scan.timestamp.toLocaleTimeString()}</td>
            <td>
                <span class="scan-status ${scan.status}">
                    <i class="fas fa-check"></i> ${scan.status}
                </span>
            </td>
        </tr>
    `).join('');
}

function loadRecentScans() {
    const saved = localStorage.getItem('recentQRScans');
    if (saved) {
        const parsed = JSON.parse(saved);
        QRState.recentScans = parsed.map(scan => ({
            ...scan,
            timestamp: new Date(scan.timestamp)
        }));
        updateRecentScansTable();
    }
}

function saveRecentScans() {
    localStorage.setItem('recentQRScans', JSON.stringify(QRState.recentScans));
}

// ==================== STATS & ANALYTICS ====================

function loadQRStats() {
    const saved = localStorage.getItem('qrScanStats');
    if (saved) {
        QRState.scanStats = JSON.parse(saved);
    }
    updateQRStats();
}

function updateQRStats() {
    const todayEl = document.getElementById('qrTodayScans');
    const weekEl = document.getElementById('qrWeekScans');
    const monthEl = document.getElementById('qrMonthScans');
    const totalEl = document.getElementById('qrTotalScans');
    
    if (todayEl) todayEl.textContent = QRState.scanStats.today;
    if (weekEl) weekEl.textContent = QRState.scanStats.week;
    if (monthEl) monthEl.textContent = QRState.scanStats.month;
    if (totalEl) totalEl.textContent = QRState.scanStats.total;
    
    localStorage.setItem('qrScanStats', JSON.stringify(QRState.scanStats));
}

// Helper function for notifications
function showNotification(message, type = 'info') {
    // Check if there's a global notification function
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message);
    }
}
