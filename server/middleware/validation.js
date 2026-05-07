// Validation middleware for different entities

// Student validation
const validateStudent = (req, res, next) => {
    const { student_id, full_name, parent_name, parent_phone, grade, route_id, bus_id } = req.body;
    const errors = [];

    if (!student_id || student_id.trim() === '') {
        errors.push('Student ID is required');
    }

    if (!full_name || full_name.trim() === '') {
        errors.push('Student full name is required');
    }

    if (!parent_name || parent_name.trim() === '') {
        errors.push('Parent/Guardian name is required');
    }

    if (!parent_phone || parent_phone.trim() === '') {
        errors.push('Parent/Guardian phone is required');
    } else if (!/^\d{10,15}$/.test(parent_phone.replace(/[-\s]/g, ''))) {
        errors.push('Invalid phone number format');
    }

    if (grade && !/^[A-Za-z0-9\s-]{1,10}$/.test(grade)) {
        errors.push('Invalid grade format');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Bus validation
const validateBus = (req, res, next) => {
    const { bus_number, registration_number, capacity, model, year } = req.body;
    const errors = [];

    if (!bus_number || bus_number.trim() === '') {
        errors.push('Bus number is required');
    }

    if (!registration_number || registration_number.trim() === '') {
        errors.push('Registration number is required');
    }

    if (!capacity || isNaN(capacity) || parseInt(capacity) <= 0) {
        errors.push('Valid capacity is required');
    }

    if (year && (isNaN(year) || parseInt(year) < 1990 || parseInt(year) > new Date().getFullYear() + 1)) {
        errors.push('Invalid year');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Driver validation
const validateDriver = (req, res, next) => {
    const { license_number, full_name, phone, license_expiry, hire_date } = req.body;
    const errors = [];

    if (!license_number || license_number.trim() === '') {
        errors.push('License number is required');
    }

    if (!full_name || full_name.trim() === '') {
        errors.push('Driver full name is required');
    }

    if (!phone || phone.trim() === '') {
        errors.push('Phone number is required');
    } else if (!/^\d{10,15}$/.test(phone.replace(/[-\s]/g, ''))) {
        errors.push('Invalid phone number format');
    }

    if (!license_expiry) {
        errors.push('License expiry date is required');
    } else if (new Date(license_expiry) < new Date()) {
        errors.push('License has already expired');
    }

    if (!hire_date) {
        errors.push('Hire date is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Route validation
const validateRoute = (req, res, next) => {
    const { route_name, route_code, total_distance, estimated_duration } = req.body;
    const errors = [];

    if (!route_name || route_name.trim() === '') {
        errors.push('Route name is required');
    }

    if (!route_code || route_code.trim() === '') {
        errors.push('Route code is required');
    } else if (!/^[A-Z]{2}-\d{2}$/.test(route_code)) {
        errors.push('Route code must be in format: XX-00 (e.g., NR-01)');
    }

    if (total_distance && (isNaN(total_distance) || parseFloat(total_distance) < 0)) {
        errors.push('Invalid distance value');
    }

    if (estimated_duration && (isNaN(estimated_duration) || parseInt(estimated_duration) < 0)) {
        errors.push('Invalid duration value');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Attendance validation
const validateAttendance = (req, res, next) => {
    const { student_id, date, boarding_status, dropoff_status } = req.body;
    const errors = [];

    if (!student_id || isNaN(student_id)) {
        errors.push('Valid Student ID is required');
    }

    if (!date) {
        errors.push('Date is required');
    } else {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            errors.push('Invalid date format. Use YYYY-MM-DD format');
        }
    }

    if (boarding_status && !['present', 'absent', 'late', 'excused'].includes(boarding_status)) {
        errors.push('Invalid boarding status. Must be: present, absent, late, or excused');
    }

    if (dropoff_status && !['present', 'absent', 'late', 'excused'].includes(dropoff_status)) {
        errors.push('Invalid dropoff status. Must be: present, absent, late, or excused');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Payment validation
const validatePayment = (req, res, next) => {
    const { student_id, amount, payment_date, payment_for_month, payment_method } = req.body;
    const errors = [];

    if (!student_id) {
        errors.push('Student ID is required');
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        errors.push('Valid payment amount is required');
    }

    if (!payment_date) {
        errors.push('Payment date is required');
    } else if (isNaN(Date.parse(payment_date))) {
        errors.push('Invalid date format');
    }

    if (!payment_for_month) {
        errors.push('Payment month is required');
    } else if (!/^\d{4}-\d{2}$/.test(payment_for_month)) {
        errors.push('Payment month must be in YYYY-MM format');
    }

    if (payment_method && !['cash', 'card', 'bank_transfer', 'online'].includes(payment_method)) {
        errors.push('Invalid payment method');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Admin registration validation
const validateAdminRegistration = (req, res, next) => {
    const { username, password, email, full_name, role } = req.body;
    const errors = [];

    if (!username || username.trim().length < 3) {
        errors.push('Username must be at least 3 characters');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Valid email is required');
    }

    if (!full_name || full_name.trim() === '') {
        errors.push('Full name is required');
    }

    if (role && !['super_admin', 'admin', 'staff'].includes(role)) {
        errors.push('Invalid role');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

export {
    validateStudent,
    validateBus,
    validateDriver,
    validateRoute,
    validateAttendance,
    validatePayment,
    validateAdminRegistration
};