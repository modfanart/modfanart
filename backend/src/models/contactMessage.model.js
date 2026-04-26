// src/models/contactMessage.model.js
const { db } = require('../config');
const { sql } = require('kysely');

class ContactMessage {
  static table = 'contact_messages';

  static async create(data) {
    const now = sql`NOW()`;

    return db
      .insertInto(this.table)
      .values({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: 'unread',
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  static async findAll() {
    return db
      .selectFrom(this.table)
      .selectAll()
      .where('deleted_at', 'is', null)
      .orderBy('created_at', 'desc')
      .execute();
  }

  static async findById(id) {
    return db
      .selectFrom(this.table)
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
  }

  static async markAsRead(id) {
    return db
      .updateTable(this.table)
      .set({
        status: 'read',
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .execute();
  }

  static async softDelete(id) {
    return db
      .updateTable(this.table)
      .set({
        deleted_at: sql`NOW()`,
        status: 'archived',
      })
      .where('id', '=', id)
      .execute();
  }
}

module.exports = ContactMessage;
