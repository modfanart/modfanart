// src/models/_base.model.js (optional helper)
const { db } = require('../config');

class BaseModel {
  static table = 'table_name';

  static async findById(id) {
    return db
      .selectFrom(this.table)
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
  }

  // ... other common methods
}

module.exports = { BaseModel };