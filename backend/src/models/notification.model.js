const db = require('../config/db');

const NotificationModel = {
  /**
   * Create a new notification
   */
  create: async ({ user_id, type, title, body = null, data = {} }) => {
    const query = `
      INSERT INTO notifications (user_id, type, title, body, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [user_id, type, title, body, data];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  /**
   * Get all notifications for a user
   */
  getByUser: async (user_id, { limit = 50, offset = 0, unreadOnly = false } = {}) => {
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 AND deleted_at IS NULL
    `;

    if (unreadOnly) {
      query += ` AND read_at IS NULL`;
    }

    query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3;`;

    const result = await db.query(query, [user_id, limit, offset]);
    return result.rows;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id, user_id) => {
    const query = `
      UPDATE notifications 
      SET read_at = NOW() 
      WHERE id = $1 AND user_id = $2 
      RETURNING *;
    `;
    const result = await db.query(query, [id, user_id]);
    return result.rows[0];
  },

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead: async (user_id) => {
    const query = `
      UPDATE notifications 
      SET read_at = NOW() 
      WHERE user_id = $1 AND read_at IS NULL 
      RETURNING id;
    `;
    const result = await db.query(query, [user_id]);
    return result.rowCount;
  },

  /**
   * Delete notification (soft delete)
   */
  softDelete: async (id, user_id) => {
    const query = `
      UPDATE notifications 
      SET deleted_at = NOW() 
      WHERE id = $1 AND user_id = $2 
      RETURNING id;
    `;
    const result = await db.query(query, [id, user_id]);
    return result.rowCount > 0;
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (user_id) => {
    const query = `
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = $1 AND read_at IS NULL AND deleted_at IS NULL;
    `;
    const result = await db.query(query, [user_id]);
    return parseInt(result.rows[0].count);
  }
};

module.exports = NotificationModel;