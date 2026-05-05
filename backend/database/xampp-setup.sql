-- Smart School Transport System Database Setup for XAMPP
-- Run this script in phpMyAdmin or MySQL command line

-- Create database
CREATE DATABASE IF NOT EXISTS school_transport;
USE school_transport;

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('super_admin','admin','manager') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    address TEXT,
    status ENUM('active','inactive','on_leave','pending','approved','rejected') DEFAULT 'pending',
    profile_photo VARCHAR(255),
    license_expiry DATE,
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_license (license_number),
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Create buses table
CREATE TABLE IF NOT EXISTS buses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(100),
    capacity INT NOT NULL DEFAULT 0,
    driver_id INT,
    license_plate VARCHAR(20) UNIQUE,
    insurance_expiry DATE,
    last_maintenance DATE,
    status ENUM('active','inactive','maintenance') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
    INDEX idx_bus_number (bus_number),
    INDEX idx_status (status),
    INDEX idx_driver (driver_id)
);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    route_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    estimated_duration TIME,
    distance_km DECIMAL(8,2),
    bus_id INT,
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE SET NULL,
    INDEX idx_route_code (route_code),
    INDEX idx_status (status),
    INDEX idx_bus (bus_id)
);

-- Create route_stops table
CREATE TABLE IF NOT EXISTS route_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    stop_name VARCHAR(100) NOT NULL,
    stop_order INT NOT NULL,
    pickup_time TIME,
    coordinates VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_route (route_id),
    INDEX idx_order (stop_order)
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    grade VARCHAR(20),
    class VARCHAR(20),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(100),
    address TEXT,
    pickup_point VARCHAR(200),
    route_id INT,
    bus_id INT,
    status ENUM('active','inactive','graduated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_route (route_id),
    INDEX idx_status (status)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    pickup_time TIME,
    dropoff_time TIME,
    status ENUM('present','absent','late','excused') DEFAULT 'present',
    notes TEXT,
    recorded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES drivers(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (student_id, date),
    INDEX idx_student (student_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('cash','credit_card','bank_transfer','check') DEFAULT 'cash',
    status ENUM('paid','pending','overdue','cancelled') DEFAULT 'pending',
    payment_period VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_date (payment_date),
    INDEX idx_status (status)
);

-- Insert default admin user (password: Bob2010 - hashed)
INSERT IGNORE INTO admins (id, username, password, email, full_name, role) 
VALUES (1, 'admin', '$2a$12$h/xtxKa7/3rXC4s5Q/Mnp.bmX7ZfIT/ICn8SIEc3kyQUlCJK8J2aK', 'isalvebonheur@gmail.com', 'super_admin');

-- Insert sample data for testing
INSERT IGNORE INTO drivers (id, license_number, full_name, phone, email, license_expiry, hire_date) 
VALUES 
(1, 'DL-001', 'John Smith', '+1234567890', 'john.smith@email.com', '2025-12-31', '2023-01-15'),
(2, 'DL-002', 'Sarah Johnson', '+1234567891', 'sarah.j@email.com', '2024-06-30', '2023-02-01'),
(3, 'DL-003', 'Mike Wilson', '+1234567892', 'mike.w@email.com', '2025-08-15', '2023-03-01');

INSERT IGNORE INTO buses (id, bus_number, model, capacity, license_plate, insurance_expiry, last_maintenance) 
VALUES 
(1, 'BUS-01', 'Mercedes Sprinter', 30, 'ABC-123', '2024-12-31', '2023-11-01'),
(2, 'BUS-02', 'Ford Transit', 25, 'DEF-456', '2024-10-31', '2023-10-15'),
(3, 'BUS-03', 'Iveco Daily', 35, 'GHI-789', '2025-01-31', '2023-12-01');

INSERT IGNORE INTO routes (id, route_name, route_code, description, estimated_duration, distance_km, bus_id) 
VALUES 
(1, 'North Route', 'NR-001', 'Covers North residential areas', '00:45:00', 25.50, 1),
(2, 'South Route', 'SR-001', 'Covers South residential areas', '00:40:00', 20.30, 2),
(3, 'East Route', 'ER-001', 'Covers East residential areas', '00:50:00', 30.20, 3);

INSERT IGNORE INTO students (id, student_id, full_name, grade, class, parent_name, parent_phone, parent_email, route_id, bus_id) 
VALUES 
(1, 'STU-001', 'Alice Brown', '10', '10A', 'Robert Brown', '+1234567890', 'robert.b@email.com', 1, 1),
(2, 'STU-002', 'Bob Davis', '9', '9B', 'Mary Davis', '+1234567891', 'mary.d@email.com', 1, 1),
(3, 'STU-003', 'Charlie Miller', '11', '11C', 'Tom Miller', '+1234567892', 'tom.m@email.com', 2, 2),
(4, 'STU-004', 'Diana Wilson', '8', '8A', 'James Wilson', '+1234567893', 'james.w@email.com', 2, 2),
(5, 'STU-005', 'Eva Taylor', '10', '10B', 'David Taylor', '+1234567894', 'david.t@email.com', 3, 3);

-- Update drivers to active status
UPDATE drivers SET status = 'active' WHERE id IN (1, 2, 3);

-- Assign drivers to buses
UPDATE buses SET driver_id = 1 WHERE id = 1;
UPDATE buses SET driver_id = 2 WHERE id = 2;
UPDATE buses SET driver_id = 3 WHERE id = 3;

SELECT 'Database setup completed successfully!' as message;
