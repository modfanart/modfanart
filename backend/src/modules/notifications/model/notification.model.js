// src/modules/notifications/model/notification.model.js

const { db } = require("../../../config");

const NotificationModel = {
  /**
   * Create a new notification
   */
  create: async ({ user_id, type, title, body = null, data = {} }) => {
    const result = await db
      .insertInto("notifications")
      .values({
        user_id,
        type,
        title,
        body,
        data: Object.keys(data).length ? JSON.stringify(data) : null,
        read_at: null,
        created_at: new Date(),
      })
      .returningAll()
      .executeTakeFirst();

    return result;
  },

  /**
   * Get notifications for a user (paginated)
   */
  getByUser: async (
    user_id,
    { limit = 50, offset = 0, unreadOnly = false } = {}
  ) => {
    let query = db
      .selectFrom("notifications")
      .selectAll()
      .where("user_id", "=", user_id)
      .where("deleted_at", "is", null);

    if (unreadOnly) {
      query = query.where("read_at", "is", null);
    }

    const result = await query
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    return result;
  },

  /**
   * Mark one notification as read
   */
  markAsRead: async (id, user_id) => {
    const result = await db
      .updateTable("notifications")
      .set({
        read_at: new Date(),
      })
      .where("id", "=", id)
      .where("user_id", "=", user_id)
      .returningAll()
      .executeTakeFirst();

    return result;
  },

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead: async (user_id) => {
    const result = await db
      .updateTable("notifications")
      .set({
        read_at: new Date(),
      })
      .where("user_id", "=", user_id)
      .where("read_at", "is", null)
      .returning(["id"])
      .execute();

    return result.length;
  },

  /**
   * Soft delete a notification
   */
  softDelete: async (id, user_id) => {
    const result = await db
      .updateTable("notifications")
      .set({
        deleted_at: new Date(),
      })
      .where("id", "=", id)
      .where("user_id", "=", user_id)
      .returning(["id"])
      .executeTakeFirst();

    return !!result;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (user_id) => {
    const result = await db
      .selectFrom("notifications")
      .select(({ fn }) => fn.count("id").as("count"))
      .where("user_id", "=", user_id)
      .where("read_at", "is", null)
      .where("deleted_at", "is", null)
      .executeTakeFirst();

    return Number(result?.count ?? 0);
  },
};

module.exports = NotificationModel;
