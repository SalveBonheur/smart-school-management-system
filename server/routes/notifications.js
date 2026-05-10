import express from 'express';
import db from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications - Get notifications for current user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { limit = 20, offset = 0, unreadOnly = false } = req.query;

        let query = `
            SELECT * FROM notifications 
            WHERE (user_id = ? OR user_role = ?)
            ${unreadOnly === 'true' ? 'AND is_read = 0' : ''}
            ORDER BY 
                CASE priority 
                    WHEN 'high' THEN 1 
                    WHEN 'normal' THEN 2 
                    ELSE 3 
                END,
                created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const notifications = await db.all(query, [userId, userRole, parseInt(limit), parseInt(offset)]);

        // Get unread count
        const unreadResult = await db.get(
            `SELECT COUNT(*) as count FROM notifications 
             WHERE (user_id = ? OR user_role = ?) AND is_read = 0`,
            [userId, userRole]
        );

        res.json({
            success: true,
            data: notifications,
            unreadCount: unreadResult.count,
            total: notifications.length
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        const result = await db.get(
            `SELECT COUNT(*) as count FROM notifications 
             WHERE (user_id = ? OR user_role = ?) AND is_read = 0`,
            [userId, userRole]
        );

        res.json({
            success: true,
            count: result.count
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/notifications - Create notification (admin only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        // Only admin can create notifications
        if (!['admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { userId, userRole, type, category, priority, title, message, relatedId, relatedType } = req.body;

        if (!userRole || !title || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'userRole, title, and message are required' 
            });
        }

        const result = await db.run(`
            INSERT INTO notifications (user_id, user_role, type, category, priority, title, message, related_id, related_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            userId || null, 
            userRole, 
            type || 'general', 
            category || 'general',
            priority || 'normal',
            title, 
            message,
            relatedId || null,
            relatedType || null
        ]);

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: { id: result.lastID }
        });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/notifications/read/:id - Mark notification as read
router.put('/read/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Verify notification belongs to user
        const notification = await db.get(
            `SELECT * FROM notifications WHERE id = ? AND (user_id = ? OR user_role = ?)`,
            [id, userId, userRole]
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        await db.run(
            `UPDATE notifications SET is_read = 1, read_at = datetime('now') WHERE id = ?`,
            [id]
        );

        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        await db.run(
            `UPDATE notifications SET is_read = 1, read_at = datetime('now') 
             WHERE (user_id = ? OR user_role = ?) AND is_read = 0`,
            [userId, userRole]
        );

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Verify notification belongs to user or user is admin
        const notification = await db.get(
            `SELECT * FROM notifications WHERE id = ?`,
            [id]
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Only allow deletion if user owns it or is admin
        if (notification.user_id !== userId && notification.user_role !== userRole && 
            !['admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        await db.run(`DELETE FROM notifications WHERE id = ?`, [id]);

        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
