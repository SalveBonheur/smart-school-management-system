import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import jwt from 'jsonwebtoken';
import { validateDriver, validateAdminRegistration } from '../middleware/validation.js';
import { logger } from '../middleware/logger.js';

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Driver Registration
router.post('/drivers/register', async (req, res) => {
    try {
        const { fullName, email, phone, licenseNumber, address, password } = req.body;
        
        // Validate input
        const validation = validateDriver(req.body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.errors[0] || 'Validation failed',
                errors: validation.errors
            });
        }
        
        // Check if driver already exists
        const [existingDrivers] = await db.query(
            'SELECT id FROM drivers WHERE email = ? OR license_number = ?',
            [email, licenseNumber]
        );
        
        if (existingDrivers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Driver with this email or license number already exists'
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Insert new driver with pending status
        const result = await db.run(`
            INSERT INTO drivers (
                full_name, email, phone, license_number, address, 
                password, status, profile_photo, hire_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE())
        `, [fullName, email, phone, licenseNumber, address, hashedPassword, 'pending', null]);
        
        // Get the created driver
        const [newDriver] = await db.query(
            'SELECT id, full_name, email, status FROM drivers WHERE id = ?',
            [result.lastID]
        );
        
        res.status(201).json({
            success: true,
            message: 'Driver registration successful! Your account is pending approval.',
            data: newDriver[0]
        });
        
    } catch (error) {
        console.error('Driver registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// Driver Login
router.post('/drivers/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        // Find driver by email
        const [drivers] = await db.query(
            'SELECT * FROM drivers WHERE email = ?',
            [email]
        );
        
        if (!drivers || drivers.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        const driver = drivers[0];
        
        // Check if driver is approved
        if (driver.status === 'pending') {
            return res.status(403).json({
                success: false,
                message: 'Your account is pending approval. Please contact the administrator.'
            });
        }
        
        if (driver.status !== 'approved' && driver.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Your account is not active. Please contact the administrator.'
            });
        }
        
        // Compare password
        const isPasswordValid = await bcrypt.compare(password, driver.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: driver.id, 
                email: driver.email, 
                role: 'driver',
                fullName: driver.full_name 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Remove password from response
        const { password: _, ...driverWithoutPassword } = driver;
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            driver: driverWithoutPassword
        });
        
    } catch (error) {
        console.error('Driver login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Admin Login
router.post('/admins/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        // Find admin by email
        const [admins] = await db.query(
            'SELECT * FROM admins WHERE email = ?',
            [email]
        );
        
        if (!admins || admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        const admin = admins[0];
        
        // Compare password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: admin.id, 
                email: admin.email, 
                role: admin.role,
                fullName: admin.full_name 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Remove password from response
        const { password: _, ...adminWithoutPassword } = admin;
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: adminWithoutPassword
        });
        
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Get Pending Drivers (for admin approval)
router.get('/drivers/pending', authenticateToken, authorizeRoles(['super_admin', 'admin']), async (req, res) => {
    try {
        const [pendingDrivers] = await db.query(`
            SELECT id, full_name, email, phone, license_number, 
                   created_at, hire_date
            FROM drivers 
            WHERE status = 'pending'
            ORDER BY created_at DESC
        `);
        
        res.json({
            success: true,
            data: pendingDrivers
        });
        
    } catch (error) {
        console.error('Get pending drivers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Approve Driver
router.put('/drivers/:id/approve', authenticateToken, authorizeRoles(['super_admin', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if driver exists and is pending
        const [driver] = await db.query(
            'SELECT * FROM drivers WHERE id = ? AND status = ?',
            [id, 'pending']
        );
        
        if (!driver || driver.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found or already approved'
            });
        }
        
        // Update driver status to approved
        await db.query(
            'UPDATE drivers SET status = ? WHERE id = ?',
            ['approved', id]
        );
        
        res.json({
            success: true,
            message: 'Driver approved successfully'
        });
        
    } catch (error) {
        console.error('Approve driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Reject Driver
router.put('/drivers/:id/reject', authenticateToken, authorizeRoles(['super_admin', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        // Check if driver exists and is pending
        const [driver] = await db.query(
            'SELECT * FROM drivers WHERE id = ? AND status = ?',
            [id, 'pending']
        );
        
        if (!driver || driver.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found or already processed'
            });
        }
        
        // Update driver status to rejected
        await db.query(
            'UPDATE drivers SET status = ? WHERE id = ?',
            ['rejected', id]
        );
        
        res.json({
            success: true,
            message: 'Driver rejected successfully'
        });
        
    } catch (error) {
        console.error('Reject driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Forgot Password - Driver
router.post('/drivers/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        
        // Check if driver exists
        const [drivers] = await db.query(
            'SELECT id, full_name FROM drivers WHERE email = ?',
            [email]
        );
        
        if (!drivers || drivers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email'
            });
        }
        
        // In a real application, you would send an email here
        // For demo, we'll just return success
        
        res.json({
            success: true,
            message: 'Password reset link sent to your email'
        });
        
    } catch (error) {
        console.error('Driver forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Forgot Password - Admin
router.post('/admins/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        
        // Check if admin exists
        const [admins] = await db.query(
            'SELECT id, full_name FROM admins WHERE email = ?',
            [email]
        );
        
        if (!admins || admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No admin account found with this email'
            });
        }
        
        // In a real application, you would send an email here
        // For demo, we'll just return success
        
        res.json({
            success: true,
            message: 'Password reset link sent to your admin email'
        });
        
    } catch (error) {
        console.error('Admin forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
}

// Middleware to authorize roles
function authorizeRoles(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not authenticated.'
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }
        
        next();
    };
}

// Get Driver Profile
router.get('/drivers/profile', authenticateToken, async (req, res) => {
    try {
        const [drivers] = await db.query(
            'SELECT id, full_name, email, phone, license_number, status, profile_photo, hire_date FROM drivers WHERE id = ?',
            [req.user.id]
        );
        
        if (!drivers || drivers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }
        
        // Get assigned bus and route
        const [assignments] = await db.query(`
            SELECT 
                b.bus_number, b.model, b.capacity,
                r.route_name, r.route_code, r.estimated_duration
            FROM drivers d
            LEFT JOIN buses b ON d.id = b.driver_id
            LEFT JOIN routes r ON b.id = r.bus_id
            WHERE d.id = ?
        `, [req.user.id]);
        
        const driver = drivers[0];
        driver.assignedBus = assignments[0]?.bus_number || 'Not Assigned';
        driver.assignedRoute = assignments[0]?.route_name || 'Not Assigned';
        driver.startTime = assignments[0]?.estimated_duration ? '7:00 AM' : 'Not Set';
        
        // Get student count for driver's route
        if (assignments[0]?.route_id) {
            const [studentCount] = await db.query(
                'SELECT COUNT(*) as count FROM students WHERE route_id = ?',
                [assignments[0].route_id]
            );
            driver.studentsCount = studentCount[0]?.count || 0;
        } else {
            driver.studentsCount = 0;
        }
        
        res.json({
            success: true,
            data: driver
        });
        
    } catch (error) {
        console.error('Get driver profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Unified Login for all roles
router.post('/unified/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        
        // Check Admins
        let [users] = await db.query('SELECT *, "admin" as role FROM admins WHERE email = ?', [email]);
        
        // Check Drivers if not found in Admins
        if (users.length === 0) {
            [users] = await db.query('SELECT *, "driver" as role FROM drivers WHERE email = ?', [email]);
        }
        
        // Check Parents if not found in Drivers
        if (users.length === 0) {
            [users] = await db.query('SELECT *, "parent" as role FROM parents WHERE email = ?', [email]);
        }
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        const user = users[0];
        
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role,
                fullName: user.full_name || user.fullName
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
        
    } catch (error) {
        console.error('Unified login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// Parent Registration
router.post('/parents/register', async (req, res) => {
    try {
        const { fullName, email, phone, password, studentId } = req.body;
        
        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: 'Full name, email, and password are required' });
        }
        
        // Check if parent already exists
        const [existing] = await db.query('SELECT id FROM parents WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Parent with this email already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Insert new parent
        const result = await db.run(`
            INSERT INTO parents (full_name, email, phone, student_id, password, status) 
            VALUES (?, ?, ?, ?, ?, 'active')
        `, [fullName, email, phone, studentId || null, hashedPassword]);
        
        const [newParent] = await db.query('SELECT id, full_name, email FROM parents WHERE id = ?', [result.lastID]);
        
        res.status(201).json({
            success: true,
            message: 'Parent registration successful!',
            data: newParent[0]
        });
        
    } catch (error) {
        console.error('Parent registration error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
});

export default router;
