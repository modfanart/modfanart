// src/models/cdnFile.model.js
const { db, sql } = require("../../../config");

class CDNFile {
  static async create({
    original_name,
    stored_name,
    mime_type,
    extension = null,
    size,
    url,
    path,
    uploaded_by = null,
  }) {
    const [record] = await db
      .insertInto("cdn_files")
      .values({
        original_name,
        stored_name,
        mime_type,
        extension,
        size,
        url,
        path,
        uploaded_by,
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .execute();

    return record;
  }

  static async findById(id) {
    return db
      .selectFrom("cdn_files")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  static async findByStoredName(storedName) {
    return db
      .selectFrom("cdn_files")
      .selectAll()
      .where("stored_name", "=", storedName)
      .executeTakeFirst();
  }

  static async list({ limit = 50, offset = 0 } = {}) {
    return db
      .selectFrom("cdn_files")
      .selectAll()
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset)
      .execute();
  }

  static async listByUser(userId, { limit = 50, offset = 0 } = {}) {
    return db
      .selectFrom("cdn_files")
      .selectAll()
      .where("uploaded_by", "=", userId)
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset)
      .execute();
  }

  static async update(id, payload) {
    const [record] = await db
      .updateTable("cdn_files")
      .set({
        ...payload,
        updated_at: sql`NOW()`,
      })
      .where("id", "=", id)
      .returningAll()
      .execute();

    return record;
  }

  static async delete(id) {
    return db.deleteFrom("cdn_files").where("id", "=", id).execute();
  }

  static async count() {
    return db
      .selectFrom("cdn_files")
      .select(({ fn }) => [fn.count("id").as("total")])
      .executeTakeFirst();
  }
}

module.exports = CDNFile;
