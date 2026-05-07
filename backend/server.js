import express from 'express';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Import database
import { connectDB } from './config/db.js';

// Import modular routers
import authRouter from './routes/auth.js';
import authNewRouter from './routes/auth-new.js';
import studentRouter from './routes/student.js';
import driverRouter from './routes/driver.js';
import busRouter from './routes/bus.js';
import routeRouter from './routes/route.js';
import attendanceRouter from './routes/attendance.js';
import paymentRouter from './routes/payment.js';
import dashboardRouter from './routes/dashboard.js';

// Define __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();

// Security middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: { message: 'Too many requests from this IP, please try again later.' } }
});
app.use('/api/', limiter);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS - Allow React dev server and production domains
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3006', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));

app.set('trust proxy', 1);

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend/public'), {
    maxAge: '1d',
    etag: false
}));

// Basic HTML routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/public", "landing.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "../frontend/public", "login.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "../frontend/public", "register.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "../frontend/public", "admin-dashboard.html")));
app.get("/driver-dashboard", (req, res) => res.sendFile(path.join(__dirname, "../frontend/public", "driver-dashboard.html")));
app.get("/parent-dashboard", (req, res) => res.sendFile(path.join(__dirname, "../frontend/public", "parent-dashboard.html")));

// Mount modular API routers
app.use('/api/auth', authRouter);
app.use('/api/auth-new', authNewRouter);
app.use('/api/students', studentRouter);
app.use('/api/drivers', driverRouter);
app.use('/api/buses', busRouter);
app.use('/api/routes', routeRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/dashboard', dashboardRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
});

const DEFAULT_PORT = process.env.PORT || 3006;
const MAX_PORT_ATTEMPTS = 10;

// Start server with port fallback
const startServer = async (port = DEFAULT_PORT, attempt = 1) => {
    try {
        await connectDB();
        console.log('Database connected and tables created');
        
        const server = app.listen(port, () => {
            console.log(`✅ Smart School Transport API running on port ${port}`);
            console.log(`🌐 Landing Page: http://localhost:${port}/`);
            console.log(`🔐 Login Portal: http://localhost:${port}/login`);
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                if (attempt < MAX_PORT_ATTEMPTS) {
                    const newPort = parseInt(port) + 1;
                    console.log(`⚠️ Port ${port} is busy, trying port ${newPort}...`);
                    startServer(newPort, attempt + 1);
                } else {
                    console.error(`❌ Failed to find available port after ${MAX_PORT_ATTEMPTS} attempts`);
                    process.exit(1);
                }
            } else {
                console.error('❌ Server error:', error);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
