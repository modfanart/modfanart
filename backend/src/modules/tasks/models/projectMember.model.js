const { db } = require('../../../config');
const { sql } = require('kysely');

/** @typedef {import('../db/types').ProjectMemberRow} ProjectMemberRow */

class ProjectMember {
  static async add(projectId, userId, role = 'member') {
    return db
      .insertInto('project_members')
      .values({
        project_id: projectId,
        user_id: userId,
        role,
        joined_at: sql`NOW()`,
      })
      .onConflict((oc) => oc.columns(['project_id', 'user_id']).doUpdateSet({ role }))
      .execute();
  }

  static async getMember(projectId, userId) {
    return db
      .selectFrom('project_members')
      .selectAll()
      .where('project_id', '=', projectId)
      .where('user_id', '=', userId)
      .executeTakeFirst();
  }

  static async getMembers(projectId) {
    return db
      .selectFrom('project_members')
      .selectAll()
      .where('project_id', '=', projectId)
      .execute();
  }

  static async remove(projectId, userId) {
    return db
      .deleteFrom('project_members')
      .where('project_id', '=', projectId)
      .where('user_id', '=', userId)
      .execute();
  }

  static async updateRole(projectId, userId, role) {
    return db
      .updateTable('project_members')
      .set({ role })
      .where('project_id', '=', projectId)
      .where('user_id', '=', userId)
      .execute();
  }

  static async hasAccess(projectId, userId) {
    const member = await this.getMember(projectId, userId);
    return !!member;
  }
}

module.exports = ProjectMember;