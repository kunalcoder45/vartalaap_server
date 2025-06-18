// server/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const attachMongoUser = require('../middleware/attachMongoUser');
const mongoose = require('mongoose');

// Get all notifications for current user
// GET /api/notifications
router.get('/', verifyFirebaseToken, attachMongoUser, async (req, res) => {
    try {
        const userId = req.user.mongoUserId;

        const notifications = await Notification.find({
            recipient: userId
        })
        .populate('sender', 'name avatarUrl firebaseUid')
        .sort({ createdAt: -1 })
        .limit(50); // Limit to 50 most recent notifications

        res.json({ notifications });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get unread notifications count
// GET /api/notifications/unread-count
router.get('/unread-count', verifyFirebaseToken, attachMongoUser, async (req, res) => {
    try {
        const userId = req.user.mongoUserId;

        const count = await Notification.countDocuments({
            recipient: userId,
            isRead: false
        });

        res.json({ count });

    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Mark notification as read
// PUT /api/notifications/:notificationId/read
router.put('/:notificationId/read', verifyFirebaseToken, attachMongoUser, async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.mongoUserId;

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: 'Invalid notification ID' });
        }

        const notification = await Notification.findOneAndUpdate(
            { 
                _id: notificationId, 
                recipient: userId 
            },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read', notification });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Mark all notifications as read
// PUT /api/notifications/mark-all-read
router.put('/mark-all-read', verifyFirebaseToken, attachMongoUser, async (req, res) => {
    try {
        const userId = req.user.mongoUserId;

        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );

        res.json({ message: 'All notifications marked as read' });

    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete notification
// DELETE /api/notifications/:notificationId
router.delete('/:notificationId', verifyFirebaseToken, attachMongoUser, async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.mongoUserId;

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: 'Invalid notification ID' });
        }

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });

    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;