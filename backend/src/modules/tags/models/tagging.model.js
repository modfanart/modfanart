// src/models/tagging.model.js
const { db } = require("../../../config");
const { sql } = require("kysely");

class Tagging {
  static async addTag(tagId, taggableType, taggableId, createdBy) {
    return db
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
      .execute();
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
        "taggings.created_by",
      ])
      .where("taggings.taggable_type", "=", taggableType)
      .where("taggings.taggable_id", "=", taggableId)
      .execute();
  }
}

module.exports = Tagging;
