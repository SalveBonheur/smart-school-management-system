import express from 'express';
import db from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateBus } from '../middleware/validation.js';

const router = express.Router();

// Get all buses with optional filtering and pagination
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { 
            status, 
            driver_id, 
            model, 
            page = 1, 
            limit = 10 
        } = req.query;

        let query = `
            SELECT 
                b.*,
                d.full_name as driver_name,
                d.phone as driver_phone,
                d.license_number,
                r.route_name,
                r.route_code,
                (b.current_occupancy / b.capacity) * 100 as occupancy_percentage
            FROM buses b
            LEFT JOIN drivers d ON b.driver_id = d.id
            LEFT JOIN routes r ON b.id = r.bus_id
            WHERE 1=1
        `;

        let countQuery = 'SELECT COUNT(*) as total FROM buses WHERE 1=1';
        const params = [];
        const countParams = [];

        if (status) {
            query += ' AND b.status = ?';
            countQuery += ' AND status = ?';
            params.push(status);
            countParams.push(status);
        }

        if (driver_id) {
            query += ' AND b.driver_id = ?';
            countQuery += ' AND driver_id = ?';
            params.push(driver_id);
            countParams.push(driver_id);
        }

        if (model) {
            const modelParam = `%${model}%`;
            query += ' AND b.model LIKE ?';
            countQuery += ' AND model LIKE ?';
            params.push(modelParam);
            countParams.push(modelParam);
        }

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [buses] = await db.query(query, params);
        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: buses,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get buses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get single bus by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [buses] = await db.query(`
            SELECT 
                b.*,
                d.full_name as driver_name,
                d.phone as driver_phone,
                d.license_number,
                d.license_expiry,
                r.route_name,
                r.route_code,
                r.total_distance,
                r.estimated_duration,
                (b.current_occupancy / b.capacity) * 100 as occupancy_percentage
            FROM buses b
            LEFT JOIN drivers d ON b.driver_id = d.id
            LEFT JOIN routes r ON b.id = r.bus_id
            WHERE b.id = ?
        `, [id]);

        if (buses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        // Get maintenance history
        const [maintenance] = await db.query(
            'SELECT * FROM bus_maintenance WHERE bus_id = ? ORDER BY maintenance_date DESC',
            [id]
        );

        // Get assigned students
        const [students] = await db.query(`
            SELECT 
                s.id,
                s.student_id,
                s.full_name,
                s.parent_name,
                s.pickup_location,
                s.dropoff_location
            FROM students s
            WHERE s.bus_id = ?
            ORDER BY s.full_name
        `, [id]);

        res.json({
            success: true,
            data: {
                ...buses[0],
                maintenance_history: maintenance,
                assigned_students: students
            }
        });

    } catch (error) {
        console.error('Get bus error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Create new bus
router.post('/', authenticateToken, authorizeRoles('super_admin', 'admin'), validateBus, async (req, res) => {
    try {
        const {
            bus_number,
            registration_number,
            capacity,
            model,
            year,
            driver_id,
            last_maintenance,
            next_maintenance
        } = req.body;

        // Check if bus_number already exists
        const [existingBusNumber] = await db.query(
            'SELECT id FROM buses WHERE bus_number = ?',
            [bus_number]
        );

        if (existingBusNumber.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Bus number already exists'
            });
        }

        // Check if registration_number already exists
        const [existingReg] = await db.query(
            'SELECT id FROM buses WHERE registration_number = ?',
            [registration_number]
        );

        if (existingReg.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Registration number already exists'
            });
        }

        const [result] = await db.query(`
            INSERT INTO buses (
                bus_number, registration_number, capacity, model, year,
                driver_id, last_maintenance, next_maintenance
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            bus_number, registration_number, capacity, model, year,
            driver_id, last_maintenance, next_maintenance
        ]);

        const [newBus] = await db.query(
            'SELECT * FROM buses WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Bus created successfully',
            data: newBus[0]
        });

    } catch (error) {
        console.error('Create bus error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update bus
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'admin'), validateBus, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            bus_number,
            registration_number,
            capacity,
            model,
            year,
            driver_id,
            status,
            last_maintenance,
            next_maintenance
        } = req.body;

        // Check if bus exists
        const [existing] = await db.query('SELECT * FROM buses WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        // Check for duplicate bus_number (excluding current bus)
        if (bus_number !== existing[0].bus_number) {
            const [existingBusNumber] = await db.query(
                'SELECT id FROM buses WHERE bus_number = ? AND id != ?',
                [bus_number, id]
            );

            if (existingBusNumber.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Bus number already exists'
                });
            }
        }

        // Check for duplicate registration_number (excluding current bus)
        if (registration_number !== existing[0].registration_number) {
            const [existingReg] = await db.query(
                'SELECT id FROM buses WHERE registration_number = ? AND id != ?',
                [registration_number, id]
            );

            if (existingReg.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Registration number already exists'
                });
            }
        }

        // Update bus
        await db.query(`
            UPDATE buses SET 
                bus_number = ?, registration_number = ?, capacity = ?, model = ?,
                year = ?, driver_id = ?, status = ?, last_maintenance = ?,
                next_maintenance = ?
            WHERE id = ?
        `, [
            bus_number, registration_number, capacity, model,
            year, driver_id, status, last_maintenance,
            next_maintenance, id
        ]);

        const [updatedBus] = await db.query(
            'SELECT * FROM buses WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Bus updated successfully',
            data: updatedBus[0]
        });

    } catch (error) {
        console.error('Update bus error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Delete bus
router.delete('/:id', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if bus exists
        const [existing] = await db.query('SELECT * FROM buses WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        // Check if bus has assigned students
        const [assignedStudents] = await db.query(
            'SELECT COUNT(*) as count FROM students WHERE bus_id = ?',
            [id]
        );

        if (assignedStudents[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete bus with assigned students. Please reassign students first.'
            });
        }

        await db.query('DELETE FROM buses WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Bus deleted successfully'
        });

    } catch (error) {
        console.error('Delete bus error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Assign driver to bus
router.put('/:id/assign-driver', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { driver_id } = req.body;

        // Check if bus exists
        const [existing] = await db.query('SELECT * FROM buses WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        // Check if driver exists
        if (driver_id) {
            const [driver] = await db.query('SELECT * FROM drivers WHERE id = ?', [driver_id]);
            if (driver.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver not found'
                });
            }
        }

        await db.query('UPDATE buses SET driver_id = ? WHERE id = ?', [driver_id, id]);

        res.json({
            success: true,
            message: 'Driver assigned successfully'
        });

    } catch (error) {
        console.error('Assign driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update bus status
router.put('/:id/status', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'maintenance', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        await db.query('UPDATE buses SET status = ? WHERE id = ?', [status, id]);

        res.json({
            success: true,
            message: 'Bus status updated successfully'
        });

    } catch (error) {
        console.error('Update bus status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;