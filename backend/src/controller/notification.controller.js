const NotificationModel = require('../db/models/notification.model');
const { asyncHandler } = require('../utils/asyncHandler');

const NotificationController = {
  // GET /api/notifications
  getNotifications: asyncHandler(async (req, res) => {
    const { limit = 30, offset = 0, unreadOnly } = req.query;
    const user_id = req.user.id;

    const notifications = await NotificationModel.getByUser(user_id, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === 'true'
    });

    const unreadCount = await NotificationModel.getUnreadCount(user_id);

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: { limit, offset }
    });
  }),

  // GET /api/notifications/unread-count
  getUnreadCount: asyncHandler(async (req, res) => {
    const count = await NotificationModel.getUnreadCount(req.user.id);
    res.json({ success: true, unreadCount: count });
  }),

  // PATCH /api/notifications/:id/read
  markAsRead: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const notification = await NotificationModel.markAsRead(id, req.user.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification marked as read' });
  }),

  // PATCH /api/notifications/read-all
  markAllAsRead: asyncHandler(async (req, res) => {
    const count = await NotificationModel.markAllAsRead(req.user.id);
    res.json({ success: true, message: `${count} notifications marked as read` });
  }),

  // DELETE /api/notifications/:id
  deleteNotification: asyncHandler(async (req, res) => {
    const success = await NotificationModel.softDelete(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification deleted' });
  })
};

module.exports = NotificationController;