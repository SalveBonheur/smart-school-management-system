import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { generateToken, authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateAdminRegistration } from '../middleware/validation.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const [users] = await db.query(
            'SELECT * FROM admins WHERE username = ? OR email = ?',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Register new admin (requires super_admin role)
router.post('/register', authenticateToken, authorizeRoles('super_admin'), validateAdminRegistration, async (req, res) => {
    try {
        const { username, password, email, full_name, role } = req.body;

        // Check if username or email already exists
        const [existing] = await db.query(
            'SELECT id FROM admins WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO admins (username, password, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, email, full_name, role || 'admin']
        );

        const [newAdmin] = await db.query(
            'SELECT id, username, email, full_name, role, created_at FROM admins WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: newAdmin[0]
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, email, full_name, role, created_at, updated_at FROM admins WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { email, full_name } = req.body;
        const userId = req.user.id;

        // Check if email is taken by another user
        if (email) {
            const [existing] = await db.query(
                'SELECT id FROM admins WHERE email = ? AND id != ?',
                [email, userId]
            );

            if (existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
        }

        await db.query(
            'UPDATE admins SET email = ?, full_name = ? WHERE id = ?',
            [email, full_name, userId]
        );

        const [updatedUser] = await db.query(
            'SELECT id, username, email, full_name, role, created_at, updated_at FROM admins WHERE id = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser[0]
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const [users] = await db.query(
            'SELECT password FROM admins WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const validPassword = await bcrypt.compare(currentPassword, users[0].password);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
            'UPDATE admins SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;