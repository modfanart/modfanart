// src/models/brandPost.model.js
const { db } = require('../config');
const { sql } = require('kysely');

/** @typedef {import('../db/types').BrandPostRow} BrandPostRow */
/** @typedef {import('../db/types').BrandPostLikeRow} BrandPostLikeRow */
/** @typedef {import('../db/types').BrandPostUpvoteRow} BrandPostUpvoteRow */

class BrandPost {
  static table = 'brand_posts';

  static async findById(postId, options = {}) {
    const { includeDeleted = false, brandId } = options;

    let query = db
      .selectFrom('brand_posts')
      .selectAll()
      .where('id', '=', postId);

    if (brandId) {
      query = query.where('brand_id', '=', brandId);
    }

    if (!includeDeleted) {
      query = query.where('deleted_at', 'is', null);
    }

    return query.executeTakeFirst();
  }

  static async findByBrand(brandId, options = {}) {
    const {
      limit = 12,
      offset = 0,
      onlyPublished = true,
      includePinnedFirst = true,
    } = options;

    let query = db
      .selectFrom('brand_posts')
      .selectAll()
      .where('brand_id', '=', brandId)
      .where('deleted_at', 'is', null);

    if (onlyPublished) {
      query = query.where('status', '=', 'published');
    }

    if (includePinnedFirst) {
      query = query.orderBy('is_pinned', 'desc');
    }

    query = query.orderBy('created_at', 'desc').limit(limit).offset(offset);

    return query.execute();
  }

  static async create(brandId, data) {
    const now = sql`NOW()`;

    return db
      .insertInto('brand_posts')
      .values({
        brand_id: brandId,
        title: data.title,
        content: data.content ?? null,
        media_urls: data.media_urls ?? null,
        status: data.status ?? 'draft',
        is_pinned: data.is_pinned ?? false,
        likes_count: 0,
        comments_count: 0,
        upvotes_count: 0,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  static async update(postId, brandId, data, ownerId) {
    // We assume brand ownership is checked outside → here we just guard by brand_id
    const now = sql`NOW()`;

    return db
      .updateTable('brand_posts')
      .set({
        title: data.title,
        content: data.content,
        media_urls: data.media_urls,
        status: data.status,
        is_pinned: data.is_pinned,
        updated_at: now,
      })
      .where('id', '=', postId)
      .where('brand_id', '=', brandId)
      .where('deleted_at', 'is', null)
      .returningAll()
      .executeTakeFirst();
  }

  static async softDelete(postId, brandId) {
    const now = sql`NOW()`;

    return db
      .updateTable('brand_posts')
      .set({
        deleted_at: now,
        status: 'archived',
        updated_at: now,
      })
      .where('id', '=', postId)
      .where('brand_id', '=', brandId)
      .execute();
  }

  static async togglePin(postId, brandId, shouldPin = true) {
    const now = sql`NOW()`;

    return db
      .updateTable('brand_posts')
      .set({
        is_pinned: shouldPin,
        updated_at: now,
      })
      .where('id', '=', postId)
      .where('brand_id', '=', brandId)
      .where('deleted_at', 'is', null)
      .execute();
  }

  // ─── Engagement counters ───────────────────────────────────────

  static async incrementLike(postId) {
    return db
      .updateTable('brand_posts')
      .set({
        likes_count: sql`likes_count + 1`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', postId)
      .where('deleted_at', 'is', null)
      .execute();
  }

  static async decrementLike(postId) {
    return db
      .updateTable('brand_posts')
      .set({
        likes_count: sql`GREATEST(likes_count - 1, 0)`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', postId)
      .where('deleted_at', 'is', null)
      .execute();
  }

  static async incrementUpvote(postId, weight = 1) {
    return db
      .updateTable('brand_posts')
      .set({
        upvotes_count: sql`upvotes_count + ${weight}`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', postId)
      .where('deleted_at', 'is', null)
      .execute();
  }

  static async incrementComment(postId) {
    return db
      .updateTable('brand_posts')
      .set({
        comments_count: sql`comments_count + 1`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', postId)
      .execute();
  }

  static async decrementComment(postId) {
    return db
      .updateTable('brand_posts')
      .set({
        comments_count: sql`GREATEST(comments_count - 1, 0)`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', postId)
      .where('deleted_at', 'is', null)
      .execute();
  }
}

module.exports = BrandPost;
