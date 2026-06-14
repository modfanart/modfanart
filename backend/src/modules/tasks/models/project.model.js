const { db } = require('../../../config');
const { sql } = require('kysely');

/** @typedef {import('../db/types').ProjectRow} ProjectRow */

class Project {
  static async create(userId, data) {
    return db
      .insertInto('projects')
      .values({
        created_by: userId,
        ...data,
        is_active: true,
        created_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async findById(id) {
    return db
      .selectFrom('projects')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static async update(id, data) {
    return db
      .updateTable('projects')
      .set({
        ...data,
        // Do not allow updating created_by
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  static async getUserProjects(userId) {
    return db
      .selectFrom('project_members')
      .innerJoin('projects', 'projects.id', 'project_members.project_id')
      .selectAll('projects')
      .where('project_members.user_id', '=', userId)
      .where('projects.is_active', '=', true)
      .orderBy('projects.created_at', 'desc')
      .execute();
  }

  static async delete(id) {
    return db
      .updateTable('projects')
      .set({ is_active: false })
      .where('id', '=', id)
      .execute();
  }
}

module.exports = Project;