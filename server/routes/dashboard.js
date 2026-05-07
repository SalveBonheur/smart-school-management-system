import express from 'express';
import db from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get main dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        // Total students
        const [studentsCount] = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN s.status = 'inactive' THEN 1 END) as inactive
            FROM students s
        `);

        // Total buses
        const [busesCount] = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN b.status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN b.status = 'maintenance' THEN 1 END) as maintenance
            FROM buses b
        `);

        // Total drivers
        const [driversCount] = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN d.status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN d.status = 'on_leave' THEN 1 END) as on_leave
            FROM drivers d
        `);

        // Total routes
        const [routesCount] = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN r.status = 'active' THEN 1 END) as active
            FROM routes r
        `);

        // Today's attendance
        const today = new Date().toISOString().split('T')[0];
        const [todayAttendance] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN boarding_status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN boarding_status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN boarding_status = 'late' THEN 1 ELSE 0 END) as late
            FROM attendance
            WHERE date = ?
        `, [today]);

        // Monthly income
        const currentMonth = new Date().toISOString().slice(0, 7);
        const [monthlyIncome] = await db.query(`
            SELECT 
                SUM(amount) as total,
                COUNT(*) as payment_count,
                SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid,
                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending
            FROM payments
            WHERE payment_for_month = ?
        `, [currentMonth]);

        // Recent activities
        const [recentStudents] = await db.query(`
            SELECT id, student_id, full_name, created_at 
            FROM students 
            ORDER BY created_at DESC LIMIT 5
        `);

        const [recentPayments] = await db.query(`
            SELECT 
                p.id, p.amount, p.payment_date, p.receipt_number,
                s.student_id, s.full_name
            FROM payments p
            JOIN students s ON p.student_id = s.id
            ORDER BY p.payment_date DESC LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                overview: {
                    students: studentsCount[0],
                    buses: busesCount[0],
                    drivers: driversCount[0],
                    routes: routesCount[0]
                },
                today: {
                    date: today,
                    attendance: todayAttendance[0]
                },
                monthly: {
                    month: currentMonth,
                    income: monthlyIncome[0]
                },
                recent: {
                    students: recentStudents,
                    payments: recentPayments
                }
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get chart data for dashboard
router.get('/charts', authenticateToken, async (req, res) => {
    try {
        const { period = '6months' } = req.query;

        // Monthly income trend
        const [incomeTrend] = await db.query(`
            SELECT 
                payment_for_month as month,
                SUM(amount) as income,
                COUNT(*) as payment_count
            FROM payments
            WHERE payment_for_month >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 6 MONTH), '%Y-%m')
            GROUP BY payment_for_month
            ORDER BY payment_for_month ASC
        `);

        // Attendance trend (last 30 days)
        const [attendanceTrend] = await db.query(`
            SELECT 
                date,
                SUM(CASE WHEN boarding_status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN boarding_status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN boarding_status = 'late' THEN 1 ELSE 0 END) as late
            FROM attendance
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY date
            ORDER BY date ASC
        `);

        // Student distribution by route
        const [routeDistribution] = await db.query(`
            SELECT 
                r.route_name,
                r.route_code,
                COUNT(s.id) as student_count
            FROM routes r
            LEFT JOIN students s ON r.id = s.route_id
            WHERE r.status = 'active'
            GROUP BY r.id
            ORDER BY student_count DESC
        `);

        // Bus occupancy rates
        const [busOccupancy] = await db.query(`
            SELECT 
                b.bus_number,
                b.capacity,
                b.current_occupancy,
                ROUND((b.current_occupancy / b.capacity) * 100, 2) as occupancy_rate
            FROM buses b
            WHERE b.status = 'active' AND b.capacity > 0
            ORDER BY occupancy_rate DESC
        `);

        // Payment status distribution
        const [paymentStatus] = await db.query(`
            SELECT 
                status,
                COUNT(*) as count,
                SUM(amount) as total_amount
            FROM payments
            WHERE payment_for_month = DATE_FORMAT(CURDATE(), '%Y-%m')
            GROUP BY status
        `);

        res.json({
            success: true,
            data: {
                income_trend: incomeTrend,
                attendance_trend: attendanceTrend,
                route_distribution: routeDistribution,
                bus_occupancy: busOccupancy,
                payment_status: paymentStatus
            }
        });

    } catch (error) {
        console.error('Get chart data error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

router.get('/alerts', authenticateToken, async (req, res) => {
    try {
        const alerts = [];

        // Drivers with expiring licenses
        const [expiringLicenses] = await db.query(`
            SELECT 
                d.id,
                d.license_number,
                d.full_name,
                d.license_expiry,
                DATEDIFF(d.license_expiry, CURDATE()) as days_remaining
            FROM drivers d
            WHERE d.license_expiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            AND d.status = 'active'
            ORDER BY d.license_expiry ASC
        `);

        if (expiringLicenses.length > 0) {
            alerts.push({
                type: 'warning',
                title: 'Driver Licenses Expiring',
                message: `${expiringLicenses.length} driver(s) have licenses expiring soon`,
                count: expiringLicenses.length,
                items: expiringLicenses
            });
        }

        // Buses needing maintenance
        const [maintenanceDue] = await db.query(`
            SELECT 
                b.id,
                b.bus_number,
                b.next_maintenance,
                DATEDIFF(b.next_maintenance, CURDATE()) as days_remaining
            FROM buses b
            WHERE b.next_maintenance <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            AND b.status = 'active'
            ORDER BY b.next_maintenance ASC
        `);

        if (maintenanceDue.length > 0) {
            alerts.push({
                type: 'info',
                title: 'Bus Maintenance Due',
                message: `${maintenanceDue.length} bus(es) need maintenance`,
                count: maintenanceDue.length,
                items: maintenanceDue
            });
        }

        // Overdue payments
        const [overduePayments] = await db.query(`
            SELECT 
                COUNT(*) as count,
                SUM(amount) as total_amount
            FROM payments
            WHERE status = 'overdue'
            AND payment_for_month >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '%Y-%m')
        `);

        if (overduePayments[0].count > 0) {
            alerts.push({
                type: 'error',
                title: 'Overdue Payments',
                message: `${overduePayments[0].count} payments are overdue totaling $${overduePayments[0].total_amount}`,
                count: overduePayments[0].count,
                total_amount: overduePayments[0].total_amount
            });
        }

        // Students without route assignment
        const [unassignedStudents] = await db.query(`
            SELECT COUNT(*) as count
            FROM students
            WHERE route_id IS NULL AND status = 'active'
        `);

        if (unassignedStudents[0].count > 0) {
            alerts.push({
                type: 'warning',
                title: 'Unassigned Students',
                message: `${unassignedStudents[0].count} active student(s) without route assignment`,
                count: unassignedStudents[0].count
            });
        }

        // Buses over capacity
        const [overCapacity] = await db.query(`
            SELECT 
                b.bus_number,
                b.capacity,
                b.current_occupancy,
                (b.current_occupancy - b.capacity) as over_by
            FROM buses b
            WHERE b.current_occupancy > b.capacity
        `);

        if (overCapacity.length > 0) {
            alerts.push({
                type: 'error',
                title: 'Overcapacity Buses',
                message: `${overCapacity.length} bus(es) are over capacity`,
                count: overCapacity.length,
                items: overCapacity
            });
        }

        res.json({
            success: true,
            data: alerts
        });

    } catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get quick actions data
router.get('/quick-actions', authenticateToken, async (req, res) => {
    try {
        // Students awaiting assignment
        const [awaitingAssignment] = await db.query(`
            SELECT 
                id,
                student_id,
                full_name,
                parent_phone
            FROM students
            WHERE route_id IS NULL AND status = 'active'
            ORDER BY created_at DESC
            LIMIT 10
        `);

        // Pending payments
        const [pendingPayments] = await db.query(`
            SELECT 
                p.id,
                p.amount,
                p.payment_for_month,
                s.student_id,
                s.full_name,
                s.parent_phone
            FROM payments p
            JOIN students s ON p.student_id = s.id
            WHERE p.status = 'pending'
            ORDER BY p.payment_for_month DESC
            LIMIT 10
        `);

        // Available buses (not assigned to routes)
        const [availableBuses] = await db.query(`
            SELECT 
                id,
                bus_number,
                capacity,
                model
            FROM buses
            WHERE status = 'active' AND id NOT IN (
                SELECT bus_id FROM routes WHERE bus_id IS NOT NULL
            )
        `);

        res.json({
            success: true,
            data: {
                awaiting_assignment: awaitingAssignment,
                pending_payments: pendingPayments,
                available_buses: availableBuses
            }
        });

    } catch (error) {
        console.error('Get quick actions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get System Statistics
router.get('/stats', async (req, res) => {
    try {
        const [studentsCount] = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN s.status = 'inactive' THEN 1 END) as inactive
            FROM students s
        `);

        const [busesCount] = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN b.status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN b.status = 'maintenance' THEN 1 END) as maintenance
            FROM buses b
        `);

        const [driversCount] = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN d.status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN d.status = 'on_leave' THEN 1 END) as on_leave
            FROM drivers d
        `);

        const [routesCount] = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN r.status = 'active' THEN 1 END) as active
            FROM routes r
        `);

        const [monthlyRevenue] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM payments 
            WHERE payment_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            AND status = 'paid'
        `);

        const stats = {
            totalStudents: studentsCount[0]?.total || 0,
            totalDrivers: driversCount[0]?.total || 0,
            totalBuses: busesCount[0]?.total || 0,
            totalRoutes: routesCount[0]?.total || 0,
            monthlyRevenue: monthlyRevenue[0]?.total || 0
        };

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Get system stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;