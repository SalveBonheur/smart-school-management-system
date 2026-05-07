import express from 'express';
import db from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validatePayment } from '../middleware/validation.js';

const router = express.Router();

// Generate receipt number
const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP-${year}${month}-${random}`;
};

// Get all payments with filtering and pagination
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { 
            student_id, 
            status, 
            payment_method, 
            payment_for_month,
            start_date, 
            end_date,
            page = 1, 
            limit = 20 
        } = req.query;

        let query = `
            SELECT 
                p.*,
                s.student_id,
                s.full_name,
                s.grade,
                s.section,
                s.parent_phone,
                b.bus_number,
                r.route_name,
                a.username as recorded_by_username
            FROM payments p
            JOIN students s ON p.student_id = s.id
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            LEFT JOIN admins a ON p.recorded_by = a.id
            WHERE 1=1
        `;

        let countQuery = 'SELECT COUNT(*) as total FROM payments p WHERE 1=1';
        const params = [];
        const countParams = [];

        if (student_id) {
            query += ' AND p.student_id = ?';
            countQuery += ' AND p.student_id = ?';
            params.push(student_id);
            countParams.push(student_id);
        }

        if (status) {
            query += ' AND p.status = ?';
            countQuery += ' AND p.status = ?';
            params.push(status);
            countParams.push(status);
        }

        if (payment_method) {
            query += ' AND p.payment_method = ?';
            countQuery += ' AND p.payment_method = ?';
            params.push(payment_method);
            countParams.push(payment_method);
        }

        if (payment_for_month) {
            query += ' AND p.payment_for_month = ?';
            countQuery += ' AND p.payment_for_month = ?';
            params.push(payment_for_month);
            countParams.push(payment_for_month);
        }

        if (start_date) {
            query += ' AND p.payment_date >= ?';
            countQuery += ' AND p.payment_date >= ?';
            params.push(start_date);
            countParams.push(start_date);
        }

        if (end_date) {
            query += ' AND p.payment_date <= ?';
            countQuery += ' AND p.payment_date <= ?';
            params.push(end_date);
            countParams.push(end_date);
        }

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' ORDER BY p.payment_date DESC, p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [payments] = await db.query(query, params);
        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get payments for a specific student
router.get('/student/:studentId', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { payment_for_month, page = 1, limit = 12 } = req.query; // Default 12 months

        let query = `
            SELECT 
                p.*,
                s.student_id,
                s.full_name,
                s.grade,
                s.section,
                a.username as recorded_by_username
            FROM payments p
            JOIN students s ON p.student_id = s.id
            LEFT JOIN admins a ON p.recorded_by = a.id
            WHERE p.student_id = ?
        `;

        const params = [studentId];

        if (payment_for_month) {
            query += ' AND p.payment_for_month = ?';
            params.push(payment_for_month);
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' ORDER BY p.payment_for_month DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [payments] = await db.query(query, params);

        // Get payment summary
        const [summary] = await db.query(`
            SELECT 
                COUNT(*) as total_payments,
                SUM(amount) as total_paid,
                SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
                SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdue_amount
            FROM payments
            WHERE student_id = ?
        `, [studentId]);

        res.json({
            success: true,
            data: payments,
            summary: summary[0]
        });

    } catch (error) {
        console.error('Get student payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Record a payment
router.post('/', authenticateToken, authorizeRoles('super_admin', 'admin'), validatePayment, async (req, res) => {
    try {
        const { 
            student_id, 
            amount, 
            payment_date, 
            payment_method, 
            payment_for_month, 
            transaction_id, 
            notes 
        } = req.body;
        const recorded_by = req.user.id;
        const receipt_number = generateReceiptNumber();

        // Check if payment already exists for this student for this month
        const [existing] = await db.query(
            'SELECT id FROM payments WHERE student_id = ? AND payment_for_month = ?',
            [student_id, payment_for_month]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Payment already recorded for this student for this month'
            });
        }

        const [result] = await db.query(`
            INSERT INTO payments (
                student_id, amount, payment_date, payment_method, payment_for_month,
                transaction_id, receipt_number, notes, recorded_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            student_id, amount, payment_date, payment_method || 'cash',
            payment_for_month, transaction_id, receipt_number, notes, recorded_by
        ]);

        const [newPayment] = await db.query(`
            SELECT 
                p.*,
                s.student_id,
                s.full_name,
                s.grade,
                s.section
            FROM payments p
            JOIN students s ON p.student_id = s.id
            WHERE p.id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            data: newPayment[0]
        });

    } catch (error) {
        console.error('Record payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update payment
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            amount, 
            payment_date, 
            payment_method, 
            status, 
            notes 
        } = req.body;

        // Check if payment exists
        const [existing] = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        await db.query(`
            UPDATE payments SET 
                amount = ?, payment_date = ?, payment_method = ?, status = ?, notes = ?
            WHERE id = ?
        `, [amount, payment_date, payment_method, status, notes, id]);

        const [updatedPayment] = await db.query(`
            SELECT 
                p.*,
                s.student_id,
                s.full_name
            FROM payments p
            JOIN students s ON p.student_id = s.id
            WHERE p.id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'Payment updated successfully',
            data: updatedPayment[0]
        });

    } catch (error) {
        console.error('Update payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Delete payment
router.delete('/:id', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if payment exists
        const [existing] = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        await db.query('DELETE FROM payments WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Payment deleted successfully'
        });

    } catch (error) {
        console.error('Delete payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get payment summary/reports
router.get('/reports/summary', authenticateToken, async (req, res) => {
    try {
        const { month, year } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];

        if (month && year) {
            whereClause += ' AND payment_for_month = ?';
            params.push(`${year}-${month.padStart(2, '0')}`);
        }

        // Overall summary
        const [summary] = await db.query(`
            SELECT 
                COUNT(*) as total_payments,
                SUM(amount) as total_amount,
                SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
                SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdue_amount,
                SUM(CASE WHEN status = 'partial' THEN amount ELSE 0 END) as partial_amount,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
            FROM payments
            ${whereClause}
        `, params);

        // Summary by payment method
        const [byMethod] = await db.query(`
            SELECT 
                payment_method,
                COUNT(*) as count,
                SUM(amount) as total_amount
            FROM payments
            ${whereClause}
            GROUP BY payment_method
        `, params);

        // Monthly trend (last 6 months)
        const [monthlyTrend] = await db.query(`
            SELECT 
                payment_for_month,
                COUNT(*) as total_payments,
                SUM(amount) as total_amount,
                SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
                SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdue_amount
            FROM payments
            WHERE payment_for_month >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 6 MONTH), '%Y-%m')
            GROUP BY payment_for_month
            ORDER BY payment_for_month DESC
        `);

        res.json({
            success: true,
            data: {
                summary: summary[0],
                by_payment_method: byMethod,
                monthly_trend: monthlyTrend
            }
        });

    } catch (error) {
        console.error('Get payment summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get outstanding/unpaid payments
router.get('/reports/outstanding', authenticateToken, async (req, res) => {
    try {
        const { months = 3 } = req.query;

        const [outstanding] = await db.query(`
            SELECT 
                s.student_id,
                s.full_name,
                s.grade,
                s.section,
                s.parent_phone,
                s.parent_email,
                b.bus_number,
                r.route_name,
                p.payment_for_month,
                p.amount,
                p.payment_date,
                p.status,
                DATEDIFF(CURDATE(), p.payment_date) as days_overdue
            FROM payments p
            JOIN students s ON p.student_id = s.id
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            WHERE p.status IN ('pending', 'overdue')
            AND p.payment_for_month >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL ? MONTH), '%Y-%m')
            ORDER BY p.payment_for_month DESC, days_overdue DESC
        `, [parseInt(months)]);

        res.json({
            success: true,
            data: outstanding
        });

    } catch (error) {
        console.error('Get outstanding payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get student transport fee balance
router.get('/reports/student-balances', authenticateToken, async (req, res) => {
    try {
        const { month } = req.query;

        let monthCondition = '';
        const params = [];

        if (month) {
            monthCondition = 'AND p.payment_for_month = ?';
            params.push(month);
        }

        const [balances] = await db.query(`
            SELECT 
                s.student_id,
                s.full_name,
                s.grade,
                s.section,
                s.transport_fee as monthly_fee,
                b.bus_number,
                r.route_name,
                COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END), 0) as paid_amount,
                s.transport_fee - COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END), 0) as balance
            FROM students s
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            LEFT JOIN payments p ON s.id = p.student_id ${monthCondition}
            WHERE s.status = 'active'
            GROUP BY s.id
            HAVING balance > 0
            ORDER BY balance DESC
        `, params);

        res.json({
            success: true,
            data: balances
        });

    } catch (error) {
        console.error('Get student balances error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update payment status
router.put('/:id/status', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['paid', 'pending', 'overdue', 'partial'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        await db.query('UPDATE payments SET status = ? WHERE id = ?', [status, id]);

        res.json({
            success: true,
            message: 'Payment status updated successfully'
        });

    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;