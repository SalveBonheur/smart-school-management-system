import express from 'express';
import db from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateDriver } from '../middleware/validation.js';

const router = express.Router();

// Get all drivers with optional filtering and pagination
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
                d.*,
                b.bus_number,
                b.model as bus_model,
                r.route_name,
                r.route_code,
                CASE 
                    WHEN d.license_expiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
                    THEN 'expiring_soon'
                    WHEN d.license_expiry < CURDATE()
                    THEN 'expired'
                    ELSE 'valid'
                END as license_status
            FROM drivers d
            LEFT JOIN buses b ON d.id = b.driver_id
            LEFT JOIN routes r ON b.id = r.bus_id
            WHERE 1=1
        `;

        let countQuery = 'SELECT COUNT(*) as total FROM drivers WHERE 1=1';
        const params = [];
        const countParams = [];

        if (status) {
            query += ' AND d.status = ?';
            countQuery += ' AND status = ?';
            params.push(status);
            countParams.push(status);
        }

        if (search) {
            const searchParam = `%${search}%`;
            query += ' AND (d.full_name LIKE ? OR d.license_number LIKE ? OR d.phone LIKE ?)';
            countQuery += ' AND (full_name LIKE ? OR license_number LIKE ? OR phone LIKE ?)';
            params.push(searchParam, searchParam, searchParam);
            countParams.push(searchParam, searchParam, searchParam);
        }

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [drivers] = await db.query(query, params);
        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: drivers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get single driver by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [drivers] = await db.query(`
            SELECT 
                d.*,
                b.bus_number,
                b.model as bus_model,
                b.registration_number,
                r.route_name,
                r.route_code,
                CASE 
                    WHEN d.license_expiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
                    THEN 'expiring_soon'
                    WHEN d.license_expiry < CURDATE()
                    THEN 'expired'
                    ELSE 'valid'
                END as license_status
            FROM drivers d
            LEFT JOIN buses b ON d.id = b.driver_id
            LEFT JOIN routes r ON b.id = r.bus_id
            WHERE d.id = ?
        `, [id]);

        if (drivers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Get assigned buses (current and past)
        const [assignedBuses] = await db.query(`
            SELECT 
                b.id,
                b.bus_number,
                b.model,
                b.registration_number,
                b.status,
                r.route_name,
                r.route_code
            FROM buses b
            LEFT JOIN routes r ON b.id = r.bus_id
            WHERE b.driver_id = ?
            ORDER BY b.created_at DESC
        `, [id]);

        res.json({
            success: true,
            data: {
                ...drivers[0],
                assigned_buses: assignedBuses
            }
        });

    } catch (error) {
        console.error('Get driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Create new driver
router.post('/', authenticateToken, authorizeRoles('super_admin', 'admin'), validateDriver, async (req, res) => {
    try {
        const {
            license_number,
            full_name,
            phone,
            email,
            address,
            license_expiry,
            hire_date
        } = req.body;

        // Check if license_number already exists
        const [existing] = await db.query(
            'SELECT id FROM drivers WHERE license_number = ?',
            [license_number]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'License number already exists'
            });
        }

        const [result] = await db.query(`
            INSERT INTO drivers (
                license_number, full_name, phone, email, address,
                license_expiry, hire_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            license_number, full_name, phone, email, address,
            license_expiry, hire_date
        ]);

        const [newDriver] = await db.query(
            'SELECT * FROM drivers WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Driver created successfully',
            data: newDriver[0]
        });

    } catch (error) {
        console.error('Create driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update driver
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'admin'), validateDriver, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            license_number,
            full_name,
            phone,
            email,
            address,
            license_expiry,
            hire_date,
            status
        } = req.body;

        // Check if driver exists
        const [existing] = await db.query('SELECT * FROM drivers WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Check for duplicate license_number (excluding current driver)
        if (license_number !== existing[0].license_number) {
            const [existingLicense] = await db.query(
                'SELECT id FROM drivers WHERE license_number = ? AND id != ?',
                [license_number, id]
            );

            if (existingLicense.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'License number already exists'
                });
            }
        }

        await db.query(`
            UPDATE drivers SET 
                license_number = ?, full_name = ?, phone = ?, email = ?,
                address = ?, license_expiry = ?, hire_date = ?, status = ?
            WHERE id = ?
        `, [
            license_number, full_name, phone, email,
            address, license_expiry, hire_date, status,
            id
        ]);

        const [updatedDriver] = await db.query(
            'SELECT * FROM drivers WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Driver updated successfully',
            data: updatedDriver[0]
        });

    } catch (error) {
        console.error('Update driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Delete driver
router.delete('/:id', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if driver exists
        const [existing] = await db.query('SELECT * FROM drivers WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Check if driver has assigned buses
        const [assignedBuses] = await db.query(
            'SELECT COUNT(*) as count FROM buses WHERE driver_id = ?',
            [id]
        );

        if (assignedBuses[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete driver with assigned buses. Please reassign buses first.'
            });
        }

        await db.query('DELETE FROM drivers WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Driver deleted successfully'
        });

    } catch (error) {
        console.error('Delete driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update driver status
router.put('/:id/status', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'inactive', 'on_leave'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        await db.query('UPDATE drivers SET status = ? WHERE id = ?', [status, id]);

        res.json({
            success: true,
            message: 'Driver status updated successfully'
        });

    } catch (error) {
        console.error('Update driver status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get drivers with expiring licenses
router.get('/reports/license-expiry', authenticateToken, async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const [drivers] = await db.query(`
            SELECT 
                id,
                license_number,
                full_name,
                phone,
                email,
                license_expiry,
                DATEDIFF(license_expiry, CURDATE()) as days_until_expiry,
                CASE 
                    WHEN license_expiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
                    THEN 'expiring_soon'
                    WHEN license_expiry < CURDATE()
                    THEN 'expired'
                    ELSE 'valid'
                END as license_status
            FROM drivers
            WHERE license_expiry <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
            AND status = 'active'
            ORDER BY license_expiry ASC
        `, [parseInt(days)]);

        res.json({
            success: true,
            data: drivers
        });

    } catch (error) {
        console.error('Get license expiry report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;