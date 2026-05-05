-- Fix your database to match application expectations
-- This will update your admin password to work with the system

-- Update admin password to correct hash for 'Bob2010'
UPDATE admins 
SET password = '$2a$12$h/xtxKa7/3rXC4s5Q/Mnp.bmX7ZfIT/ICn8SIEc3kyQUlCJK8J2aK'
WHERE email = 'isalvebonheur@gmail.com';

-- Add missing columns to admins table if needed
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE AFTER id,
ADD COLUMN IF NOT EXISTS role ENUM('super_admin','admin','manager') DEFAULT 'admin' AFTER full_name,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Add missing columns to drivers table if needed
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS license_expiry DATE AFTER profile_photo,
ADD COLUMN IF NOT EXISTS hire_date DATE AFTER license_expiry,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Add missing columns to buses table if needed
ALTER TABLE buses 
ADD COLUMN IF NOT EXISTS model VARCHAR(100) AFTER bus_number,
ADD COLUMN IF NOT EXISTS insurance_expiry DATE AFTER license_plate,
ADD COLUMN IF NOT EXISTS last_maintenance DATE AFTER insurance_expiry,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Add missing columns to routes table if needed
ALTER TABLE routes 
ADD COLUMN IF NOT EXISTS route_code VARCHAR(20) UNIQUE AFTER route_name,
ADD COLUMN IF NOT EXISTS description TEXT AFTER route_code,
ADD COLUMN IF NOT EXISTS estimated_duration TIME AFTER description,
ADD COLUMN IF NOT EXISTS distance_km DECIMAL(8,2) AFTER estimated_duration,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Add missing columns to students table if needed
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS student_id VARCHAR(20) UNIQUE AFTER id,
ADD COLUMN IF NOT EXISTS grade VARCHAR(20) AFTER full_name,
ADD COLUMN IF NOT EXISTS class VARCHAR(20) AFTER grade,
ADD COLUMN IF NOT EXISTS parent_email VARCHAR(100) AFTER parent_phone,
ADD COLUMN IF NOT EXISTS address TEXT AFTER parent_email,
ADD COLUMN IF NOT EXISTS pickup_point VARCHAR(200) AFTER address,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Add missing columns to attendance table if needed
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS pickup_time TIME AFTER date,
ADD COLUMN IF NOT EXISTS dropoff_time TIME AFTER pickup_time,
ADD COLUMN IF NOT EXISTS status ENUM('present','absent','late','excused') DEFAULT 'present' AFTER dropoff_time,
ADD COLUMN IF NOT EXISTS recorded_by INT AFTER status,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Add missing columns to payments table if needed
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_method ENUM('cash','credit_card','bank_transfer','check') DEFAULT 'cash' AFTER amount,
ADD COLUMN IF NOT EXISTS payment_period VARCHAR(50) AFTER payment_method,
ADD COLUMN IF NOT EXISTS description TEXT AFTER payment_period,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_admin_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admin_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_driver_license ON drivers(license_number);
CREATE INDEX IF NOT EXISTS idx_driver_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_bus_plate ON buses(plate_number);
CREATE INDEX IF NOT EXISTS idx_bus_status ON buses(maintenance_status);
CREATE INDEX IF NOT EXISTS idx_route_code ON routes(route_code);
CREATE INDEX IF NOT EXISTS idx_route_status ON routes(status);
CREATE INDEX IF NOT EXISTS idx_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_student_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_payment_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payments(payment_status);

SELECT 'Database structure updated to match application requirements!' as message;
