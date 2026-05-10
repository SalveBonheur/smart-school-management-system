import db from '../config/db.js';

/**
 * Notification Service - Automatically generates notifications based on system events
 */

// Create a notification
export const createNotification = async ({
    userId = null,
    userRole,
    type = 'general',
    category = 'general',
    priority = 'normal',
    title,
    message,
    relatedId = null,
    relatedType = null
}) => {
    try {
        const result = await db.run(`
            INSERT INTO notifications (user_id, user_role, type, category, priority, title, message, related_id, related_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            userId,
            userRole,
            type,
            category,
            priority,
            title,
            message,
            relatedId,
            relatedType
        ]);

        console.log(`✅ Notification created: ${title} for ${userRole}`);
        return { success: true, id: result.lastID };
    } catch (error) {
        console.error('Create notification error:', error);
        return { success: false, error: error.message };
    }
};

// ==================== ADMIN NOTIFICATIONS ====================

// Notify admin about unpaid fees
export const notifyUnpaidFees = async (studentId, studentName, amount) => {
    return await createNotification({
        userRole: 'admin',
        type: 'payment',
        category: 'financial',
        priority: 'high',
        title: 'Unpaid Transport Fee',
        message: `Student ${studentName} has an unpaid balance of ${amount} for transport fees.`,
        relatedId: studentId,
        relatedType: 'student'
    });
};

// Notify admin about pending driver approval
export const notifyPendingDriver = async (driverId, driverName) => {
    return await createNotification({
        userRole: 'admin',
        type: 'driver',
        category: 'approval',
        priority: 'normal',
        title: 'New Driver Pending Approval',
        message: `Driver ${driverName} has registered and is awaiting approval.`,
        relatedId: driverId,
        relatedType: 'driver'
    });
};

// Notify admin about bus maintenance due
export const notifyMaintenanceDue = async (busId, busNumber, daysUntil) => {
    return await createNotification({
        userRole: 'admin',
        type: 'maintenance',
        category: 'operational',
        priority: daysUntil <= 3 ? 'high' : 'normal',
        title: 'Bus Maintenance Due',
        message: `Bus ${busNumber} maintenance is due in ${daysUntil} days.`,
        relatedId: busId,
        relatedType: 'bus'
    });
};

// Notify admin about attendance issues
export const notifyAttendanceIssue = async (studentId, studentName, issue) => {
    return await createNotification({
        userRole: 'admin',
        type: 'attendance',
        category: 'operational',
        priority: 'high',
        title: 'Attendance Alert',
        message: `Student ${studentName} - ${issue}`,
        relatedId: studentId,
        relatedType: 'student'
    });
};

// Notify admin about low bus occupancy
export const notifyLowOccupancy = async (busId, busNumber, occupancy, capacity) => {
    const percentage = Math.round((occupancy / capacity) * 100);
    return await createNotification({
        userRole: 'admin',
        type: 'occupancy',
        category: 'operational',
        priority: percentage < 30 ? 'normal' : 'low',
        title: 'Low Bus Occupancy',
        message: `Bus ${busNumber} has low occupancy: ${occupancy}/${capacity} (${percentage}%)`,
        relatedId: busId,
        relatedType: 'bus'
    });
};

// ==================== DRIVER NOTIFICATIONS ====================

// Notify driver about route assignment
export const notifyDriverRouteAssigned = async (driverId, driverName, routeName) => {
    return await createNotification({
        userId: driverId,
        userRole: 'driver',
        type: 'route',
        category: 'assignment',
        priority: 'normal',
        title: 'New Route Assigned',
        message: `You have been assigned to route: ${routeName}`,
        relatedId: driverId,
        relatedType: 'driver'
    });
};

// Notify driver about schedule reminder
export const notifyDriverScheduleReminder = async (driverId, tripType, time) => {
    return await createNotification({
        userId: driverId,
        userRole: 'driver',
        type: 'schedule',
        category: 'reminder',
        priority: 'normal',
        title: 'Trip Reminder',
        message: `Reminder: Your ${tripType} trip starts at ${time}`,
        relatedId: driverId,
        relatedType: 'driver'
    });
};

// Notify driver about attendance reminder
export const notifyDriverAttendanceReminder = async (driverId) => {
    return await createNotification({
        userId: driverId,
        userRole: 'driver',
        type: 'attendance',
        category: 'reminder',
        priority: 'high',
        title: 'Attendance Check Required',
        message: 'Please mark student attendance for your current trip.',
        relatedId: driverId,
        relatedType: 'driver'
    });
};

// Notify driver about route changes
export const notifyDriverRouteChange = async (driverId, oldRoute, newRoute) => {
    return await createNotification({
        userId: driverId,
        userRole: 'driver',
        type: 'route',
        category: 'change',
        priority: 'high',
        title: 'Route Change Alert',
        message: `Your route has been changed from "${oldRoute}" to "${newRoute}"`,
        relatedId: driverId,
        relatedType: 'driver'
    });
};

// ==================== PARENT NOTIFICATIONS ====================

// Notify parent when student boards bus
export const notifyStudentBoarded = async (parentId, studentName, time, location) => {
    return await createNotification({
        userId: parentId,
        userRole: 'parent',
        type: 'attendance',
        category: 'boarding',
        priority: 'normal',
        title: 'Student Boarded Bus',
        message: `${studentName} boarded the bus at ${time}${location ? ` (${location})` : ''}.`,
        relatedId: parentId,
        relatedType: 'parent'
    });
};

// Notify parent when student dropped at school
export const notifyStudentDropped = async (parentId, studentName, time, location) => {
    return await createNotification({
        userId: parentId,
        userRole: 'parent',
        type: 'attendance',
        category: 'dropoff',
        priority: 'normal',
        title: 'Student Arrived at School',
        message: `${studentName} was dropped at school at ${time}${location ? ` (${location})` : ''}.`,
        relatedId: parentId,
        relatedType: 'parent'
    });
};

// Notify parent when student is absent
export const notifyStudentAbsent = async (parentId, studentName, date) => {
    return await createNotification({
        userId: parentId,
        userRole: 'parent',
        type: 'attendance',
        category: 'absence',
        priority: 'high',
        title: 'Student Absent Alert',
        message: `${studentName} was marked absent on ${date}. Please contact the school if this is unexpected.`,
        relatedId: parentId,
        relatedType: 'parent'
    });
};

// Notify parent about payment reminder
export const notifyPaymentReminder = async (parentId, parentName, amount, dueDate) => {
    return await createNotification({
        userId: parentId,
        userRole: 'parent',
        type: 'payment',
        category: 'reminder',
        priority: 'high',
        title: 'Payment Reminder',
        message: `Dear ${parentName}, your transport fee of ${amount} is due on ${dueDate}. Please make payment to avoid service interruption.`,
        relatedId: parentId,
        relatedType: 'parent'
    });
};

// Notify parent about transport delays
export const notifyTransportDelay = async (parentId, studentName, delayMinutes, reason) => {
    return await createNotification({
        userId: parentId,
        userRole: 'parent',
        type: 'delay',
        category: 'operational',
        priority: delayMinutes > 15 ? 'high' : 'normal',
        title: 'Transport Delay Alert',
        message: `The bus for ${studentName} is delayed by approximately ${delayMinutes} minutes${reason ? ` due to ${reason}` : ''}.`,
        relatedId: parentId,
        relatedType: 'parent'
    });
};

// Notify parent about driver approval
export const notifyDriverApproved = async (driverId, driverName) => {
    return await createNotification({
        userId: driverId,
        userRole: 'driver',
        type: 'approval',
        category: 'account',
        priority: 'high',
        title: 'Account Approved!',
        message: `Congratulations ${driverName}! Your driver account has been approved. You can now start accepting trips.`,
        relatedId: driverId,
        relatedType: 'driver'
    });
};

// Notify parent about successful payment
export const notifyPaymentSuccess = async (parentId, parentName, amount, receiptNumber) => {
    return await createNotification({
        userId: parentId,
        userRole: 'parent',
        type: 'payment',
        category: 'confirmation',
        priority: 'normal',
        title: 'Payment Received',
        message: `Thank you ${parentName}! Your payment of ${amount} has been received${receiptNumber ? ` (Receipt: ${receiptNumber})` : ''}.`,
        relatedId: parentId,
        relatedType: 'parent'
    });
};

export default {
    createNotification,
    notifyUnpaidFees,
    notifyPendingDriver,
    notifyMaintenanceDue,
    notifyAttendanceIssue,
    notifyLowOccupancy,
    notifyDriverRouteAssigned,
    notifyDriverScheduleReminder,
    notifyDriverAttendanceReminder,
    notifyDriverRouteChange,
    notifyStudentBoarded,
    notifyStudentDropped,
    notifyStudentAbsent,
    notifyPaymentReminder,
    notifyTransportDelay,
    notifyDriverApproved,
    notifyPaymentSuccess
};
