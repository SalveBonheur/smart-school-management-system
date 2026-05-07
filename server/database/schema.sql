-- Smart School Transport Management System Database Schema
-- This file contains all table definitions for the system

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS school_transport;
USE school_transport;

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'admin', 'staff') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    license_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address TEXT,
    license_expiry DATE NOT NULL,
    status ENUM('pending', 'approved', 'active', 'inactive', 'on_leave') DEFAULT 'pending',
    hire_date DATE NOT NULL,
    profile_photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_license (license_number),
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Buses Table
CREATE TABLE IF NOT EXISTS buses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bus_number VARCHAR(10) UNIQUE NOT NULL,
    registration_number VARCHAR(20) UNIQUE NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    current_occupancy INT DEFAULT 0,
    model VARCHAR(50),
    year INT,
    status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
    driver_id INT,
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
    INDEX idx_bus_number (bus_number),
    INDEX idx_status (status)
);

-- Routes Table
CREATE TABLE IF NOT EXISTS routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    route_name VARCHAR(50) NOT NULL,
    route_code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    total_distance DECIMAL(8,2) DEFAULT 0.00,
    estimated_duration INT DEFAULT 0, -- in minutes
    bus_id INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE SET NULL,
    INDEX idx_route_code (route_code),
    INDEX idx_status (status)
);

-- Route Stops Table (for detailed route information)
CREATE TABLE IF NOT EXISTS route_stops (
    id INT PRIMARY KEY AUTO_INCREMENT,
    route_id INT NOT NULL,
    stop_name VARCHAR(100) NOT NULL,
    stop_order INT NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_route_order (route_id, stop_order)
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    grade VARCHAR(10),
    section VARCHAR(5),
    parent_name VARCHAR(100) NOT NULL,
    parent_phone VARCHAR(15) NOT NULL,
    parent_email VARCHAR(100),
    address TEXT,
    emergency_contact VARCHAR(15),
    route_id INT,
    pickup_location VARCHAR(100),
    dropoff_location VARCHAR(100),
    bus_id INT,
    transport_fee DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('active', 'inactive', 'graduated', 'transferred') DEFAULT 'active',
    admission_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    INDEX idx_route (route_id)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    boarding_status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
    dropoff_status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
    boarding_time TIME,
    dropoff_time TIME,
    notes TEXT,
    recorded_by INT, -- admin user ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES admins(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (student_id, date),
    INDEX idx_date (date),
    INDEX idx_student_date (student_id, date)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'online') DEFAULT 'cash',
    payment_for_month VARCHAR(7) NOT NULL, -- format: YYYY-MM
    transaction_id VARCHAR(50),
    receipt_number VARCHAR(20) UNIQUE,
    status ENUM('paid', 'pending', 'overdue', 'partial') DEFAULT 'paid',
    notes TEXT,
    recorded_by INT, -- admin user ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_student (student_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_status (status),
    INDEX idx_payment_month (payment_for_month)
);

-- Bus Maintenance Records Table
CREATE TABLE IF NOT EXISTS bus_maintenance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bus_id INT NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2) DEFAULT 0.00,
    maintenance_date DATE NOT NULL,
    next_due_date DATE,
    mechanic_name VARCHAR(100),
    status ENUM('completed', 'in_progress', 'scheduled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    INDEX idx_bus (bus_id),
    INDEX idx_status (status)
);

-- Insert default admin user (password: admin123 - hashed)
INSERT IGNORE INTO admins (id, username, password, email, full_name, role) 
VALUES (1, 'admin', '$2a$10$YourHashedPasswordHere', 'admin@school.edu', 'System Administrator', 'super_admin');

-- Insert sample data for testing
INSERT IGNORE INTO drivers (id, license_number, full_name, phone, email, license_expiry, hire_date) 
VALUES 
(1, 'DL-123456', 'John Smith', '555-0101', 'john@email.com', '2025-12-31', '2023-01-15'),
(2, 'DL-789012', 'Sarah Johnson', '555-0102', 'sarah@email.com', '2025-11-30', '2023-03-20');

INSERT IGNORE INTO buses (id, bus_number, registration_number, capacity, model, year, status, driver_id) 
VALUES 
(1, 'BUS-01', 'ABC-1234', 40, 'Mercedes Sprinter', 2022, 'active', 1),
(2, 'BUS-02', 'XYZ-5678', 35, 'Ford Transit', 2021, 'active', 2),
(3, 'BUS-03', 'DEF-9012', 45, 'Chevrolet Express', 2023, 'maintenance', NULL);

INSERT IGNORE INTO routes (id, route_name, route_code, description, total_distance, estimated_duration, bus_id) 
VALUES 
(1, 'North Route', 'NR-01', 'Covers northern residential areas', 25.5, 45, 1),
(2, 'South Route', 'SR-01', 'Covers southern residential areas', 30.2, 55, 2),
(3, 'East Route', 'ER-01', 'Covers eastern residential areas', 20.8, 40, NULL);