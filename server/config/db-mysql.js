import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// MySQL configuration for Railway
const mysqlConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_school_transport',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
};

// Create database connection
let db;

const connectDB = async () => {
  try {
    db = await mysql.createConnection(mysqlConfig);
    console.log('MySQL database connected successfully');
    
    // Test connection
    await db.execute('SELECT 1');
    
    // Create tables if they don't exist
    await createTables();
    
    return db;
  } catch (error) {
    console.error('MySQL database connection failed:', error.message);
    throw error;
  }
};

// Create MySQL tables
const createTables = async () => {
  try {
    // Admins table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Drivers table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS drivers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        license_number VARCHAR(100) UNIQUE NOT NULL,
        address TEXT,
        password VARCHAR(255) NOT NULL,
        status ENUM('pending', 'approved', 'active', 'inactive', 'on_leave') DEFAULT 'pending',
        profile_photo VARCHAR(255),
        hire_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Parents table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS parents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        password VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Students table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        grade VARCHAR(50),
        parent_id INT,
        bus_id INT,
        route_id INT,
        address TEXT,
        phone VARCHAR(20),
        status ENUM('active', 'inactive', 'graduated') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES parents(id),
        FOREIGN KEY (bus_id) REFERENCES buses(id),
        FOREIGN KEY (route_id) REFERENCES routes(id)
      )
    `);

    // Buses table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS buses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bus_number VARCHAR(50) UNIQUE NOT NULL,
        registration_number VARCHAR(100) UNIQUE NOT NULL,
        capacity INT NOT NULL,
        model VARCHAR(100),
        year INT,
        driver_id INT,
        status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (driver_id) REFERENCES drivers(id)
      )
    `);

    // Routes table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS routes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        route_name VARCHAR(255) NOT NULL,
        route_code VARCHAR(50) UNIQUE NOT NULL,
        start_point VARCHAR(255) NOT NULL,
        end_point VARCHAR(255) NOT NULL,
        estimated_duration INT,
        distance DECIMAL(10,2),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Attendance table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        date DATE NOT NULL,
        boarding_status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'absent',
        dropoff_status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'absent',
        boarding_time TIME,
        dropoff_time TIME,
        recorded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (recorded_by) REFERENCES drivers(id),
        UNIQUE KEY unique_student_date (student_id, date)
      )
    `);

    // Payments table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_type ENUM('monthly', 'quarterly', 'yearly') NOT NULL,
        payment_for_month VARCHAR(7),
        payment_date DATE,
        status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
        payment_method VARCHAR(100),
        receipt_number VARCHAR(100) UNIQUE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    // Create default admin if none exists
    const [admins] = await db.execute('SELECT COUNT(*) as count FROM admins');
    if (admins[0].count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.execute(
        `INSERT INTO admins (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)`,
        ['admin', 'admin@smarttransport.com', hashedPassword, 'System Administrator', 'super_admin']
      );
      console.log('✅ Default admin created: admin@smarttransport.com / admin123');
    }

    console.log('MySQL tables created successfully');
  } catch (error) {
    console.error('Error creating MySQL tables:', error.message);
    throw error;
  }
};

// Query function
const query = async (sql, params = []) => {
  try {
    const [rows] = await db.execute(sql, params);
    return [rows]; // Return as array for compatibility with existing code
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
};

// Run function for INSERT/UPDATE/DELETE
const run = async (sql, params = []) => {
  try {
    const [result] = await db.execute(sql, params);
    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows,
      lastID: result.insertId
    };
  } catch (error) {
    console.error('Run error:', error.message);
    throw error;
  }
};

// Get single row
const get = async (sql, params = []) => {
  try {
    const [rows] = await db.execute(sql, params);
    return rows[0] || null;
  } catch (error) {
    console.error('Get error:', error.message);
    throw error;
  }
};

// Close database connection
const closeDB = async () => {
  try {
    await db.end();
    console.log('MySQL database connection closed');
  } catch (error) {
    console.error('Error closing database:', error.message);
  }
};

export { connectDB, query, run, get, closeDB };
