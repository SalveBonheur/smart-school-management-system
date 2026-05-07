import express from 'express';
import db from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateRoute } from '../middleware/validation.js';

const router = express.Router();

// Get all routes with optional filtering and pagination
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { 
            status, 
            search, 
            page = 1, 
            limit = 10 
        } = req.query;

        let query = `
            SELECT 
                r.*,
                b.bus_number,
                b.model as bus_model,
                d.full_name as driver_name,
                d.phone as driver_phone,
                (SELECT COUNT(*) FROM students WHERE route_id = r.id) as student_count,
                (SELECT COUNT(*) FROM route_stops WHERE route_id = r.id) as stop_count
            FROM routes r
            LEFT JOIN buses b ON r.bus_id = b.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            WHERE 1=1
        `;

        let countQuery = 'SELECT COUNT(*) as total FROM routes WHERE 1=1';
        const params = [];
        const countParams = [];

        if (status) {
            query += ' AND r.status = ?';
            countQuery += ' AND status = ?';
            params.push(status);
            countParams.push(status);
        }

        if (search) {
            const searchParam = `%${search}%`;
            query += ' AND (r.route_name LIKE ? OR r.route_code LIKE ? OR r.description LIKE ?)';
            countQuery += ' AND (route_name LIKE ? OR route_code LIKE ? OR description LIKE ?)';
            params.push(searchParam, searchParam, searchParam);
            countParams.push(searchParam, searchParam, searchParam);
        }

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [routes] = await db.query(query, params);
        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: routes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get routes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get single route by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [routes] = await db.query(`
            SELECT 
                r.*,
                b.bus_number,
                b.model as bus_model,
                b.registration_number,
                d.full_name as driver_name,
                d.phone as driver_phone,
                d.license_number,
                (SELECT COUNT(*) FROM students WHERE route_id = r.id) as student_count
            FROM routes r
            LEFT JOIN buses b ON r.bus_id = b.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            WHERE r.id = ?
        `, [id]);

        if (routes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        // Get route stops
        const [stops] = await db.query(
            'SELECT * FROM route_stops WHERE route_id = ? ORDER BY stop_order ASC',
            [id]
        );

        // Get assigned students
        const [students] = await db.query(`
            SELECT 
                s.id,
                s.student_id,
                s.full_name,
                s.grade,
                s.section,
                s.parent_name,
                s.parent_phone,
                s.pickup_location,
                s.dropoff_location
            FROM students s
            WHERE s.route_id = ?
            ORDER BY s.full_name
        `, [id]);

        res.json({
            success: true,
            data: {
                ...routes[0],
                stops,
                students
            }
        });

    } catch (error) {
        console.error('Get route error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Create new route
router.post('/', authenticateToken, authorizeRoles('super_admin', 'admin'), validateRoute, async (req, res) => {
    try {
        const {
            route_name,
            route_code,
            description,
            total_distance,
            estimated_duration,
            bus_id
        } = req.body;

        // Check if route_code already exists
        const [existing] = await db.query(
            'SELECT id FROM routes WHERE route_code = ?',
            [route_code]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Route code already exists'
            });
        }

        const [result] = await db.query(`
            INSERT INTO routes (
                route_name, route_code, description, total_distance,
                estimated_duration, bus_id
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
            route_name, route_code, description, total_distance,
            estimated_duration, bus_id
        ]);

        const [newRoute] = await db.query(
            'SELECT * FROM routes WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Route created successfully',
            data: newRoute[0]
        });

    } catch (error) {
        console.error('Create route error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update route
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'admin'), validateRoute, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            route_name,
            route_code,
            description,
            total_distance,
            estimated_duration,
            bus_id,
            status
        } = req.body;

        // Check if route exists
        const [existing] = await db.query('SELECT * FROM routes WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        // Check for duplicate route_code (excluding current route)
        if (route_code !== existing[0].route_code) {
            const [existingCode] = await db.query(
                'SELECT id FROM routes WHERE route_code = ? AND id != ?',
                [route_code, id]
            );

            if (existingCode.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Route code already exists'
                });
            }
        }

        await db.query(`
            UPDATE routes SET 
                route_name = ?, route_code = ?, description = ?, total_distance = ?,
                estimated_duration = ?, bus_id = ?, status = ?
            WHERE id = ?
        `, [
            route_name, route_code, description, total_distance,
            estimated_duration, bus_id, status, id
        ]);

        const [updatedRoute] = await db.query(
            'SELECT * FROM routes WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Route updated successfully',
            data: updatedRoute[0]
        });

    } catch (error) {
        console.error('Update route error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Delete route
router.delete('/:id', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if route exists
        const [existing] = await db.query('SELECT * FROM routes WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        // Check if route has assigned students
        const [assignedStudents] = await db.query(
            'SELECT COUNT(*) as count FROM students WHERE route_id = ?',
            [id]
        );

        if (assignedStudents[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete route with assigned students. Please reassign students first.'
            });
        }

        await db.query('DELETE FROM routes WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Route deleted successfully'
        });

    } catch (error) {
        console.error('Delete route error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update route status
router.put('/:id/status', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        await db.query('UPDATE routes SET status = ? WHERE id = ?', [status, id]);

        res.json({
            success: true,
            message: 'Route status updated successfully'
        });

    } catch (error) {
        console.error('Update route status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Route Stops Management

// Add stop to route
router.post('/:id/stops', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { stop_name, stop_order, arrival_time, departure_time, latitude, longitude } = req.body;

        // Check if route exists
        const [route] = await db.query('SELECT id FROM routes WHERE id = ?', [id]);
        if (route.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        const [result] = await db.query(`
            INSERT INTO route_stops (route_id, stop_name, stop_order, arrival_time, departure_time, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [id, stop_name, stop_order, arrival_time, departure_time, latitude, longitude]);

        const [newStop] = await db.query(
            'SELECT * FROM route_stops WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Stop added successfully',
            data: newStop[0]
        });

    } catch (error) {
        console.error('Add stop error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update route stop
router.put('/:routeId/stops/:stopId', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
    try {
        const { routeId, stopId } = req.params;
        const { stop_name, stop_order, arrival_time, departure_time, latitude, longitude } = req.body;

        await db.query(`
            UPDATE route_stops SET 
                stop_name = ?, stop_order = ?, arrival_time = ?, departure_time = ?,
                latitude = ?, longitude = ?
            WHERE id = ? AND route_id = ?
        `, [stop_name, stop_order, arrival_time, departure_time, latitude, longitude, stopId, routeId]);

        res.json({
            success: true,
            message: 'Stop updated successfully'
        });

    } catch (error) {
        console.error('Update stop error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Delete route stop
router.delete('/:routeId/stops/:stopId', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
    try {
        const { routeId, stopId } = req.params;

        await db.query(
            'DELETE FROM route_stops WHERE id = ? AND route_id = ?',
            [stopId, routeId]
        );

        res.json({
            success: true,
            message: 'Stop deleted successfully'
        });

    } catch (error) {
        console.error('Delete stop error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get route occupancy report
router.get('/reports/occupancy', authenticateToken, async (req, res) => {
    try {
        const [routes] = await db.query(`
            SELECT 
                r.id,
                r.route_name,
                r.route_code,
                b.bus_number,
                b.capacity,
                (SELECT COUNT(*) FROM students WHERE route_id = r.id) as student_count,
                ROUND(((SELECT COUNT(*) FROM students WHERE route_id = r.id) / b.capacity) * 100, 2) as occupancy_percentage
            FROM routes r
            LEFT JOIN buses b ON r.bus_id = b.id
            WHERE r.status = 'active'
            ORDER BY occupancy_percentage DESC
        `);

        res.json({
            success: true,
            data: routes
        });

    } catch (error) {
        console.error('Get occupancy report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;