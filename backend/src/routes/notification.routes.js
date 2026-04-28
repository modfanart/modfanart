const express = require('express');
const router = express.Router();
const NotificationController = require('../controller/notification.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken); // Protect all notification routes

router.get('/', NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);

router.patch('/:id/read', NotificationController.markAsRead);
router.patch('/read-all', NotificationController.markAllAsRead);

router.delete('/:id', NotificationController.deleteNotification);

module.exports = router;
