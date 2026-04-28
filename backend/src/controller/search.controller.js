// src/controllers/search.controller.js
const { pool } = require('../config');
const { escapeLike, toTsQueryPrefix } = require('../utils/dbHelpers.util');

/**
 * Global search endpoint
 * GET /api/search?q=query&limit=20&offset=0&type=artwork,user,brand,contest,category,tag
 */
async function globalSearch(req, res) {
  try {
    const { q, limit = 20, offset = 0, type } = req.query;

    if (!q || String(q).trim().length < 2) {
      return res.status(200).json({
        results: [],
        total: 0,
        message: 'Query too short (min 2 characters)',
      });
    }

    const searchTerm = String(q).trim();
    const likeTerm = `%${escapeLike(searchTerm)}%`;
    const tsQuery = toTsQueryPrefix(searchTerm); // better prefix matching

    const allowedTypes = new Set([
      'artwork',
      'user',
      'brand',
      'contest',
      'category',
      'tag',
    ]);

    const requestedTypes = type
      ? new Set(type.split(',').map((t) => t.trim().toLowerCase()))
      : allowedTypes;

    const subQueries = [];
    const params = [];
    let paramIdx = 1;

    // ────────────────────────────────────────────────
    // 1. Artworks
    // ────────────────────────────────────────────────
    if (requestedTypes.has('artwork')) {
      subQueries.push(`
        SELECT
          'artwork' AS type,
          a.id,
          a.title,
          u.username AS subtitle,
          a.thumbnail_url AS image,
          NULL::text AS extra,
          a.created_at
        FROM artworks a
        JOIN users u ON a.creator_id = u.id
        LEFT JOIN artwork_categories ac ON ac.artwork_id = a.id
        LEFT JOIN categories c ON ac.category_id = c.id
        WHERE a.status IN ('published', 'moderation_pending')
          AND (
            a.title ILIKE $${paramIdx}
            OR a.description ILIKE $${paramIdx}
            OR to_tsvector('english', a.title || ' ' || COALESCE(a.description, '')) @@ to_tsquery('english', $${paramIdx + 1})
          )
        GROUP BY a.id, u.id, a.created_at
      `);
      params.push(likeTerm, tsQuery);
      paramIdx += 2;
    }

    // ────────────────────────────────────────────────
    // 2. Users
    // ────────────────────────────────────────────────
    if (requestedTypes.has('user')) {
      subQueries.push(`
        SELECT
          'user' AS type,
          u.id,
          u.username AS title,
          COALESCE(u.profile->>'display_name', u.bio, 'No bio') AS subtitle,
          u.avatar_url AS image,
          NULL::text AS extra,
          u.created_at
        FROM users u
        WHERE u.status = 'active'
          AND (
            u.username ILIKE $${paramIdx}
            OR u.email ILIKE $${paramIdx}
            OR (u.profile->>'display_name')::text ILIKE $${paramIdx}
            OR to_tsvector('english', u.username || ' ' || COALESCE(u.bio, '')) @@ to_tsquery('english', $${paramIdx + 1})
          )
      `);
      params.push(likeTerm, tsQuery);
      paramIdx += 2;
    }

    // ────────────────────────────────────────────────
    // 3. Brands
    // ────────────────────────────────────────────────
    if (requestedTypes.has('brand')) {
      subQueries.push(`
        SELECT
          'brand' AS type,
          b.id,
          b.name AS title,
          COALESCE(b.description, b.website, 'Brand') AS subtitle,
          b.logo_url AS image,
          NULL::text AS extra,
          b.created_at
        FROM brands b
        WHERE b.status = 'active'
          AND (
            b.name ILIKE $${paramIdx}
            OR b.slug ILIKE $${paramIdx}
            OR b.description ILIKE $${paramIdx}
            OR to_tsvector('english', b.name || ' ' || COALESCE(b.description, '')) @@ to_tsquery('english', $${paramIdx + 1})
          )
      `);
      params.push(likeTerm, tsQuery);
      paramIdx += 2;
    }

    // ────────────────────────────────────────────────
    // 4. Contests
    // ────────────────────────────────────────────────
    if (requestedTypes.has('contest')) {
      subQueries.push(`
        SELECT
          'contest' AS type,
          c.id,
          c.title,
          b.name AS subtitle,
          b.logo_url AS image,
          c.prizes::text AS extra,
          c.created_at
        FROM contests c
        JOIN brands b ON c.brand_id = b.id
        WHERE c.status IN ('published', 'live', 'judging')
          AND (
            c.title ILIKE $${paramIdx}
            OR c.description ILIKE $${paramIdx}
            OR to_tsvector('english', c.title || ' ' || c.description) @@ to_tsquery('english', $${paramIdx + 1})
          )
      `);
      params.push(likeTerm, tsQuery);
      paramIdx += 2;
    }

    // ────────────────────────────────────────────────
    // 5. Categories
    // ────────────────────────────────────────────────
    if (requestedTypes.has('category')) {
      subQueries.push(`
        SELECT
          'category' AS type,
          c.id,
          c.name AS title,
          COALESCE(c.description, 'Category') AS subtitle,
          c.icon_url AS image,
          NULL::text AS extra,
          c.created_at
        FROM categories c
        WHERE c.is_active
          AND (
            c.name ILIKE $${paramIdx}
            OR c.slug ILIKE $${paramIdx}
            OR c.description ILIKE $${paramIdx}
          )
      `);
      params.push(likeTerm);
      paramIdx += 1;
    }

    // ────────────────────────────────────────────────
    // 6. Tags
    // ────────────────────────────────────────────────
    if (requestedTypes.has('tag')) {
      subQueries.push(`
        SELECT
          'tag' AS type,
          t.id,
          t.name AS title,
          t.slug AS subtitle,
          NULL::text AS image,
          t.usage_count::text AS extra,
          t.created_at
        FROM tags t
        WHERE t.approved
          AND t.name ILIKE $${paramIdx}
      `);
      params.push(likeTerm);
      paramIdx += 1;
    }

    if (subQueries.length === 0) {
      return res.status(200).json({ results: [], total: 0 });
    }

    const unionQuery = subQueries.join(' UNION ALL ');

    const finalQuery = `
      WITH results AS (
        ${unionQuery}
      )
      SELECT 
        type, id, title, subtitle, image, extra, created_at,
        COUNT(*) OVER () AS total_count
      FROM results
      ORDER BY created_at DESC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    params.push(Number(limit), Number(offset));

    const { rows } = await pool.query(finalQuery, params);

    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

    res.status(200).json({
      results: rows.map((row) => {
        const { total_count, ...result } = row;
        // optional: parse extra if you decide to make it JSON later
        return result;
      }),
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (err) {
    console.error('[globalSearch]', err);
    res.status(500).json({
      error: 'Search failed',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

module.exports = {
  globalSearch,
};
