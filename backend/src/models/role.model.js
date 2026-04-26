// src/models/role.model.js
const { db } = require('../config');

class Role {
  static table = 'roles';

  static async findByName(name) {
    return db
      .selectFrom('roles')
      .selectAll()
      .where('name', '=', name)
      .executeTakeFirst();
  }

  static async findById(id) {
    return db
      .selectFrom('roles')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // You can cache system roles in memory after startup
  static async getSystemRoles() {
    return db
      .selectFrom('roles')
      .selectAll()
      .where('is_system', '=', true)
      .execute();
  }
}

module.exports = Role;
