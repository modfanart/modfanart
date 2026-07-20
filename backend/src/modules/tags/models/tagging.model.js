// src/models/tagging.model.js
const { db } = require("../../../config");
const { sql } = require("kysely");

class Tagging {
  static async addTag(tagId, taggableType, taggableId, createdBy) {
    const result = await db
      .insertInto("taggings")
      .values({
        tag_id: tagId,
        taggable_type: taggableType,
        taggable_id: taggableId,
        created_by: createdBy,
        created_at: sql`NOW()`,
      })
      // Kysely's onConflict takes a callback. The array form threw
      // "callback is not a function" at query-build time, so every tag
      // attachment failed before reaching the database. Columns match the
      // taggings_pk composite primary key.
      .onConflict((oc) =>
        oc.columns(["tag_id", "taggable_type", "taggable_id"]).doNothing()
      )
      .executeTakeFirst();

    // Report whether a row was actually inserted. The caller uses this to
    // decide whether to count a usage, so replaying the same request cannot
    // inflate usage_count.
    return Number(result?.numInsertedOrUpdatedRows ?? 0) > 0;
  }

  static async removeTag(tagId, taggableType, taggableId) {
    return db
      .deleteFrom("taggings")
      .where("tag_id", "=", tagId)
      .where("taggable_type", "=", taggableType)
      .where("taggable_id", "=", taggableId)
      .execute();
  }

  static async getTagsForEntity(taggableType, taggableId) {
    return db
      .selectFrom("taggings")
      .innerJoin("tags", "tags.id", "taggings.tag_id")
      .select([
        "tags.id",
        "tags.name",
        "tags.slug",
        "tags.approved",
        "taggings.created_at",
        // taggings.created_by is deliberately not selected. This endpoint is
        // public (artwork detail pages render tags while logged out), and the
        // column is a users.id that no client reads.
      ])
      .where("taggings.taggable_type", "=", taggableType)
      .where("taggings.taggable_id", "=", taggableId)
      .execute();
  }
}

module.exports = Tagging;
