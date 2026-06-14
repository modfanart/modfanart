// src/models/task.model.js
const { db } = require('../../../config');
const { sql } = require('kysely');

/** @typedef {import('../db/types').TaskRow} TaskRow */

class Task {
  static async findById(id) {
    return db
      .selectFrom('tasks')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static async create(projectId, data) {
    return db
      .insertInto('tasks')
      .values({
        project_id: projectId,
        ...data,
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async update(id, data) {
    return db
      .updateTable('tasks')
      .set({
        ...data,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  static async assign(taskId, userId) {
    return db
      .updateTable('tasks')
      .set({
        assigned_to: userId,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', taskId)
      .execute();
  }

  static async updateStatus(taskId, status) {
    return db
      .updateTable('tasks')
      .set({
        status,
        updated_at: sql`NOW()`,
        completed_at: status === 'done' ? sql`NOW()` : null,
      })
      .where('id', '=', taskId)
      .execute();
  }

  static async getByProject(projectId) {
    return db
      .selectFrom('tasks')
      .selectAll()
      .where('project_id', '=', projectId)
      .orderBy('created_at', 'desc')
      .execute();
  }

  static async getAssignedTo(userId) {
    return db
      .selectFrom('tasks')
      .selectAll()
      .where('assigned_to', '=', userId)
      .orderBy('created_at', 'desc')
      .execute();
  }
}

module.exports = Task;