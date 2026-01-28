// src/models/brandPostComment.model.js
const { db } = require('../config');
const { sql } = require('kysely');

/** @typedef {import('../db/types').BrandPostCommentRow} BrandPostCommentRow */

class BrandPostComment {
  static table = 'brand_post_comments';

  static async create(postId, userId, data) {
    const now = sql`NOW()`;

    const comment = await db
      .insertInto('brand_post_comments')
      .values({
        post_id: postId,
        user_id: userId,
        parent_id: data.parent_id ?? null,
        content: data.content,
        likes_count: 0,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // Increment post comment count
    await require('./brandPost.model').incrementComment(postId);

    return comment;
  }

  static async findByPost(postId, options = {}) {
    const { limit = 20, offset = 0, includeReplies = true } = options;

    // Simple flat list for now (you can extend to threaded later)
    let query = db
      .selectFrom('brand_post_comments')
      .selectAll()
      .where('post_id', '=', postId)
      .where('deleted_at', 'is', null)
      .orderBy('created_at', 'asc')
      .limit(limit)
      .offset(offset);

    return query.execute();
  }

  static async softDelete(commentId, userId) {
    const now = sql`NOW()`;

    const deleted = await db
      .updateTable('brand_post_comments')
      .set({
        deleted_at: now,
        updated_at: now,
      })
      .where('id', '=', commentId)
      .where('user_id', '=', userId)           // only author can delete
      .where('deleted_at', 'is', null)
      .returning('post_id')
      .executeTakeFirst();

    if (deleted) {
      await require('./brandPost.model').decrementComment(deleted.post_id);
    }

    return !!deleted;
  }

  static async incrementLike(commentId) {
    return db
      .updateTable('brand_post_comments')
      .set({
        likes_count: sql`likes_count + 1`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', commentId)
      .where('deleted_at', 'is', null)
      .execute();
  }
}

module.exports = BrandPostComment;