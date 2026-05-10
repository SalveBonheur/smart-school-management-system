import express from 'express';
import db from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { notifyTransportDelay } from '../services/notificationService.js';

const router = express.Router();

// GET /api/bus-status - Get all current bus statuses
router.get('/', authenticateToken, async (req, res) => {
    try {
        const statuses = await db.all(`
            SELECT 
                bcs.*,
                b.bus_number,
                b.capacity,
                b.model,
                d.full_name as driver_name,
                d.phone as driver_phone,
                r.route_name,
                r.route_code
            FROM bus_current_status bcs
            LEFT JOIN buses b ON bcs.bus_id = b.id
            LEFT JOIN drivers d ON bcs.driver_id = d.id
            LEFT JOIN routes r ON b.route_id = r.id
            ORDER BY bcs.last_updated DESC
        `);

        res.json({
            success: true,
            data: statuses
        });
    } catch (error) {
        console.error('Get bus statuses error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/bus-status/:busId - Get specific bus status
router.get('/:busId', authenticateToken, async (req, res) => {
    try {
        const { busId } = req.params;
        
        const status = await db.get(`
            SELECT 
                bcs.*,
                b.bus_number,
                b.capacity,
                d.full_name as driver_name,
                r.route_name
            FROM bus_current_status bcs
            LEFT JOIN buses b ON bcs.bus_id = b.id
            LEFT JOIN drivers d ON bcs.driver_id = d.id
            LEFT JOIN routes r ON b.route_id = r.id
            WHERE bcs.bus_id = ?
        `, [busId]);

        if (!status) {
            return res.status(404).json({ success: false, message: 'Bus status not found' });
        }

        // Get status history
        const history = await db.all(`
            SELECT * FROM bus_status_logs 
            WHERE bus_id = ? 
            ORDER BY created_at DESC 
            LIMIT 10
        `, [busId]);

        res.json({
            success: true,
            data: { ...status, history }
        });
    } catch (error) {
        console.error('Get bus status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/bus-status/:busId/update - Update bus status (Driver only)
router.post('/:busId/update', authenticateToken, async (req, res) => {
    try {
        const { busId } = req.params;
        const { status, location, latitude, longitude, estimated_arrival, delay_minutes, reason } = req.body;
        const driverId = req.user.id;

        // Validate status
        const validStatuses = ['active', 'on_route', 'delayed', 'arrived', 'maintenance', 'parked'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        // Verify driver is assigned to this bus
        const bus = await db.get(
            'SELECT * FROM buses WHERE id = ? AND driver_id = ?',
            [busId, driverId]
        );

        if (!bus && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized for this bus' });
        }

        // End previous status
        await db.run(`
            UPDATE bus_status_logs 
            SET ended_at = datetime('now') 
            WHERE bus_id = ? AND ended_at IS NULL
        `, [busId]);

        // Insert new status log
        const result = await db.run(`
            INSERT INTO bus_status_logs 
            (bus_id, driver_id, status, location, latitude, longitude, estimated_arrival, delay_minutes, reason)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [busId, driverId, status, location, latitude, longitude, estimated_arrival, delay_minutes || 0, reason]);

        // Update current status
        await db.run(`
            INSERT INTO bus_current_status 
            (bus_id, driver_id, status, location, latitude, longitude, estimated_arrival, delay_minutes, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(bus_id) DO UPDATE SET
            driver_id = excluded.driver_id,
            status = excluded.status,
            location = excluded.location,
            latitude = excluded.latitude,
            longitude = excluded.longitude,
            estimated_arrival = excluded.estimated_arrival,
            delay_minutes = excluded.delay_minutes,
            last_updated = datetime('now')
        `, [busId, driverId, status, location, latitude, longitude, estimated_arrival, delay_minutes || 0]);

        // If delayed, notify parents
        if (status === 'delayed' && delay_minutes > 5) {
            // Get students on this bus
            const students = await db.all(
                'SELECT s.id, s.first_name, s.last_name, p.id as parent_id FROM students s JOIN parents p ON s.parent_id = p.id WHERE s.bus_id = ?',
                [busId]
            );

            // Notify each parent
            for (const student of students) {
                await notifyTransportDelay(
                    student.parent_id,
                    `${student.first_name} ${student.last_name}`,
                    delay_minutes,
                    reason
                );
            }
        }

        res.json({
            success: true,
            message: 'Bus status updated successfully',
            data: { id: result.lastID }
        });
    } catch (error) {
        console.error('Update bus status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/bus-status/driver/:driverId - Get buses for specific driver
router.get('/driver/:driverId', authenticateToken, async (req, res) => {
    try {
        const { driverId } = req.params;
        
        // Verify authorization
        if (parseInt(driverId) !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const buses = await db.all(`
            SELECT 
                bcs.*,
                b.bus_number,
                b.capacity,
                b.model,
                r.route_name,
                r.route_code,
                r.start_point,
                r.end_point
            FROM bus_current_status bcs
            LEFT JOIN buses b ON bcs.bus_id = b.id
            LEFT JOIN routes r ON b.route_id = r.id
            WHERE bcs.driver_id = ?
            ORDER BY bcs.last_updated DESC
        `, [driverId]);

        res.json({
            success: true,
            data: buses
        });
    } catch (error) {
        console.error('Get driver buses error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/bus-status/student/:studentId - Get bus status for student's bus
router.get('/student/:studentId', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Get student's bus info
        const student = await db.get(`
            SELECT s.*, b.id as bus_id, b.bus_number, r.route_name
            FROM students s
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON b.route_id = r.id
            WHERE s.id = ?
        `, [studentId]);

        if (!student || !student.bus_id) {
            return res.status(404).json({ success: false, message: 'Student or bus not found' });
        }

        // Get current bus status
        const status = await db.get(`
            SELECT 
                bcs.*,
                b.bus_number,
                b.capacity,
                d.full_name as driver_name,
                d.phone as driver_phone,
                r.route_name,
                r.route_code
            FROM bus_current_status bcs
            LEFT JOIN buses b ON bcs.bus_id = b.id
            LEFT JOIN drivers d ON bcs.driver_id = d.id
            LEFT JOIN routes r ON b.route_id = r.id
            WHERE bcs.bus_id = ?
        `, [student.bus_id]);

        res.json({
            success: true,
            data: {
                student: {
                    id: student.id,
                    name: `${student.first_name} ${student.last_name}`,
                    grade: student.grade
                },
                bus: status || {
                    bus_id: student.bus_id,
                    bus_number: student.bus_number,
                    route_name: student.route_name,
                    status: 'parked'
                }
            }
        });
    } catch (error) {
        console.error('Get student bus status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/bus-status/summary/delayed - Get delayed buses summary (Admin)
router.get('/summary/delayed', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const delayedBuses = await db.all(`
            SELECT 
                bcs.*,
                b.bus_number,
                d.full_name as driver_name,
                d.phone as driver_phone,
                r.route_name,
                COUNT(s.id) as student_count
            FROM bus_current_status bcs
            LEFT JOIN buses b ON bcs.bus_id = b.id
            LEFT JOIN drivers d ON bcs.driver_id = d.id
            LEFT JOIN routes r ON b.route_id = r.id
            LEFT JOIN students s ON s.bus_id = bcs.bus_id
            WHERE bcs.status IN ('delayed', 'on_route')
            GROUP BY bcs.bus_id
            ORDER BY bcs.delay_minutes DESC
        `);

        res.json({
            success: true,
            data: delayedBuses
        });
    } catch (error) {
        console.error('Get delayed buses error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
