import express from 'express';
import db from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateAttendance } from '../middleware/validation.js';

const router = express.Router();

// Get all attendance records with filtering and pagination
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { 
            student_id, 
            date, 
            boarding_status, 
            dropoff_status, 
            start_date, 
            end_date,
            page = 1, 
            limit = 20 
        } = req.query;

        let query = `
            SELECT 
                a.*,
                s.student_id,
                s.full_name,
                s.grade,
                s.section,
                s.parent_phone,
                b.bus_number,
                r.route_name,
                r.route_code
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            WHERE 1=1
        `;

        let countQuery = 'SELECT COUNT(*) as total FROM attendance a WHERE 1=1';
        const params = [];
        const countParams = [];

        if (student_id) {
            query += ' AND a.student_id = ?';
            countQuery += ' AND a.student_id = ?';
            params.push(student_id);
            countParams.push(student_id);
        }

        if (date) {
            query += ' AND a.date = ?';
            countQuery += ' AND a.date = ?';
            params.push(date);
            countParams.push(date);
        }

        if (start_date) {
            query += ' AND a.date >= ?';
            countQuery += ' AND a.date >= ?';
            params.push(start_date);
            countParams.push(start_date);
        }

        if (end_date) {
            query += ' AND a.date <= ?';
            countQuery += ' AND a.date <= ?';
            params.push(end_date);
            countParams.push(end_date);
        }

        if (boarding_status) {
            query += ' AND a.boarding_status = ?';
            countQuery += ' AND a.boarding_status = ?';
            params.push(boarding_status);
            countParams.push(boarding_status);
        }

        if (dropoff_status) {
            query += ' AND a.dropoff_status = ?';
            countQuery += ' AND a.dropoff_status = ?';
            params.push(dropoff_status);
            countParams.push(dropoff_status);
        }

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' ORDER BY a.date DESC, a.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [attendance] = await db.query(query, params);
        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: attendance,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get attendance for a specific student
