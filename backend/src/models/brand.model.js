// src/models/brand.model.js
const { db } = require('../config');
const { sql } = require('kysely');

/** @typedef {import('../db/types').BrandRow} BrandRow */
/** @typedef {import('../db/types').BrandArtworkRow} BrandArtworkRow */
/** @typedef {import('../db/types').BrandPostRow} BrandPostRow */

class Brand {
  static table = 'brands';

  // ───────────────────────────────────────────────
  // Brand Core
  // ───────────────────────────────────────────────

  static async findById(id, options = {}) {
    const { includeDeleted = false, onlyOwner = false, ownerId } = options;

    let query = db
      .selectFrom('brands')
      .selectAll()
      .where('id', '=', id);

    if (!includeDeleted) {
      query = query.where('deleted_at', 'is', null);
    }

    if (onlyOwner && ownerId) {
      query = query.where('user_id', '=', ownerId);
    }

    const brand = await query.executeTakeFirst();

    if (!brand) return null;

if (options.withArtworks) {
  brand.artworks = await db
    .selectFrom('brand_artworks')
    .innerJoin('artworks', 'artworks.id', 'brand_artworks.artwork_id')
    .select([
      'artworks.id',
      'artworks.title',
      'artworks.description',           // ← add if useful in brand view
      'artworks.thumbnail_url',         // ← add if it exists (common companion field)
      'artworks.status',
      'brand_artworks.is_featured',
      'brand_artworks.sort_order',
      'brand_artworks.added_at',
    ])
    .where('brand_artworks.brand_id', '=', id)
    .orderBy('brand_artworks.sort_order', 'asc')
    // Optional: only show published artworks in brand storefront
    .where('artworks.status', '=', 'published')
    .where('artworks.deleted_at', 'is', null)
    .execute();
}

    // Optional: load recent published posts
    if (options.withPosts) {
      brand.posts = await db
        .selectFrom('brand_posts')
        .selectAll()
        .where('brand_id', '=', id)
        .where('status', '=', 'published')
        .where('deleted_at', 'is', null)
        .orderBy('is_pinned', 'desc')
        .orderBy('created_at', 'desc')
        .limit(12)
        .execute();
    }

    return brand;
  }

static async findBySlug(slug, options = {}) {
  const { withArtworks = false, withPosts = false } = options;

  // 1. Get brand
  const brand = await db
    .selectFrom('brands')
    .selectAll()
    .where('slug', '=', slug)
    .where('deleted_at', 'is', null)
    .executeTakeFirst();

  if (!brand) return null;

  // 2. Attach artworks
  if (withArtworks) {
    const artworks = await db
      .selectFrom('brand_artworks')
      .innerJoin('artworks', 'artworks.id', 'brand_artworks.artwork_id')
      .select([
        'artworks.id',
        'artworks.title',
        'artworks.description',
        'artworks.file_url',
        'artworks.thumbnail_url',
        'artworks.status',
        'brand_artworks.is_featured',
        'brand_artworks.sort_order',
        'brand_artworks.added_at',
      ])
      .where('brand_artworks.brand_id', '=', brand.id)
      .orderBy('brand_artworks.sort_order', 'asc')
      .execute();

    brand.artworks = artworks;
  }

  // 3. Attach posts (if needed)
  if (withPosts) {
    const posts = await db
      .selectFrom('brand_posts')
      .selectAll()
      .where('brand_id', '=', brand.id)
      .where('deleted_at', 'is', null)
      .orderBy('created_at', 'desc')
      .execute();

    brand.posts = posts;
  }

  return brand;
}

