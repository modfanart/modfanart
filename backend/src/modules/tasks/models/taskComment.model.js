// src/models/taskComment.model.js
const { db } = require('../../../config');
const { sql } = require('kysely');

/** @typedef {import('../db/types').TaskCommentRow} TaskCommentRow */

class TaskComment {
  static async create(taskId, userId, content, mentions = []) {
    return db
      .insertInto('task_comments')
      .values({
        task_id: taskId,
        user_id: userId,
        content,
        mentions,
        created_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async getByTask(taskId) {
    return db
      .selectFrom('task_comments')
      .selectAll()
      .where('task_id', '=', taskId)
      .orderBy('created_at', 'asc')
      .execute();
  }
}

module.exports = TaskComment;