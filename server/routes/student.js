import express from 'express';
import db from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateStudent } from '../middleware/validation.js';

const router = express.Router();

// Get all students with optional filtering and pagination
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { 
            search, 
            status, 
            route_id, 
            bus_id, 
            grade, 
            page = 1, 
            limit = 10 
        } = req.query;

        let query = `
            SELECT 
                s.id,
                s.student_id,
                s.full_name,
                s.date_of_birth,
                s.gender,
                s.grade,
                s.section,
                s.parent_name,
                s.parent_phone,
                s.parent_email,
                s.address,
                s.emergency_contact,
                s.route_id,
                s.pickup_location,
                s.dropoff_location,
                s.bus_id,
                s.transport_fee,
                s.status,
                s.admission_date,
                s.created_at,
                r.route_name,
                r.route_code,
                b.bus_number
            FROM students s
            LEFT JOIN routes r ON s.route_id = r.id
            LEFT JOIN buses b ON s.bus_id = b.id
            WHERE 1=1
        `;

        let countQuery = 'SELECT COUNT(*) as total FROM students WHERE 1=1';
        const params = [];
        const countParams = [];

        if (search) {
            const searchParam = `%${search}%`;
            query += ' AND (s.student_id LIKE ? OR s.full_name LIKE ? OR s.parent_name LIKE ?)';
            countQuery += ' AND (student_id LIKE ? OR full_name LIKE ? OR parent_name LIKE ?)';
            params.push(searchParam, searchParam, searchParam);
            countParams.push(searchParam, searchParam, searchParam);
        }

        if (status) {
            query += ' AND s.status = ?';
            countQuery += ' AND status = ?';
            params.push(status);
            countParams.push(status);
        }

        if (route_id) {
            query += ' AND s.route_id = ?';
            countQuery += ' AND route_id = ?';
            params.push(route_id);
            countParams.push(route_id);
        }

        if (bus_id) {
            query += ' AND s.bus_id = ?';
            countQuery += ' AND bus_id = ?';
            params.push(bus_id);
            countParams.push(bus_id);
        }

        if (grade) {
            query += ' AND s.grade = ?';
            countQuery += ' AND grade = ?';
            params.push(grade);
            countParams.push(grade);
        }

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [students] = await db.query(query, params);
        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: students,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get single student by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [students] = await db.query(`
            SELECT 
                s.*,
                r.route_name,
                r.route_code,
                r.route_description,
                b.bus_number,
                b.model as bus_model,
                d.full_name as driver_name,
                d.phone as driver_phone
            FROM students s
            LEFT JOIN routes r ON s.route_id = r.id
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            WHERE s.id = ?
        `, [id]);

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            data: students[0]
        });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Create new student
router.post('/', authenticateToken, authorizeRoles('super_admin', 'admin'), validateStudent, async (req, res) => {
    try {
        const {
            student_id,
            full_name,
            date_of_birth,
            gender,
            grade,
            section,
            parent_name,
            parent_phone,
            parent_email,
            address,
            emergency_contact,
            route_id,
            pickup_location,
            dropoff_location,
            bus_id,
            transport_fee,
            admission_date
        } = req.body;

        // Check if student_id already exists
        const [existing] = await db.query(
            'SELECT id FROM students WHERE student_id = ?',
            [student_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Student ID already exists'
            });
        }

        const [result] = await db.query(`
            INSERT INTO students (
                student_id, full_name, date_of_birth, gender, grade, section,
                parent_name, parent_phone, parent_email, address, emergency_contact,
                route_id, pickup_location, dropoff_location, bus_id, transport_fee,
                admission_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            student_id, full_name, date_of_birth, gender, grade, section,
            parent_name, parent_phone, parent_email, address, emergency_contact,
            route_id, pickup_location, dropoff_location, bus_id, transport_fee || 0,
            admission_date || new Date()
        ]);

        // Update bus occupancy if bus_id is provided
        if (bus_id) {
            await db.query(
                'UPDATE buses SET current_occupancy = current_occupancy + 1 WHERE id = ?',
                [bus_id]
            );
        }

        const [newStudent] = await db.query(
            'SELECT * FROM students WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: newStudent[0]
        });

    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update student
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            full_name,
            date_of_birth,
            gender,
            grade,
            section,
            parent_name,
            parent_phone,
            parent_email,
            address,
            emergency_contact,
            route_id,
            pickup_location,
            dropoff_location,
            bus_id,
            transport_fee,
            status
        } = req.body;

        // Check if student exists
        const [existing] = await db.query('SELECT * FROM students WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const oldBusId = existing[0].bus_id;

        // Update student
        await db.query(`
            UPDATE students SET 
                full_name = ?, date_of_birth = ?, gender = ?, grade = ?, section = ?,
                parent_name = ?, parent_phone = ?, parent_email = ?, address = ?, 
                emergency_contact = ?, route_id = ?, pickup_location = ?, 
                dropoff_location = ?, bus_id = ?, transport_fee = ?, status = ?
            WHERE id = ?
        `, [
            full_name, date_of_birth, gender, grade, section,
            parent_name, parent_phone, parent_email, address, 
            emergency_contact, route_id, pickup_location, 
            dropoff_location, bus_id, transport_fee, status,
            id
        ]);

        // Update bus occupancy
        if (oldBusId && oldBusId !== bus_id) {
            await db.query(
                'UPDATE buses SET current_occupancy = current_occupancy - 1 WHERE id = ?',
                [oldBusId]
            );
        }
        if (bus_id && bus_id !== oldBusId) {
            await db.query(
                'UPDATE buses SET current_occupancy = current_occupancy + 1 WHERE id = ?',
                [bus_id]
            );
        }

        const [updatedStudent] = await db.query(
            'SELECT * FROM students WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Student updated successfully',
            data: updatedStudent[0]
        });

    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Delete student
router.delete('/:id', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if student exists
        const [existing] = await db.query('SELECT * FROM students WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Update bus occupancy if student was assigned to a bus
        if (existing[0].bus_id) {
            await db.query(
                'UPDATE buses SET current_occupancy = current_occupancy - 1 WHERE id = ?',
                [existing[0].bus_id]
            );
        }

        await db.query('DELETE FROM students WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });

    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;