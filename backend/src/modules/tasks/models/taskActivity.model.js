// src/models/taskActivity.model.js
const { db } = require('../../../config');
const { sql } = require('kysely');

/** @typedef {import('../db/types').TaskActivityLogRow} TaskActivityLogRow */

class TaskActivity {
  static async log(taskId, actorId, action, oldValue = null, newValue = null) {
    return db
      .insertInto('task_activity_logs')
      .values({
        task_id: taskId,
        actor_id: actorId,
        action,
        old_value: oldValue,
        new_value: newValue,
        created_at: sql`NOW()`,
      })
      .execute();
  }

  static async getByTask(taskId) {
    return db
      .selectFrom('task_activity_logs')
      .selectAll()
      .where('task_id', '=', taskId)
      .orderBy('created_at', 'desc')
      .execute();
  }
}

module.exports = TaskActivity;