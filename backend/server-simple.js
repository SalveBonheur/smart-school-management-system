import express from 'express';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Import database
import { connectDB, get, query, run } from './config/db.js';

// Global database connection
let db;

// Define __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware (basic security headers)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: {
            name: 'RateLimitError',
            message: 'Too many requests from this IP, please try again later.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend/public'), {
    maxAge: '1d',
    etag: false
}));

// Basic routes (without middleware for now)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public", "landing.html"));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public", "admin-dashboard.html"));
});

app.get("/admin-login", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public", "admin-login.html"));
});

app.get("/driver-login", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public", "driver-login.html"));
});

app.get("/driver-register", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public", "driver-register.html"));
});

app.get("/driver-dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public", "driver-dashboard.html"));
});

app.get("/parent-login", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public", "parent-login.html"));
});

app.get("/parent-register", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public", "parent-register.html"));
});

app.get("/parent-dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public", "parent-dashboard.html"));
});

// Admin Dashboard - Get all students
app.get("/api/admin/students", async (req, res) => {
    try {
        const students = await db.all('SELECT s.*, b.bus_number, r.route_name, d.full_name as driver_name FROM students s LEFT JOIN buses b ON s.bus_id = b.id LEFT JOIN routes r ON s.route_id = r.id LEFT JOIN drivers d ON b.driver_id = d.id');
        res.json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Add student
app.post("/api/admin/students", async (req, res) => {
    try {
        const { firstName, lastName, email, phone, grade, address, busId, routeId, parentId, parentName, parentPhone, parentEmail, emergencyContact } = req.body;
        
        if (!firstName || !lastName || !email) {
            return res.status(400).json({ success: false, error: "First name, last name, and email are required" });
        }
        
        const fullName = `${firstName} ${lastName}`;
        const studentId = `STU-${Date.now()}`;
        
        const result = await db.run(
            `INSERT INTO students (student_id, full_name, parent_email, parent_phone, grade, address, bus_id, route_id, parent_name, parent_email, emergency_contact, admission_date, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), 'active')`,
            [studentId, fullName, email, phone || parentPhone, grade, address, busId || null, routeId || null, parentName || fullName, parentEmail || email, emergencyContact || '']
        );
        
        res.json({ success: true, data: { id: result.lastID, message: "Student added successfully" } });
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Update student
app.put("/api/admin/students/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phone, grade, address, busId, routeId, parentName, parentPhone, parentEmail, emergencyContact } = req.body;
        
        const fullName = firstName && lastName ? `${firstName} ${lastName}` : null;
        
        // Get current student data to preserve unchanged fields
        const [existing] = await db.query ? await db.query('SELECT * FROM students WHERE id = ?', [id]) 
            : [await db.get('SELECT * FROM students WHERE id = ?', [id])];
        
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            return res.status(404).json({ success: false, error: "Student not found" });
        }
        
        const student = Array.isArray(existing) ? existing[0] : existing;
        
        const result = await db.run(
            `UPDATE students SET 
                full_name = COALESCE(?, full_name), 
                parent_email = COALESCE(?, parent_email), 
                parent_phone = COALESCE(?, parent_phone), 
                grade = COALESCE(?, grade), 
                address = COALESCE(?, address), 
                bus_id = ?, 
                route_id = ?, 
                parent_name = COALESCE(?, parent_name),
                emergency_contact = COALESCE(?, emergency_contact),
                updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [fullName, parentEmail || email, parentPhone || phone, grade, address, busId || student.bus_id, routeId || student.route_id, parentName, emergencyContact, id]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: "Student not found" });
        }
        
        res.json({ success: true, data: { message: "Student updated successfully" } });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Delete student
app.delete("/api/admin/students/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.run('DELETE FROM students WHERE id = ?', [id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: "Student not found" });
        }
        
        res.json({ success: true, data: { message: "Student deleted successfully" } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Get all drivers
app.get("/api/admin/drivers", async (req, res) => {
    try {
        const drivers = await get('SELECT d.*, b.bus_number, COUNT(s.id) as student_count FROM drivers d LEFT JOIN buses b ON d.id = b.driver_id LEFT JOIN students s ON b.id = s.bus_id GROUP BY d.id');
        res.json({ success: true, data: drivers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Add driver
app.post("/api/admin/drivers", async (req, res) => {
    try {
        const { fullName, email, phone, licenseNumber, address, status } = req.body;
        
        if (!fullName || !email || !licenseNumber) {
            return res.status(400).json({ success: false, error: "Full name, email, and license number are required" });
        }
        
        const result = await db.run(
            'INSERT INTO drivers (full_name, email, phone, license_number, address, status) VALUES (?, ?, ?, ?, ?, ?)',
            [fullName, email, phone, licenseNumber, address, status || 'pending']
        );
        
        res.json({ success: true, data: { id: result.lastID, message: "Driver added successfully" } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Update driver
app.put("/api/admin/drivers/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone, licenseNumber, address, status } = req.body;
        
        const result = await db.run(
            'UPDATE drivers SET full_name = ?, email = ?, phone = ?, license_number = ?, address = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [fullName, email, phone, licenseNumber, address, status, id]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: "Driver not found" });
        }
        
        res.json({ success: true, data: { message: "Driver updated successfully" } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Delete driver
app.delete("/api/admin/drivers/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.run('DELETE FROM drivers WHERE id = ?', [id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: "Driver not found" });
        }
        
        res.json({ success: true, data: { message: "Driver deleted successfully" } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Get all buses
app.get("/api/admin/buses", async (req, res) => {
    try {
        const buses = await get('SELECT b.*, d.full_name as driver_name, COUNT(s.id) as student_count FROM buses b LEFT JOIN drivers d ON b.driver_id = d.id LEFT JOIN students s ON b.id = s.bus_id GROUP BY b.id');
        res.json({ success: true, data: buses });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Add bus
app.post("/api/admin/buses", async (req, res) => {
    try {
        const { busNumber, capacity, driverId, routeId, status } = req.body;
        
        if (!busNumber || !capacity) {
            return res.status(400).json({ success: false, error: "Bus number and capacity are required" });
        }
        
        const result = await db.run(
            'INSERT INTO buses (bus_number, capacity, driver_id, route_id, status) VALUES (?, ?, ?, ?, ?)',
            [busNumber, capacity, driverId, routeId, status || 'active']
        );
        
        res.json({ success: true, data: { id: result.lastID, message: "Bus added successfully" } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Update bus
app.put("/api/admin/buses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { busNumber, capacity, driverId, routeId, status } = req.body;
        
        const result = await db.run(
            'UPDATE buses SET bus_number = ?, capacity = ?, driver_id = ?, route_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [busNumber, capacity, driverId, routeId, status, id]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: "Bus not found" });
        }
        
        res.json({ success: true, data: { message: "Bus updated successfully" } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Delete bus
app.delete("/api/admin/buses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.run('DELETE FROM buses WHERE id = ?', [id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: "Bus not found" });
        }
        
        res.json({ success: true, data: { message: "Bus deleted successfully" } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Get all routes
app.get("/api/admin/routes", async (req, res) => {
    try {
        const routes = await get('SELECT r.*, COUNT(b.id) as bus_count FROM routes r LEFT JOIN buses b ON r.id = b.route_id GROUP BY r.id');
        res.json({ success: true, data: routes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Add route
app.post("/api/admin/routes", async (req, res) => {
    try {
        const { routeName, startLocation, endLocation, distance, estimatedTime, status } = req.body;
        
        if (!routeName || !startLocation || !endLocation) {
            return res.status(400).json({ success: false, error: "Route name, start location, and end location are required" });
        }
        
        const result = await db.run(
            'INSERT INTO routes (route_name, start_location, end_location, distance, estimated_time, status) VALUES (?, ?, ?, ?, ?, ?)',
            [routeName, startLocation, endLocation, distance, estimatedTime, status || 'active']
        );
        
        res.json({ success: true, data: { id: result.lastID, message: "Route added successfully" } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Update route
app.put("/api/admin/routes/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { routeName, startLocation, endLocation, distance, estimatedTime, status } = req.body;
        
        const result = await db.run(
            'UPDATE routes SET route_name = ?, start_location = ?, end_location = ?, distance = ?, estimated_time = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [routeName, startLocation, endLocation, distance, estimatedTime, status, id]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: "Route not found" });
        }
        
        res.json({ success: true, data: { message: "Route updated successfully" } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Delete route
app.delete("/api/admin/routes/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.run('DELETE FROM routes WHERE id = ?', [id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: "Route not found" });
        }
        
        res.json({ success: true, data: { message: "Route deleted successfully" } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Get attendance records
app.get("/api/admin/attendance", async (req, res) => {
    try {
        const { date } = req.query;
        let query = `
            SELECT a.*, s.first_name, s.last_name, s.student_id, b.bus_number, r.route_name 
            FROM attendance a 
            JOIN students s ON a.student_id = s.id 
            LEFT JOIN buses b ON s.bus_id = b.id 
            LEFT JOIN routes r ON s.route_id = r.id
        `;
        const params = [];
        
        if (date) {
            query += ' WHERE DATE(a.date) = ?';
            params.push(date);
        }
        
        query += ' ORDER BY a.date DESC';
        
        const attendance = await get(query, params);
        res.json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Mark attendance
app.post("/api/admin/attendance", async (req, res) => {
    try {
        const { studentId, status, date, notes } = req.body;
        
        if (!studentId || !status || !date) {
            return res.status(400).json({ success: false, error: "Student ID, status, and date are required" });
        }
        
        const result = await db.run(
            'INSERT INTO attendance (student_id, status, date, notes) VALUES (?, ?, ?, ?)',
            [studentId, status, date, notes]
        );
        
        res.json({ success: true, data: { id: result.lastID, message: "Attendance marked successfully" } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Get payments
app.get("/api/admin/payments", async (req, res) => {
    try {
        const payments = await get(`
            SELECT p.*, s.first_name, s.last_name, s.student_id, pr.full_name as parent_name 
            FROM payments p 
            JOIN students s ON p.student_id = s.id 
            JOIN parents pr ON s.parent_id = pr.id
            ORDER BY p.created_at DESC
        `);
        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Add payment
app.post("/api/admin/payments", async (req, res) => {
    try {
        const { studentId, amount, paymentMethod, status, dueDate, notes } = req.body;
        
        if (!studentId || !amount || !paymentMethod) {
            return res.status(400).json({ success: false, error: "Student ID, amount, and payment method are required" });
        }
        
        const result = await db.run(
            'INSERT INTO payments (student_id, amount, payment_method, status, due_date, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [studentId, amount, paymentMethod, status || 'pending', dueDate, notes]
        );
        
        res.json({ success: true, data: { id: result.lastID, message: "Payment added successfully" } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Update payment status
app.put("/api/admin/payments/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paidDate, notes } = req.body;
        
        const result = await db.run(
            'UPDATE payments SET status = ?, paid_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, paidDate, notes, id]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: "Payment not found" });
        }
        
        res.json({ success: true, data: { message: "Payment updated successfully" } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Dashboard - Get dashboard statistics
app.get("/api/admin/dashboard/stats", async (req, res) => {
    try {
        const studentCount = await get('SELECT COUNT(*) as count FROM students');
        const driverCount = await get('SELECT COUNT(*) as count FROM drivers');
        const busCount = await get('SELECT COUNT(*) as count FROM buses');
        const routeCount = await get('SELECT COUNT(*) as count FROM routes');
        const todayAttendance = await get('SELECT COUNT(*) as count FROM attendance WHERE DATE(date) = DATE("now") AND status = "present"');
        const pendingPayments = await get('SELECT COUNT(*) as count FROM payments WHERE status = "pending"');
        const monthlyRevenue = await get('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = "paid" AND DATE(created_at) >= DATE("now", "-30 days")');
        
        res.json({
            success: true,
            data: {
                totalStudents: studentCount[0].count,
                totalDrivers: driverCount[0].count,
                totalBuses: busCount[0].count,
                totalRoutes: routeCount[0].count,
                todayAttendance: todayAttendance[0].count,
                pendingPayments: pendingPayments[0].count,
                monthlyRevenue: monthlyRevenue[0].total
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Driver Dashboard - Get driver's assigned students
app.get("/api/drivers/students", async (req, res) => {
    try {
        const driverInfo = JSON.parse(req.headers.authorization?.split(' ')[1] || '{}');
        const students = await db.all(`
            SELECT s.*, b.bus_number, r.route_name 
            FROM students s 
            LEFT JOIN buses b ON s.bus_id = b.id 
            LEFT JOIN routes r ON s.route_id = r.id 
            WHERE b.driver_id = ?
        `, [driverInfo.id]);
        
        res.json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Driver Dashboard - Mark attendance
app.post("/api/drivers/attendance", async (req, res) => {
    try {
        const { studentId, status, date, notes } = req.body;
        
        if (!studentId || !status || !date) {
            return res.status(400).json({ success: false, error: "Student ID, status, and date are required" });
        }
        
        const result = await db.run(
            'INSERT INTO attendance (student_id, status, date, notes) VALUES (?, ?, ?, ?)',
            [studentId, status, date, notes]
        );
        
        res.json({ success: true, data: { id: result.lastID, message: "Attendance marked successfully" } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Driver Dashboard - Get driver's schedule
app.get("/api/drivers/schedule", async (req, res) => {
    try {
        const driverInfo = JSON.parse(req.headers.authorization?.split(' ')[1] || '{}');
        const schedule = await db.all(`
            SELECT r.route_name, b.bus_number, COUNT(s.id) as student_count
            FROM routes r
            LEFT JOIN buses b ON r.id = b.route_id
            LEFT JOIN students s ON b.id = s.bus_id
            WHERE b.driver_id = ?
            GROUP BY r.id, b.id
        `, [driverInfo.id]);
        
        res.json({ success: true, data: schedule });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Driver Dashboard - Update driver location (for GPS tracking)
app.post("/api/drivers/location", async (req, res) => {
    try {
        const { latitude, longitude, timestamp } = req.body;
        const driverInfo = JSON.parse(req.headers.authorization?.split(' ')[1] || '{}');
        
        const result = await db.run(
            'INSERT INTO driver_locations (driver_id, latitude, longitude, timestamp) VALUES (?, ?, ?, ?)',
            [driverInfo.id, latitude, longitude, timestamp || new Date().toISOString()]
        );
        
        res.json({ success: true, data: { message: "Location updated successfully" } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Driver registration endpoint
app.post("/api/auth-new/drivers/register", async (req, res) => {
    try {
        const { fullName, email, phone, licenseNumber, address, password, confirmPassword } = req.body;
        
        // Basic validation
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Full name, email, and password are required"
            });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
        
        // Here you would typically:
        // 1. Check if driver already exists in database
        // 2. Hash the password
        // 3. Save driver to database
        // 4. Return success response
        
        // For now, we'll simulate a successful registration
        console.log('Driver registration attempt:', { fullName, email, phone, licenseNumber, address });
        
        res.status(201).json({
            success: true,
            message: "Driver registered successfully",
            data: {
                fullName,
                email,
                phone,
                licenseNumber,
                address
            }
        });
        
    } catch (error) {
        console.error('Driver registration error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Parent registration endpoint
app.post("/api/parents/register", async (req, res) => {
    try {
        const { fullName, email, phone, password, studentId } = req.body;
        
        // Basic validation
        if (!fullName || !email || !password || !studentId) {
            return res.status(400).json({
                success: false,
                error: {
                    message: "Full name, email, password, and student ID are required"
                }
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: "Invalid email format"
                }
            });
        }
        
        // Phone validation (Rwandan format)
        const phoneRegex = /^\+250\s?\d{3}\s?\d{3}\s?\d{3}$/;
        if (phone && !phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: "Invalid phone number format. Use +250 XXX XXX XXX"
                }
            });
        }
        
        // Password validation
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: {
                    message: "Password must be at least 6 characters long"
                }
            });
        }
        
        // Here you would typically:
        // 1. Check if parent already exists in database
        // 2. Hash the password
        // 3. Save parent to database
        // 4. Link parent to student
        // 5. Return success response
        
        // For now, we'll simulate a successful registration
        console.log('Parent registration attempt:', { fullName, email, phone, studentId });
        
        res.status(201).json({
            success: true,
            message: "Parent registered successfully",
            data: {
                fullName,
                email,
                phone,
                studentId
            }
        });
        
    } catch (error) {
        console.error('Parent registration error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: "Internal server error"
            }
        });
    }
});

// Driver login endpoint
app.post("/api/auth-new/drivers/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
        
        // Here you would typically:
        // 1. Check if driver exists in database
        // 2. Compare hashed password
        // 3. Generate JWT token
        // 4. Return driver info and token
        
        // For now, we'll simulate a successful login for any valid email/password
        console.log('Driver login attempt:', { email });
        
        // Simulate driver data
        const driver = {
            id: 1,
            fullName: "Test Driver",
            email: email,
            phone: "1234567890",
            licenseNumber: "ABC123",
            status: "active"
        };
        
        // Simulate token (in real app, use JWT)
        const token = "mock-jwt-token-" + Date.now();
        
        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            driver: driver
        });
        
    } catch (error) {
        console.error('Driver login error:', error);
        res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
});

// Admin login endpoint
app.post("/api/auth-new/admins/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
        
        // Default admin credentials
        const DEFAULT_ADMIN_EMAIL = "isalvebonheur@gmail.com";
        const DEFAULT_ADMIN_PASSWORD = "Bob2010";
        
        // Check credentials
        if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
            console.log('Admin login successful:', { email });
            
            // Admin data
            const admin = {
                id: 1,
                fullName: "System Administrator",
                email: email,
                role: "admin",
                permissions: ["full_access"]
            };
            
            // Simulate token (in real app, use JWT)
            const token = "admin-jwt-token-" + Date.now();
            
            res.status(200).json({
                success: true,
                message: "Login successful",
                token: token,
                admin: admin
            });
        } else {
            console.log('Admin login failed:', { email });
            res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
});

// API health check
app.get("/api/health", async (req, res) => {
    res.json({
        success: true,
        message: "Smart School Transport API is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development"
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            name: 'NotFoundError',
            message: 'Route not found'
        }
    });
});

// ==================== PARENT AUTHENTICATION ROUTES ====================

// Parent Registration
app.post('/api/parents/register', async (req, res) => {
    try {
        const { fullName, email, phone, password, studentId } = req.body;

        // Validate required fields
        if (!fullName || !email || !phone || !password || !studentId) {
            return res.status(400).json({
                success: false,
                error: {
                    name: 'ValidationError',
                    message: 'All fields are required'
                }
            });
        }

        // Check if parent already exists
        const existingParent = await get('SELECT id FROM parents WHERE email = ?', [email]);
        if (existingParent) {
            return res.status(400).json({
                success: false,
                error: {
                    name: 'DuplicateError',
                    message: 'Parent with this email already exists'
                }
            });
        }

        // Check if student exists
        const student = await get('SELECT id, student_id FROM students WHERE id = ?', [studentId]);
        if (!student) {
            return res.status(400).json({
                success: false,
                error: {
                    name: 'ValidationError',
                    message: 'Student not found'
                }
            });
        }

        // Hash password (simple hash for demo - in production use bcrypt)
        const hashedPassword = password; // In production: await bcrypt.hash(password, 10)

        // Create parent
        const result = await run(
            'INSERT INTO parents (full_name, email, phone, password, student_id) VALUES (?, ?, ?, ?, ?)',
            [fullName, email, phone, hashedPassword, studentId]
        );

        // Get created parent
        const newParent = await get('SELECT * FROM parents WHERE id = ?', [result.lastID]);

        res.status(201).json({
            success: true,
            data: {
                id: newParent.id,
                fullName: newParent.full_name,
                email: newParent.email,
                phone: newParent.phone,
                studentId: newParent.student_id,
                createdAt: newParent.created_at
            },
            message: 'Parent registered successfully'
        });

    } catch (error) {
        console.error('Parent registration error:', error);
        res.status(500).json({
            success: false,
            error: {
                name: 'RegistrationError',
                message: 'Failed to register parent'
            }
        });
    }
});

// Parent Login
app.post('/api/parents/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: {
                    name: 'ValidationError',
                    message: 'Email and password are required'
                }
            });
        }

        // Find parent
        const parent = await get('SELECT * FROM parents WHERE email = ?', [email]);
        if (!parent) {
            return res.status(401).json({
                success: false,
                error: {
                    name: 'AuthenticationError',
                    message: 'Invalid email or password'
                }
            });
        }

        // Check password (simple check for demo - in production use bcrypt.compare)
        if (parent.password !== password) {
            return res.status(401).json({
                success: false,
                error: {
                    name: 'AuthenticationError',
                    message: 'Invalid email or password'
                }
            });
        }

        // Get student information
        const student = await get(`
            SELECT s.*, b.bus_number, r.route_name, d.full_name as driver_name, d.phone as driver_phone
            FROM students s
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            WHERE s.id = ?
        `, [parent.student_id]);

        // Generate JWT token (simple token for demo - in production use proper JWT)
        const token = `parent-token-${Date.now()}-${parent.id}`;

        res.json({
            success: true,
            data: {
                token,
                parent: {
                    id: parent.id,
                    fullName: parent.full_name,
                    email: parent.email,
                    phone: parent.phone,
                    studentId: parent.student_id
                },
                student: student ? {
                    id: student.id,
                    studentId: student.student_id,
                    firstName: student.first_name,
                    lastName: student.last_name,
                    grade: student.grade,
                    address: student.address,
                    busNumber: student.bus_number,
                    routeName: student.route_name,
                    driverName: student.driver_name,
                    driverPhone: student.driver_phone
                } : null
            },
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Parent login error:', error);
        res.status(500).json({
            success: false,
            error: {
                name: 'LoginError',
                message: 'Failed to login'
            }
        });
    }
});

// Get Parent Profile
app.get('/api/parents/profile/:id', async (req, res) => {
    try {
        const parentId = req.params.id;

        // Get parent information
        const parent = await get('SELECT * FROM parents WHERE id = ?', [parentId]);
        if (!parent) {
            return res.status(404).json({
                success: false,
                error: {
                    name: 'NotFoundError',
                    message: 'Parent not found'
                }
            });
        }

        // Get student information
        const student = await get(`
            SELECT s.*, b.bus_number, r.route_name, d.full_name as driver_name, d.phone as driver_phone
            FROM students s
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            WHERE s.id = ?
        `, [parent.student_id]);

        res.json({
            success: true,
            data: {
                parent: {
                    id: parent.id,
                    fullName: parent.full_name,
                    email: parent.email,
                    phone: parent.phone,
                    studentId: parent.student_id,
                    createdAt: parent.created_at
                },
                student: student ? {
                    id: student.id,
                    studentId: student.student_id,
                    firstName: student.first_name,
                    lastName: student.last_name,
                    grade: student.grade,
                    address: student.address,
                    busNumber: student.bus_number,
                    routeName: student.route_name,
                    driverName: student.driver_name,
                    driverPhone: student.driver_phone
                } : null
            }
        });

    } catch (error) {
        console.error('Get parent profile error:', error);
        res.status(500).json({
            success: false,
            error: {
                name: 'ProfileError',
                message: 'Failed to get parent profile'
            }
        });
    }
});

// Get Parent Attendance
app.get('/api/parents/attendance/:id', async (req, res) => {
    try {
        const parentId = req.params.id;

        // Get parent and student
        const parent = await get('SELECT student_id FROM parents WHERE id = ?', [parentId]);
        if (!parent) {
            return res.status(404).json({
                success: false,
                error: {
                    name: 'NotFoundError',
                    message: 'Parent not found'
                }
            });
        }

        // Get attendance records
        const attendance = await query(`
            SELECT a.*, b.bus_number
            FROM attendance a
            LEFT JOIN buses b ON a.bus_id = b.id
            WHERE a.student_id = ?
            ORDER BY a.date DESC
            LIMIT 30
        `, [parent.student_id]);

        res.json({
            success: true,
            data: attendance
        });

    } catch (error) {
        console.error('Get parent attendance error:', error);
        res.status(500).json({
            success: false,
            error: {
                name: 'AttendanceError',
                message: 'Failed to get attendance records'
            }
        });
    }
});

// Get Parent Payments
app.get('/api/parents/payments/:id', async (req, res) => {
    try {
        const parentId = req.params.id;

        // Get parent and student
        const parent = await get('SELECT student_id FROM parents WHERE id = ?', [parentId]);
        if (!parent) {
            return res.status(404).json({
                success: false,
                error: {
                    name: 'NotFoundError',
                    message: 'Parent not found'
                }
            });
        }

        // Get payment records
        const payments = await query(`
            SELECT * FROM payments
            WHERE student_id = ?
            ORDER BY payment_date DESC
            LIMIT 30
        `, [parent.student_id]);

        // Calculate totals
        const totalPaid = payments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);
        
        const totalUnpaid = payments
            .filter(p => p.status === 'unpaid')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);

        res.json({
            success: true,
            data: {
                payments,
                summary: {
                    totalPaid,
                    totalUnpaid,
                    balance: totalUnpaid
                }
            }
        });

    } catch (error) {
        console.error('Get parent payments error:', error);
        res.status(500).json({
            success: false,
            error: {
                name: 'PaymentsError',
                message: 'Failed to get payment records'
            }
        });
    }
});

// ==================== QR CODE ATTENDANCE API ====================

// Generate QR Code for Student
app.post('/api/qr-codes/generate/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const crypto = await import('crypto');
        
        // Check if student exists
        const student = await get('SELECT * FROM students WHERE id = ?', [studentId]);
        if (!student) {
            return res.status(404).json({ success: false, error: { message: 'Student not found' } });
        }
        
        // Generate unique QR code data
        const qrCodeData = `STS-${studentId}-${Date.now()}-${crypto.randomUUID()}`;
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Expires in 1 year
        
        // Deactivate old QR codes for this student
        await run('UPDATE qr_codes SET is_active = 0 WHERE student_id = ?', [studentId]);
        
        // Insert new QR code
        const result = await run(
            'INSERT INTO qr_codes (student_id, qr_code_data, expires_at, is_active) VALUES (?, ?, ?, 1)',
            [studentId, qrCodeData, expiresAt.toISOString()]
        );
        
        res.json({
            success: true,
            data: {
                qr_code_id: result.lastID,
                student_id: studentId,
                qr_code_data: qrCodeData,
                expires_at: expiresAt.toISOString(),
                student_name: `${student.first_name} ${student.last_name}`
            }
        });
    } catch (error) {
        console.error('Generate QR code error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to generate QR code' } });
    }
});

// Get Student QR Code
app.get('/api/qr-codes/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const qrCode = await get(
            'SELECT * FROM qr_codes WHERE student_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1',
            [studentId]
        );
        
        if (!qrCode) {
            return res.status(404).json({ success: false, error: { message: 'No active QR code found' } });
        }
        
        res.json({ success: true, data: qrCode });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to get QR code' } });
    }
});

// Scan QR Code and Mark Attendance
app.post('/api/attendance/scan', async (req, res) => {
    try {
        const { qr_code_data, driver_id, bus_id, location, action } = req.body;
        
        // Find QR code
        const qrCode = await get('SELECT * FROM qr_codes WHERE qr_code_data = ? AND is_active = 1', [qr_code_data]);
        if (!qrCode) {
            return res.status(404).json({ success: false, error: { message: 'Invalid or expired QR code' } });
        }
        
        const studentId = qrCode.student_id;
        const today = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toTimeString().slice(0, 8);
        
        // Check if attendance record exists for today
        let attendance = await get(
            'SELECT * FROM attendance_qr WHERE student_id = ? AND date = ? ORDER BY id DESC LIMIT 1',
            [studentId, today]
        );
        
        if (action === 'board') {
            if (attendance && attendance.boarding_time) {
                return res.status(400).json({ success: false, error: { message: 'Student already boarded today' } });
            }
            
            // Create new boarding record
            const result = await run(
                `INSERT INTO attendance_qr (student_id, bus_id, driver_id, qr_code_id, date, boarding_time, boarding_location, status, scanned_by) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'boarded', 'driver')`,
                [studentId, bus_id, driver_id, qrCode.id, today, currentTime, location]
            );
            
            // Send notification to parent
            await sendParentNotification(studentId, 'student_boarded', 'Student Boarded Bus', 
                `Your child has boarded the bus at ${currentTime}`);
            
            res.json({ success: true, data: { attendance_id: result.lastID, status: 'boarded', time: currentTime } });
            
        } else if (action === 'dropoff') {
            if (!attendance || !attendance.boarding_time) {
                return res.status(400).json({ success: false, error: { message: 'Student has not boarded yet' } });
            }
            
            if (attendance.dropoff_time) {
                return res.status(400).json({ success: false, error: { message: 'Student already dropped off today' } });
            }
            
            // Update with dropoff time
            await run(
                'UPDATE attendance_qr SET dropoff_time = ?, dropoff_location = ?, status = ? WHERE id = ?',
                [currentTime, location, 'completed', attendance.id]
            );
            
            // Send notification to parent
            await sendParentNotification(studentId, 'student_dropped', 'Student Dropped Off', 
                `Your child has been dropped off at ${currentTime}`);
            
            res.json({ success: true, data: { status: 'completed', dropoff_time: currentTime } });
        }
    } catch (error) {
        console.error('Scan QR error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to process QR scan' } });
    }
});

// Helper function to send parent notification
async function sendParentNotification(studentId, type, title, message) {
    try {
        // Find parent for this student
        const parent = await get('SELECT id FROM parents WHERE student_id = ?', [studentId]);
        if (parent) {
            await run(
                'INSERT INTO notifications (parent_id, student_id, type, title, message) VALUES (?, ?, ?, ?, ?)',
                [parent.id, studentId, type, title, message]
            );
        }
    } catch (error) {
        console.error('Send notification error:', error);
    }
}

// Get QR Attendance Records
app.get('/api/attendance/qr', async (req, res) => {
    try {
        const { student_id, date, bus_id, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
        let sql = `
            SELECT aq.*, s.first_name, s.last_name, s.student_id as student_code, 
                   b.bus_number, d.full_name as driver_name
            FROM attendance_qr aq
            JOIN students s ON aq.student_id = s.id
            JOIN buses b ON aq.bus_id = b.id
            JOIN drivers d ON aq.driver_id = d.id
            WHERE 1=1
        `;
        const params = [];
        
        if (student_id) { sql += ' AND aq.student_id = ?'; params.push(student_id); }
        if (date) { sql += ' AND aq.date = ?'; params.push(date); }
        if (bus_id) { sql += ' AND aq.bus_id = ?'; params.push(bus_id); }
        
        sql += ' ORDER BY aq.date DESC, aq.boarding_time DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const records = await query(sql, params);
        
        // Get total count
        let countSql = 'SELECT COUNT(*) as total FROM attendance_qr WHERE 1=1';
        const countParams = [];
        if (student_id) { countSql += ' AND student_id = ?'; countParams.push(student_id); }
        if (date) { countSql += ' AND date = ?'; countParams.push(date); }
        if (bus_id) { countSql += ' AND bus_id = ?'; countParams.push(bus_id); }
        const { total } = await get(countSql, countParams);
        
        res.json({
            success: true,
            data: records,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to get attendance records' } });
    }
});

// ==================== PARENT NOTIFICATIONS API ====================

// Get Parent Notifications
app.get('/api/notifications/parent/:parentId', async (req, res) => {
    try {
        const { parentId } = req.params;
        const { unread_only = false, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
        let sql = `
            SELECT n.*, s.first_name, s.last_name
            FROM notifications n
            JOIN students s ON n.student_id = s.id
            WHERE n.parent_id = ?
        `;
        const params = [parentId];
        
        if (unread_only === 'true') {
            sql += ' AND n.is_read = 0';
        }
        
        sql += ' ORDER BY n.sent_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const notifications = await query(sql, params);
        
        // Get unread count
        const { unreadCount } = await get(
            'SELECT COUNT(*) as unreadCount FROM notifications WHERE parent_id = ? AND is_read = 0',
            [parentId]
        );
        
        res.json({ success: true, data: notifications, unread_count: unreadCount });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to get notifications' } });
    }
});

// Mark Notification as Read
app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const readAt = new Date().toISOString();
        
        await run('UPDATE notifications SET is_read = 1, read_at = ? WHERE id = ?', [readAt, id]);
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to mark notification as read' } });
    }
});

// Mark All Notifications as Read
app.put('/api/notifications/parent/:parentId/read-all', async (req, res) => {
    try {
        const { parentId } = req.params;
        const readAt = new Date().toISOString();
        
        const result = await run(
            'UPDATE notifications SET is_read = 1, read_at = ? WHERE parent_id = ? AND is_read = 0',
            [readAt, parentId]
        );
        
        res.json({ success: true, message: 'All notifications marked as read', updated: result.changes });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to mark notifications as read' } });
    }
});

// Delete Notification
app.delete('/api/notifications/:id', async (req, res) => {
    try {
        await run('DELETE FROM notifications WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to delete notification' } });
    }
});

// ==================== LIVE BUS STATUS API ====================

// Update Bus Status
app.post('/api/bus-status/update', async (req, res) => {
    try {
        const { bus_id, driver_id, status, location, latitude, longitude, estimated_arrival, delay_minutes, reason } = req.body;
        
        // End previous status
        await run(
            'UPDATE bus_status_logs SET ended_at = ? WHERE bus_id = ? AND ended_at IS NULL',
            [new Date().toISOString(), bus_id]
        );
        
        // Create new status record
        const result = await run(
            `INSERT INTO bus_status_logs (bus_id, driver_id, status, location, latitude, longitude, estimated_arrival, delay_minutes, reason) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [bus_id, driver_id, status, location, latitude, longitude, estimated_arrival, delay_minutes, reason]
        );
        
        // Notify parents of students on this bus
        if (status === 'delayed') {
            const students = await query('SELECT id FROM students WHERE bus_id = ?', [bus_id]);
            for (const student of students) {
                await sendParentNotification(
                    student.id, 'bus_delayed', 'Bus Delayed',
                    `The bus is delayed by ${delay_minutes} minutes. ${reason || ''}`
                );
            }
        }
        
        res.json({ success: true, data: { status_id: result.lastID, status } });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to update bus status' } });
    }
});

// Get Current Bus Status
app.get('/api/bus-status/:busId', async (req, res) => {
    try {
        const { busId } = req.params;
        
        const status = await get(
            `SELECT bsl.*, b.bus_number, d.full_name as driver_name, d.phone as driver_phone
             FROM bus_status_logs bsl
             JOIN buses b ON bsl.bus_id = b.id
             JOIN drivers d ON bsl.driver_id = d.id
             WHERE bsl.bus_id = ? AND bsl.ended_at IS NULL
             ORDER BY bsl.started_at DESC LIMIT 1`,
            [busId]
        );
        
        if (!status) {
            return res.json({ success: true, data: { status: 'idle', message: 'Bus is currently idle' } });
        }
        
        res.json({ success: true, data: status });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to get bus status' } });
    }
});

// Get All Buses Status
app.get('/api/bus-status', async (req, res) => {
    try {
        const buses = await query(`
            SELECT b.id, b.bus_number, b.capacity, d.full_name as driver_name,
                   COALESCE(bsl.status, 'idle') as current_status,
                   bsl.location, bsl.latitude, bsl.longitude, bsl.estimated_arrival,
                   bsl.delay_minutes, bsl.started_at,
                   (SELECT COUNT(*) FROM students WHERE bus_id = b.id) as passenger_count
            FROM buses b
            LEFT JOIN drivers d ON b.driver_id = d.id
            LEFT JOIN bus_status_logs bsl ON b.id = bsl.bus_id AND bsl.ended_at IS NULL
            ORDER BY b.bus_number
        `);
        
        res.json({ success: true, data: buses });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to get bus statuses' } });
    }
});

// ==================== BUS MAINTENANCE API ====================

// Schedule Maintenance
app.post('/api/maintenance', async (req, res) => {
    try {
        const { bus_id, maintenance_type, description, last_service_date, next_service_date, 
                service_interval_days, cost, service_center, notes } = req.body;
        
        const result = await run(
            `INSERT INTO bus_maintenance (bus_id, maintenance_type, description, last_service_date, 
              next_service_date, service_interval_days, cost, service_center, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [bus_id, maintenance_type, description, last_service_date, next_service_date,
             service_interval_days, cost, service_center, notes]
        );
        
        res.json({ success: true, data: { maintenance_id: result.lastID } });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to schedule maintenance' } });
    }
});

// Get Maintenance Records
app.get('/api/maintenance', async (req, res) => {
    try {
        const { bus_id, status, upcoming = false } = req.query;
        
        let sql = `
            SELECT bm.*, b.bus_number, 
                   CASE 
                     WHEN bm.next_service_date < date('now') AND bm.status != 'completed' THEN 'overdue'
                     WHEN bm.next_service_date <= date('now', '+7 days') AND bm.status != 'completed' THEN 'due_soon'
                     ELSE bm.status
                   END as computed_status
            FROM bus_maintenance bm
            JOIN buses b ON bm.bus_id = b.id
            WHERE 1=1
        `;
        const params = [];
        
        if (bus_id) { sql += ' AND bm.bus_id = ?'; params.push(bus_id); }
        if (status) { sql += ' AND bm.status = ?'; params.push(status); }
        if (upcoming === 'true') {
            sql += " AND bm.next_service_date <= date('now', '+30 days') AND bm.status != 'completed'";
        }
        
        sql += ' ORDER BY bm.next_service_date ASC';
        
        const records = await query(sql, params);
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to get maintenance records' } });
    }
});

// Update Maintenance
app.put('/api/maintenance/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { maintenance_type, description, last_service_date, next_service_date, 
                service_interval_days, cost, service_center, notes, status } = req.body;
        
        await run(
            `UPDATE bus_maintenance SET maintenance_type = ?, description = ?, last_service_date = ?,
              next_service_date = ?, service_interval_days = ?, cost = ?, service_center = ?, notes = ?, 
              status = ?, updated_at = ? WHERE id = ?`,
            [maintenance_type, description, last_service_date, next_service_date, service_interval_days,
             cost, service_center, notes, status, new Date().toISOString(), id]
        );
        
        res.json({ success: true, message: 'Maintenance record updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to update maintenance' } });
    }
});

// Delete Maintenance
app.delete('/api/maintenance/:id', async (req, res) => {
    try {
        await run('DELETE FROM bus_maintenance WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Maintenance record deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to delete maintenance' } });
    }
});

// Get Maintenance Alerts
app.get('/api/maintenance/alerts', async (req, res) => {
    try {
        const alerts = await query(`
            SELECT bm.*, b.bus_number,
                   julianday(bm.next_service_date) - julianday('now') as days_until
            FROM bus_maintenance bm
            JOIN buses b ON bm.bus_id = b.id
            WHERE bm.next_service_date <= date('now', '+7 days')
              AND bm.status != 'completed'
              AND bm.alert_sent = 0
            ORDER BY bm.next_service_date ASC
        `);
        
        res.json({ success: true, data: alerts });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to get maintenance alerts' } });
    }
});

// ==================== ENHANCED DASHBOARD ANALYTICS API ====================

// Get Enhanced Dashboard Stats
app.get('/api/admin/dashboard/analytics', async (req, res) => {
    try {
        // Basic counts
        const { totalStudents } = await get('SELECT COUNT(*) as totalStudents FROM students WHERE status = "active"');
        const { totalBuses } = await get('SELECT COUNT(*) as totalBuses FROM buses');
        const { totalDrivers } = await get('SELECT COUNT(*) as totalDrivers FROM drivers WHERE status = "active"');
        const { totalRoutes } = await get('SELECT COUNT(*) as totalRoutes FROM routes WHERE status = "active"');
        
        // Route occupancy
        const routeOccupancy = await query(`
            SELECT r.route_name, 
                   COUNT(s.id) as student_count,
                   AVG(b.capacity) as avg_capacity,
                   ROUND(COUNT(s.id) * 100.0 / AVG(b.capacity), 1) as occupancy_rate
            FROM routes r
            LEFT JOIN students s ON r.id = s.route_id AND s.status = 'active'
            LEFT JOIN buses b ON b.route_id = r.id
            GROUP BY r.id
            ORDER BY occupancy_rate DESC
        `);
        
        // Payment summary
        const paymentSummary = await query(`
            SELECT 
                SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_collected,
                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
                SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as total_overdue,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
            FROM payments
            WHERE due_date >= date('now', '-30 days')
        `);
        
        // Attendance rate for today
        const today = new Date().toISOString().split('T')[0];
        const { attendanceCount } = await get(
            'SELECT COUNT(*) as attendanceCount FROM attendance_qr WHERE date = ? AND status = "completed"',
            [today]
        );
        const attendanceRate = totalStudents > 0 ? Math.round((attendanceCount / totalStudents) * 100) : 0;
        
        // Active buses today
        const { activeBuses } = await get(
            'SELECT COUNT(DISTINCT bus_id) as activeBuses FROM bus_status_logs WHERE date(started_at) = ? AND ended_at IS NULL',
            [today]
        );
        
        // Recent activity (last 7 days)
        const recentActivity = await query(`
            SELECT DATE(created_at) as date,
                   COUNT(CASE WHEN type = 'student_boarded' THEN 1 END) as boardings,
                   COUNT(CASE WHEN type = 'student_dropped' THEN 1 END) as dropoffs
            FROM attendance_qr
            WHERE created_at >= date('now', '-7 days')
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);
        
        res.json({
            success: true,
            data: {
                counts: { totalStudents, totalBuses, totalDrivers, totalRoutes, activeBuses },
                routeOccupancy,
                paymentSummary: paymentSummary[0],
                attendanceRate,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Dashboard analytics error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to get analytics' } });
    }
});

// ==================== REPORT EXPORT API ====================

// Export Students to CSV/Excel
app.get('/api/reports/export/students', async (req, res) => {
    try {
        const { format = 'csv' } = req.query;
        
        const students = await query(`
            SELECT s.student_id, s.first_name, s.last_name, s.email, s.phone, 
                   s.grade, s.parent_name, s.parent_phone, s.status,
                   b.bus_number, r.route_name
            FROM students s
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            ORDER BY s.first_name, s.last_name
        `);
        
        if (format === 'csv') {
            const csvHeaders = ['Student ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Grade', 
                               'Parent Name', 'Parent Phone', 'Bus Number', 'Route', 'Status'];
            const csvRows = students.map(s => [
                s.student_id, s.first_name, s.last_name, s.email, s.phone, s.grade,
                s.parent_name, s.parent_phone, s.bus_number || 'Not Assigned', 
                s.route_name || 'Not Assigned', s.status
            ].map(v => `"${v || ''}"`).join(','));
            
            const csv = [csvHeaders.join(','), ...csvRows].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="students-report.csv"');
            res.send(csv);
        } else {
            res.json({ success: true, data: students });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to export students' } });
    }
});

// Export Attendance to CSV
app.get('/api/reports/export/attendance', async (req, res) => {
    try {
        const { start_date, end_date, format = 'csv' } = req.query;
        
        let sql = `
            SELECT aq.date, aq.boarding_time, aq.dropoff_time, aq.status,
                   s.first_name, s.last_name, s.student_id,
                   b.bus_number, d.full_name as driver_name,
                   aq.boarding_location, aq.dropoff_location
            FROM attendance_qr aq
            JOIN students s ON aq.student_id = s.id
            JOIN buses b ON aq.bus_id = b.id
            JOIN drivers d ON aq.driver_id = d.id
            WHERE 1=1
        `;
        const params = [];
        
        if (start_date) { sql += ' AND aq.date >= ?'; params.push(start_date); }
        if (end_date) { sql += ' AND aq.date <= ?'; params.push(end_date); }
        
        sql += ' ORDER BY aq.date DESC, aq.boarding_time DESC';
        
        const records = await query(sql, params);
        
        if (format === 'csv') {
            const csvHeaders = ['Date', 'Student ID', 'Student Name', 'Bus Number', 'Driver', 
                               'Boarding Time', 'Dropoff Time', 'Boarding Location', 'Dropoff Location', 'Status'];
            const csvRows = records.map(r => [
                r.date, r.student_id, `${r.first_name} ${r.last_name}`, r.bus_number, r.driver_name,
                r.boarding_time, r.dropoff_time || '-', r.boarding_location || '-', 
                r.dropoff_location || '-', r.status
            ].map(v => `"${v || ''}"`).join(','));
            
            const csv = [csvHeaders.join(','), ...csvRows].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.csv"');
            res.send(csv);
        } else {
            res.json({ success: true, data: records });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to export attendance' } });
    }
});

// Export Payments to CSV
app.get('/api/reports/export/payments', async (req, res) => {
    try {
        const { status, format = 'csv' } = req.query;
        
        let sql = `
            SELECT p.id, s.first_name, s.last_name, s.student_id,
                   p.amount, p.status, p.due_date, p.paid_date, p.payment_method
            FROM payments p
            JOIN students s ON p.student_id = s.id
            WHERE 1=1
        `;
        const params = [];
        
        if (status) { sql += ' AND p.status = ?'; params.push(status); }
        sql += ' ORDER BY p.due_date DESC';
        
        const records = await query(sql, params);
        
        if (format === 'csv') {
            const csvHeaders = ['Payment ID', 'Student ID', 'Student Name', 'Amount', 'Status', 
                               'Due Date', 'Paid Date', 'Payment Method'];
            const csvRows = records.map(r => [
                r.id, r.student_id, `${r.first_name} ${r.last_name}`, r.amount, r.status,
                r.due_date, r.paid_date || '-', r.payment_method || '-'
            ].map(v => `"${v || ''}"`).join(','));
            
            const csv = [csvHeaders.join(','), ...csvRows].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="payments-report.csv"');
            res.send(csv);
        } else {
            res.json({ success: true, data: records });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to export payments' } });
    }
});

// Export Routes to CSV
app.get('/api/reports/export/routes', async (req, res) => {
    try {
        const routes = await query(`
            SELECT r.route_name, r.description, r.distance_km, r.estimated_time,
                   COUNT(s.id) as student_count,
                   COUNT(DISTINCT b.id) as bus_count
            FROM routes r
            LEFT JOIN students s ON r.id = s.route_id AND s.status = 'active'
            LEFT JOIN buses b ON r.id = b.route_id
            GROUP BY r.id
            ORDER BY r.route_name
        `);
        
        const csvHeaders = ['Route Name', 'Description', 'Distance (km)', 'Est. Time (min)', 
                           'Students Count', 'Buses Count'];
        const csvRows = routes.map(r => [
            r.route_name, r.description || '-', r.distance_km || '-', r.estimated_time || '-',
            r.student_count, r.bus_count
        ].map(v => `"${v || ''}"`).join(','));
        
        const csv = [csvHeaders.join(','), ...csvRows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="routes-report.csv"');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to export routes' } });
    }
});

// ==================== ENHANCED PAGINATION & SEARCH API ====================

// Paginated Students with Search
app.get('/api/students/paginated', async (req, res) => {
    try {
        const { search = '', grade = '', bus_id = '', status = 'active', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
        let sql = `
            SELECT s.*, b.bus_number, r.route_name
            FROM students s
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            WHERE s.status = ?
        `;
        const params = [status];
        
        if (search) {
            sql += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_id LIKE ? 
                         OR s.email LIKE ? OR s.parent_name LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }
        if (grade) { sql += ' AND s.grade = ?'; params.push(grade); }
        if (bus_id) { sql += ' AND s.bus_id = ?'; params.push(bus_id); }
        
        // Get total count
        let countSql = sql.replace('SELECT s.*, b.bus_number, r.route_name', 'SELECT COUNT(*) as total');
        const { total } = await get(countSql, params);
        
        // Add pagination
        sql += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const students = await query(sql, params);
        
        res.json({
            success: true,
            data: students,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Failed to get students' } });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: {
            name: 'InternalServerError',
            message: 'Internal server error'
        }
    });
});

const PORT = process.env.PORT || 3006;

// Start server
const startServer = async () => {
    try {
        // Connect to SQLite database
        db = await connectDB();
        console.log('Database connected and tables created');
        
        const server = app.listen(PORT, () => {
            console.log(`Smart School Transport API running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(`Landing Page: http://localhost:${PORT}/`);
            console.log(`Admin Login: http://localhost:${PORT}/admin-login`);
            console.log(`Driver Login: http://localhost:${PORT}/driver-login`);
            console.log(`Parent Login: http://localhost:${PORT}/parent-login`);
            console.log(`Parent Register: http://localhost:${PORT}/parent-register`);
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.log(`Port ${PORT} is in use, trying port ${PORT + 1}...`);
                const fallbackServer = app.listen(PORT + 1, () => {
                    console.log(`Smart School Transport API running on port ${PORT + 1}`);
                    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
                    console.log(`Landing Page: http://localhost:${PORT + 1}/`);
                    console.log(`Admin Login: http://localhost:${PORT + 1}/admin-login`);
                    console.log(`Driver Login: http://localhost:${PORT + 1}/driver-login`);
                    console.log(`Parent Login: http://localhost:${PORT + 1}/parent-login`);
                    console.log(`Parent Register: http://localhost:${PORT + 1}/parent-register`);
                });
                
                fallbackServer.on('error', (fallbackError) => {
                    if (fallbackError.code === 'EADDRINUSE') {
                        console.log(`Port ${PORT + 1} is also in use, trying port ${PORT + 2}...`);
                        const finalServer = app.listen(PORT + 2, () => {
                            console.log(`Smart School Transport API running on port ${PORT + 2}`);
                            console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
                            console.log(`Landing Page: http://localhost:${PORT + 2}/`);
                            console.log(`Admin Login: http://localhost:${PORT + 2}/admin-login`);
                            console.log(`Driver Login: http://localhost:${PORT + 2}/driver-login`);
                            console.log(`Parent Login: http://localhost:${PORT + 2}/parent-login`);
                            console.log(`Parent Register: http://localhost:${PORT + 2}/parent-register`);
                        });
                        
                        finalServer.on('error', (finalError) => {
                            console.error('Could not find an available port. Please check your system.');
                            process.exit(1);
                        });
                    }
                });
            } else {
                console.error('Server error:', error);
                process.exit(1);
            }
        });

        const shutdown = (signal) => {
            console.log(`${signal} received, shutting down gracefully`);
            server.close(() => {
                console.log("Process terminated");
                process.exit(0);
            });
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