  static async create(userId, data) {
    const now = sql`NOW()`;

    return db
      .insertInto('brands')
      .values({
        user_id: userId,
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        logo_url: data.logo_url ?? null,
        banner_url: data.banner_url ?? null,
        website: data.website ?? null,
        social_links: data.social_links ?? null,
        status: data.status ?? 'pending',
        followers_count: 0,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  static async update(id, data, ownerId) {
    const now = sql`NOW()`;

    return db
      .updateTable('brands')
      .set({
        name: data.name,
        slug: data.slug,
        description: data.description,
        logo_url: data.logo_url,
        banner_url: data.banner_url,
        website: data.website,
        social_links: data.social_links,
        status: data.status,
        updated_at: now,
      })
      .where('id', '=', id)
      .where('user_id', '=', ownerId)           // ownership guard
      .where('deleted_at', 'is', null)
      .returningAll()
      .executeTakeFirst();
  }

  static async softDelete(id, ownerId) {
    const now = sql`NOW()`;

    return db
      .updateTable('brands')
      .set({
        deleted_at: now,
        status: 'deactivated',
        updated_at: now,
      })
      .where('id', '=', id)
      .where('user_id', '=', ownerId)
      .execute();
  }

  // ───────────────────────────────────────────────
  // Storefront – Licensed / Owned Artworks
  // ───────────────────────────────────────────────

  static async addArtwork(brandId, artworkId, data = {}, ownerId) {
    // Optional: verify brand ownership first
    const brand = await this.findById(brandId, { onlyOwner: true, ownerId });
    if (!brand) throw new Error('Brand not found or not owned');

    return db
      .insertInto('brand_artworks')
      .values({
        brand_id: brandId,
        artwork_id: artworkId,
        is_featured: data.is_featured ?? false,
        sort_order: data.sort_order ?? 0,
        added_at: sql`NOW()`,
      })
      .onConflict((oc) => oc.doNothing()) // idempotent
      .returningAll()
      .executeTakeFirst();
  }

  static async removeArtwork(brandId, artworkId, ownerId) {
    const brand = await this.findById(brandId, { onlyOwner: true, ownerId });
    if (!brand) throw new Error('Not authorized');

    return db
      .deleteFrom('brand_artworks')
      .where('brand_id', '=', brandId)
      .where('artwork_id', '=', artworkId)
      .execute();
  }

  // ───────────────────────────────────────────────
  // Brand Posts (Timeline)
  // ───────────────────────────────────────────────

  static async createPost(brandId, data, ownerId) {
    const brand = await this.findById(brandId, { onlyOwner: true, ownerId });
    if (!brand) throw new Error('Not authorized');

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

  static async togglePinPost(postId, brandId, ownerId, pin = true) {
    const brand = await this.findById(brandId, { onlyOwner: true, ownerId });
    if (!brand) throw new Error('Not authorized');

    return db
      .updateTable('brand_posts')
      .set({ is_pinned: pin, updated_at: sql`NOW()` })
      .where('id', '=', postId)
      .where('brand_id', '=', brandId)
      .where('deleted_at', 'is', null)
      .execute();
  }

  // ───────────────────────────────────────────────
  // Social – Follow / Like / Upvote / Comment counters
  // ───────────────────────────────────────────────

  static async toggleFollow(brandId, userId, follow = true) {
    if (follow) {
      await db
        .insertInto('brand_followers')
        .values({
          brand_id: brandId,
          user_id: userId,
          followed_at: sql`NOW()`,
        })
        .onConflict((oc) => oc.doNothing())
        .execute();

      await db
        .updateTable('brands')
        .set({ followers_count: sql`followers_count + 1` })
        .where('id', '=', brandId)
        .execute();
    } else {
      const result = await db
        .deleteFrom('brand_followers')
        .where('brand_id', '=', brandId)
        .where('user_id', '=', userId)
        .returning('brand_id')
        .executeTakeFirst();

      if (result) {
        await db
          .updateTable('brands')
          .set({ followers_count: sql`followers_count - 1` })
          .where('id', '=', brandId)
          .execute();
      }
    }
  }

  static async incrementPostLike(postId) {
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

  static async incrementPostUpvote(postId, weight = 1) {
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

  static async incrementPostComment(postId) {
    return db
      .updateTable('brand_posts')
      .set({
        comments_count: sql`comments_count + 1`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', postId)
      .execute();
  }

  // You can add decrement versions when unlike/uncomment happens
}

module.exports = Brand;