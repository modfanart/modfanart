// src/models/tagging.model.js
const { db } = require('../config');           // ← only db
const { sql } = require('kysely');             // ← ADD THIS LINE

class Tagging {
  static async addTag(tagId, taggableType, taggableId, createdBy) {
    return db
      .insertInto('taggings')
      .values({
        tag_id: tagId,
        taggable_type: taggableType,
        taggable_id: taggableId,
        created_by: createdBy,
        created_at: sql`NOW()`,
      })
      .onConflict(['tag_id', 'taggable_type', 'taggable_id'])
      .doNothing()
      .execute();
  }

  static async removeTag(tagId, taggableType, taggableId) {
    return db
      .deleteFrom('taggings')
      .where('tag_id', '=', tagId)
      .where('taggable_type', '=', taggableType)
      .where('taggable_id', '=', taggableId)
      .execute();
  }

  static async getTagsForEntity(taggableType, taggableId) {
    return db
      .selectFrom('taggings')
      .innerJoin('tags', 'tags.id', 'taggings.tag_id')
      .select([
        'tags.id',
        'tags.name',
        'tags.slug',
        'tags.approved',
        'taggings.created_at',
        'taggings.created_by',
      ])
      .where('taggings.taggable_type', '=', taggableType)
      .where('taggings.taggable_id', '=', taggableId)
      .execute();
  }
}

module.exports = Tagging;