// src/models/tag.model.js
const { db } = require('../../../config'); // ← only db
const { sql } = require('kysely'); // ← ADD THIS LINE

/** @typedef {import('../db/types').TagRow} TagRow */

/**
 * Canonical slug form for a tag name. Kept here so lookup and insert always
 * agree — they previously disagreed, so "Sci Fi" would miss the existing
 * "sci-fi" row and then trip the tags_slug_key unique index on insert.
 */
function slugifyTag(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

class Tag {
  static async findByNameOrSlug(value) {
    const raw = value.trim();
    const slug = slugifyTag(raw);

    return db
      .selectFrom('tags')
      .selectAll()
      .where((eb) =>
        eb.or([eb('name', '=', raw), eb('slug', '=', raw), eb('slug', '=', slug)])
      )
      .executeTakeFirst();
  }

  /**
   * Autocomplete backing for the tag picker. Ordered by usage so the tags
   * people actually apply surface first.
   */
  static async search({ query, limit = 10, approvedOnly = true }) {
    let q = db.selectFrom('tags').selectAll();

    const term = (query || '').trim();
    if (term) {
      // % and _ are LIKE wildcards; without escaping, a search for "a%"
      // matches everything starting with "a".
      const escaped = term.replace(/[\\%_]/g, (ch) => `\\${ch}`);
      const slug = slugifyTag(term);

      q = q.where((eb) => {
        const predicates = [eb('name', 'ilike', `%${escaped}%`)];
        // Only match on slug when the term actually slugifies to something.
        // An all-punctuation or non-latin term slugifies to '', and
        // `slug ilike '%%'` would match every row.
        if (slug) predicates.push(eb('slug', 'ilike', `%${slug}%`));
        return eb.or(predicates);
      });
    }

    if (approvedOnly) q = q.where('approved', '=', true);

    return q.orderBy('usage_count', 'desc').orderBy('name', 'asc').limit(limit).execute();
  }

  static async create(name, slug, creatorId) {
    return db
      .insertInto('tags')
      .values({
        name,
        slug,
        created_by: creatorId,
        approved: false,
        usage_count: 0,
        created_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async approve(tagId, approverId) {
    return db
      .updateTable('tags')
      .set({
        approved: true,
        approved_by: approverId,
      })
      .where('id', '=', tagId)
      .returningAll()
      .executeTakeFirst();
  }

  static async incrementUsage(tagId, increment = 1) {
    return db
      .updateTable('tags')
      // eb.ref().plus() does not exist in kysely 0.28; it threw
      // "eb.ref(...).plus is not a function", which meant selecting any
      // already-existing tag 500'd before the tag could be attached.
      .set({ usage_count: sql`usage_count + ${increment}` })
      .where('id', '=', tagId)
      .execute();
  }
}

module.exports = Tag;
module.exports.slugifyTag = slugifyTag;
