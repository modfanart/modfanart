const NotificationModel = require('../models/notification.model');

const NotificationController = {
  // GET /api/notifications
  getNotifications: async (req, res) => {
    try {
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
    } catch (error) {
      console.error('getNotifications error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // GET /api/notifications/unread-count
  getUnreadCount: async (req, res) => {
    try {
      const count = await NotificationModel.getUnreadCount(req.user.id);
      res.json({ success: true, unreadCount: count });
    } catch (error) {
      console.error('getUnreadCount error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // PATCH /api/notifications/:id/read
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await NotificationModel.markAsRead(id, req.user.id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      console.error('markAsRead error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // PATCH /api/notifications/read-all
  markAllAsRead: async (req, res) => {
    try {
      const count = await NotificationModel.markAllAsRead(req.user.id);
      res.json({
        success: true,
        message: `${count} notifications marked as read`
      });
    } catch (error) {
      console.error('markAllAsRead error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // DELETE /api/notifications/:id
  deleteNotification: async (req, res) => {
    try {
      const success = await NotificationModel.softDelete(req.params.id, req.user.id);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      console.error('deleteNotification error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

module.exports = NotificationController;