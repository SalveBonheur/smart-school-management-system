import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SQLite database configuration
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Create database connection
let db;

const connectDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('SQLite database connected successfully');

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');

    // Create tables if they don't exist
    await createTables();

    return db;
  } catch (error) {
    console.error('SQLite database connection failed:', error.message);
    throw error;
  }
};

// Create tables
const createTables = async () => {
  try {
    // Admins table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Drivers table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS drivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        license_number VARCHAR(50),
        address TEXT,
        profile_photo VARCHAR(255),
        hire_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Parents table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS parents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        student_id INTEGER,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    // Students table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        grade VARCHAR(20),
        parent_name VARCHAR(255),
        parent_phone VARCHAR(20),
        bus_id INTEGER,
        route_id INTEGER,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bus_id) REFERENCES buses(id),
        FOREIGN KEY (route_id) REFERENCES routes(id)
      )
    `);

    // Buses table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS buses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bus_number VARCHAR(20) UNIQUE NOT NULL,
        license_plate VARCHAR(20),
        capacity INTEGER DEFAULT 50,
        driver_id INTEGER,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (driver_id) REFERENCES drivers(id)
      )
    `);

    // Routes table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS routes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        route_name VARCHAR(100) NOT NULL,
        description TEXT,
        distance_km DECIMAL(8,2),
        estimated_time INTEGER,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Attendance table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        bus_id INTEGER NOT NULL,
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        status VARCHAR(20) DEFAULT 'present',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (bus_id) REFERENCES buses(id)
      )
    `);

    // Payments table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending',
        due_date DATE,
        paid_date DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    // Driver locations table for GPS tracking
    await db.exec(`
      CREATE TABLE IF NOT EXISTS driver_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        driver_id INTEGER NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        timestamp DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (driver_id) REFERENCES drivers(id)
      )
    `);

    // QR Codes table for student attendance
    await db.exec(`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        qr_code_data TEXT NOT NULL,
        qr_code_image TEXT,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    // Enhanced attendance table with QR support
    await db.exec(`
      CREATE TABLE IF NOT EXISTS attendance_qr (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        bus_id INTEGER NOT NULL,
        driver_id INTEGER NOT NULL,
        qr_code_id INTEGER,
        date DATE NOT NULL,
        boarding_time TIME,
        dropoff_time TIME,
        boarding_location TEXT,
        dropoff_location TEXT,
        status VARCHAR(20) DEFAULT 'boarded',
        scanned_by VARCHAR(50),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (bus_id) REFERENCES buses(id),
        FOREIGN KEY (driver_id) REFERENCES drivers(id),
        FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id)
      )
    `);

    // Notifications table for all users
    await db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        user_role VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        priority VARCHAR(20) DEFAULT 'normal',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        related_id INTEGER,
        related_type VARCHAR(50),
        is_read BOOLEAN DEFAULT 0,
        read_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Bus maintenance table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS bus_maintenance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bus_id INTEGER NOT NULL,
        maintenance_type VARCHAR(50) NOT NULL,
        description TEXT,
        last_service_date DATE,
        next_service_date DATE,
        service_interval_days INTEGER,
        cost DECIMAL(10,2),
        service_center VARCHAR(255),
        notes TEXT,
        status VARCHAR(20) DEFAULT 'scheduled',
        alert_sent BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bus_id) REFERENCES buses(id)
      )
    `);

    // Bus status tracking table - Enhanced for live tracking
    await db.exec(`
      CREATE TABLE IF NOT EXISTS bus_status_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bus_id INTEGER NOT NULL,
        driver_id INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL CHECK(status IN ('active', 'on_route', 'delayed', 'arrived', 'maintenance', 'parked')),
        location TEXT,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        estimated_arrival TIME,
        delay_minutes INTEGER DEFAULT 0,
        reason TEXT,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bus_id) REFERENCES buses(id),
        FOREIGN KEY (driver_id) REFERENCES drivers(id)
      )
    `);

    // Current bus status view (latest status for each bus)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS bus_current_status (
        bus_id INTEGER PRIMARY KEY,
        driver_id INTEGER,
        status VARCHAR(20) DEFAULT 'parked',
        location TEXT,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        estimated_arrival TIME,
        delay_minutes INTEGER DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bus_id) REFERENCES buses(id),
        FOREIGN KEY (driver_id) REFERENCES drivers(id)
      )
    `);

    // Add indexes for performance
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_notifications_parent ON notifications(parent_id)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_qr_codes_student ON qr_codes(student_id)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_bus_status_bus ON bus_status_logs(bus_id)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_maintenance_bus ON bus_maintenance(bus_id)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_students_bus ON students(bus_id)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_students_route ON students(route_id)`);

    // Create default admin if none exists
    const bcryptModule = await import('bcryptjs');
    const bcrypt = bcryptModule.default || bcryptModule;
    const [admins] = await db.all('SELECT COUNT(*) as count FROM admins');
    if (admins.count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.run(
        `INSERT INTO admins (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)`,
        ['admin', 'admin@smarttransport.com', hashedPassword, 'System Administrator', 'super_admin']
      );
      console.log('✅ Default admin created: admin@smarttransport.com / admin123');
    }

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error.message);
    throw error;
  }
};

// Database helper functions - MySQL-compatible wrapper
const query = async (sql, params = []) => {
  const rows = await db.all(sql, params);
  // Return array format compatible with MySQL [rows] destructuring
  return [rows];
};

const run = async (sql, params = []) => {
  const result = await db.run(sql, params);
  return { lastID: result.lastID, changes: result.changes };
};

const get = async (sql, params = []) => {
  return await db.get(sql, params);
};

export {
  connectDB,
  query,
  run,
  get,
  db
};

export default {
  query,
  run,
  get
};