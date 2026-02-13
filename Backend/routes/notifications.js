const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../Controllers/notificationController');

// All routes require authentication
router.use(auth);

// Get all notifications for logged-in user
router.get('/', notificationController.getMyNotifications);

// Get unread notifications
router.get('/unread', notificationController.getUnreadNotifications);

// Get unread count
router.get('/unread/count', notificationController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Get notification preferences
router.get('/preferences', notificationController.getPreferences);

// Update notification preferences
router.put('/preferences', notificationController.updatePreferences);

module.exports = router;