router.get('/student/:studentId', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { start_date, end_date, page = 1, limit = 30 } = req.query;

        let query = `
            SELECT 
                a.*,
                s.student_id,
                s.full_name,
                s.grade,
                s.section,
                b.bus_number,
                r.route_name
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            WHERE a.student_id = ?
        `;

        const params = [studentId];

        if (start_date) {
            query += ' AND a.date >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND a.date <= ?';
            params.push(end_date);
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' ORDER BY a.date DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [attendance] = await db.query(query, params);

        // Get summary stats
        const [summary] = await db.query(`
            SELECT 
                COUNT(*) as total_days,
                SUM(CASE WHEN boarding_status = 'present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN boarding_status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                SUM(CASE WHEN boarding_status = 'late' THEN 1 ELSE 0 END) as late_count,
                SUM(CASE WHEN boarding_status = 'excused' THEN 1 ELSE 0 END) as excused_count
            FROM attendance
            WHERE student_id = ?
        `, [studentId]);

        res.json({
            success: true,
            data: attendance,
            summary: summary[0]
        });

    } catch (error) {
        console.error('Get student attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Record attendance (single student)
router.post('/', authenticateToken, authorizeRoles('super_admin', 'admin', 'staff'), validateAttendance, async (req, res) => {
    try {
        const { student_id, date, boarding_status, dropoff_status, notes } = req.body;
        const recorded_by = req.user.id;

        // Check if attendance already exists for this student on this date
        const [existing] = await db.query(
            'SELECT id FROM attendance WHERE student_id = ? AND date = ?',
            [student_id, date]
        );

        if (existing.length > 0) {
            // Update existing record
            await db.query(`
                UPDATE attendance SET 
                    boarding_status = ?, dropoff_status = ?, notes = ?, recorded_by = ?
                WHERE student_id = ? AND date = ?
            `, [boarding_status, dropoff_status, notes, recorded_by, student_id, date]);

            const [updated] = await db.query(
                'SELECT * FROM attendance WHERE student_id = ? AND date = ?',
                [student_id, date]
            );

            res.json({
                success: true,
                message: 'Attendance updated successfully',
                data: updated[0]
            });
        } else {
            // Insert new record
            const [result] = await db.query(`
                INSERT INTO attendance (student_id, date, boarding_status, dropoff_status, notes, recorded_by)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [student_id, date, boarding_status || 'present', dropoff_status || 'present', notes, recorded_by]);

            const [newAttendance] = await db.query(
                'SELECT * FROM attendance WHERE id = ?',
                [result.insertId]
            );

            res.status(201).json({
                success: true,
                message: 'Attendance recorded successfully',
                data: newAttendance[0]
            });
        }

    } catch (error) {
        console.error('Record attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Bulk record attendance for a bus/route
router.post('/bulk', authenticateToken, authorizeRoles('super_admin', 'admin', 'staff'), async (req, res) => {
    try {
        const { bus_id, route_id, date, records } = req.body;
        const recorded_by = req.user.id;

        if (!records || !Array.isArray(records)) {
            return res.status(400).json({
                success: false,
                message: 'Records array is required'
            });
        }

        const results = [];
        const errors = [];

        for (const record of records) {
            try {
                const { student_id, boarding_status, dropoff_status, notes } = record;

                // Verify student exists and is assigned to the specified bus/route
                let studentCheck;
                if (bus_id) {
                    [studentCheck] = await db.query(
                        'SELECT id FROM students WHERE id = ? AND bus_id = ?',
                        [student_id, bus_id]
                    );
                } else if (route_id) {
                    [studentCheck] = await db.query(
                        'SELECT id FROM students WHERE id = ? AND route_id = ?',
                        [student_id, route_id]
                    );
                } else {
                    [studentCheck] = await db.query('SELECT id FROM students WHERE id = ?', [student_id]);
                }

                if (studentCheck.length === 0) {
                    errors.push({ student_id, error: 'Student not found or not assigned to this bus/route' });
                    continue;
                }

                // Insert or update attendance
                const [existing] = await db.query(
                    'SELECT id FROM attendance WHERE student_id = ? AND date = ?',
                    [student_id, date]
                );

                if (existing.length > 0) {
                    await db.query(`
                        UPDATE attendance SET 
                            boarding_status = ?, dropoff_status = ?, notes = ?, recorded_by = ?
                        WHERE student_id = ? AND date = ?
                    `, [boarding_status, dropoff_status, notes, recorded_by, student_id, date]);
                } else {
                    await db.query(`
                        INSERT INTO attendance (student_id, date, boarding_status, dropoff_status, notes, recorded_by)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, [student_id, date, boarding_status, dropoff_status, notes, recorded_by]);
                }

                results.push({ student_id, success: true });
            } catch (err) {
                errors.push({ student_id: record.student_id, error: err.message });
            }
        }

        res.json({
            success: true,
            message: `Processed ${results.length} records`,
            results,
            errors
        });

    } catch (error) {
        console.error('Bulk attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get daily attendance summary
router.get('/summary/daily', authenticateToken, async (req, res) => {
    try {
        const { date = new Date().toISOString().split('T')[0] } = req.query;

        const [summary] = await db.query(`
            SELECT 
                'Boarding' as type,
                COUNT(*) as total,
                SUM(CASE WHEN boarding_status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN boarding_status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN boarding_status = 'late' THEN 1 ELSE 0 END) as late,
                SUM(CASE WHEN boarding_status = 'excused' THEN 1 ELSE 0 END) as excused
            FROM attendance
            WHERE date = ?
            
            UNION ALL
            
            SELECT 
                'Dropoff' as type,
                COUNT(*) as total,
                SUM(CASE WHEN dropoff_status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN dropoff_status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN dropoff_status = 'late' THEN 1 ELSE 0 END) as late,
                SUM(CASE WHEN dropoff_status = 'excused' THEN 1 ELSE 0 END) as excused
            FROM attendance
            WHERE date = ?
        `, [date, date]);

        // Get list of students without attendance for the day
        const [missingAttendance] = await db.query(`
            SELECT 
                s.id,
                s.student_id,
                s.full_name,
                s.grade,
                s.section,
                b.bus_number,
                r.route_name
            FROM students s
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
            WHERE a.id IS NULL AND s.status = 'active'
        `, [date]);

        res.json({
            success: true,
            data: {
                date,
                summary,
                missing_attendance: missingAttendance
            }
        });

    } catch (error) {
        console.error('Get daily summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get attendance reports by date range
router.get('/reports/date-range', authenticateToken, async (req, res) => {
    try {
        const { start_date, end_date, group_by = 'student' } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        let reportQuery;
        if (group_by === 'student') {
            reportQuery = `
                SELECT 
                    s.student_id,
                    s.full_name,
                    s.grade,
                    s.section,
                    b.bus_number,
                    r.route_name,
                    COUNT(*) as total_days,
                    SUM(CASE WHEN a.boarding_status = 'present' THEN 1 ELSE 0 END) as present_days,
                    SUM(CASE WHEN a.boarding_status = 'absent' THEN 1 ELSE 0 END) as absent_days,
                    SUM(CASE WHEN a.boarding_status = 'late' THEN 1 ELSE 0 END) as late_days,
                    ROUND((SUM(CASE WHEN a.boarding_status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_percentage
                FROM students s
                LEFT JOIN attendance a ON s.id = a.student_id AND a.date BETWEEN ? AND ?
                LEFT JOIN buses b ON s.bus_id = b.id
                LEFT JOIN routes r ON s.route_id = r.id
                WHERE s.status = 'active'
                GROUP BY s.id
                ORDER BY attendance_percentage ASC
            `;
        } else if (group_by === 'bus') {
            reportQuery = `
                SELECT 
                    b.bus_number,
                    b.model,
                    COUNT(DISTINCT a.student_id) as unique_students,
                    COUNT(*) as total_records,
                    SUM(CASE WHEN a.boarding_status = 'present' THEN 1 ELSE 0 END) as present_count,
                    SUM(CASE WHEN a.boarding_status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                    ROUND((SUM(CASE WHEN a.boarding_status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_percentage
                FROM buses b
                LEFT JOIN students s ON b.id = s.bus_id
                LEFT JOIN attendance a ON s.id = a.student_id AND a.date BETWEEN ? AND ?
                WHERE b.status = 'active'
                GROUP BY b.id
                ORDER BY attendance_percentage ASC
            `;
        } else if (group_by === 'route') {
            reportQuery = `
                SELECT 
                    r.route_name,
                    r.route_code,
                    COUNT(DISTINCT a.student_id) as unique_students,
                    COUNT(*) as total_records,
                    SUM(CASE WHEN a.boarding_status = 'present' THEN 1 ELSE 0 END) as present_count,
                    SUM(CASE WHEN a.boarding_status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                    ROUND((SUM(CASE WHEN a.boarding_status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_percentage
                FROM routes r
                LEFT JOIN students s ON r.id = s.route_id
                LEFT JOIN attendance a ON s.id = a.student_id AND a.date BETWEEN ? AND ?
                WHERE r.status = 'active'
                GROUP BY r.id
                ORDER BY attendance_percentage ASC
            `;
        }

        const [report] = await db.query(reportQuery, [start_date, end_date]);

        res.json({
            success: true,
            data: report,
            period: { start_date, end_date }
        });

    } catch (error) {
        console.error('Get date range report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;