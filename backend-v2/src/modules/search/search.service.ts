import { Injectable } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { Kysely } from 'kysely';
import { DB } from '../../db/types'; // your generated DB types
import {
  escapeLike,
  toTsQueryPrefix,
} from '../../common/utils/db-helpers.util';

@Injectable()
export class SearchService {
  constructor(@InjectKysely() private readonly db: Kysely<DB>) {}

  async globalSearch(query: {
    q: string;
    limit?: number;
    offset?: number;
    type?: string[];
  }) {
    const { q, limit = 20, offset = 0, type } = query;
    const searchTerm = q.trim();

    if (searchTerm.length < 2) {
      return {
        results: [],
        total: 0,
        message: 'Query too short (min 2 characters)',
      };
    }

    const likeTerm = `%${escapeLike(searchTerm)}%`;
    const tsQuery = toTsQueryPrefix(searchTerm);

    const allowedTypes = [
      'artwork',
      'user',
      'brand',
      'contest',
      'category',
      'tag',
    ];
    const requestedTypes = type?.length ? new Set(type) : new Set(allowedTypes);

    const subQueries: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // 1. Artworks
    if (requestedTypes.has('artwork')) {
      subQueries.push(`
        SELECT 
          'artwork' AS type,
          a.id,
          a.title,
          u.username AS subtitle,
          a.thumbnail_url AS image,
          NULL AS extra,
          a.created_at
        FROM artworks a
        JOIN users u ON a.creator_id = u.id
        WHERE a.status IN ('published', 'moderation_pending')
          AND (
            a.title ILIKE $${paramIndex}
            OR a.description ILIKE $${paramIndex}
            OR to_tsvector('english', COALESCE(a.title, '') || ' ' || COALESCE(a.description, '')) 
               @@ to_tsquery('english', $${paramIndex + 1})
          )
      `);
      params.push(likeTerm, tsQuery);
      paramIndex += 2;
    }

    // 2. Users
    if (requestedTypes.has('user')) {
      subQueries.push(`
        SELECT 
          'user' AS type,
          u.id,
          u.username AS title,
          COALESCE((u.profile->>'display_name')::text, u.bio, '') AS subtitle,
          u.avatar_url AS image,
          NULL AS extra,
          u.created_at
        FROM users u
        WHERE u.status = 'active'
          AND (
            u.username ILIKE $${paramIndex}
            OR (u.profile->>'display_name')::text ILIKE $${paramIndex}
            OR to_tsvector('english', u.username || ' ' || COALESCE(u.bio, '')) 
               @@ to_tsquery('english', $${paramIndex + 1})
          )
      `);
      params.push(likeTerm, tsQuery);
      paramIndex += 2;
    }

    // 3. Brands
    if (requestedTypes.has('brand')) {
      subQueries.push(`
        SELECT 
          'brand' AS type,
          b.id,
          b.name AS title,
          COALESCE(b.description, b.website, '') AS subtitle,
          b.logo_url AS image,
          NULL AS extra,
          b.created_at
        FROM brands b
        WHERE b.status = 'active'
          AND (
            b.name ILIKE $${paramIndex}
            OR b.description ILIKE $${paramIndex}
            OR to_tsvector('english', b.name || ' ' || COALESCE(b.description, '')) 
               @@ to_tsquery('english', $${paramIndex + 1})
          )
      `);
      params.push(likeTerm, tsQuery);
      paramIndex += 2;
    }

    // 4. Contests
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
            c.title ILIKE $${paramIndex}
            OR c.description ILIKE $${paramIndex}
            OR to_tsvector('english', c.title || ' ' || COALESCE(c.description, '')) 
               @@ to_tsquery('english', $${paramIndex + 1})
          )
      `);
      params.push(likeTerm, tsQuery);
      paramIndex += 2;
    }

    // 5. Categories
    if (requestedTypes.has('category')) {
      subQueries.push(`
        SELECT 
          'category' AS type,
          c.id,
          c.name AS title,
          COALESCE(c.description, '') AS subtitle,
          c.icon_url AS image,
          NULL AS extra,
          c.created_at
        FROM categories c
        WHERE c.is_active = true
          AND (c.name ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})
      `);
      params.push(likeTerm);
      paramIndex += 1;
    }

    // 6. Tags
    if (requestedTypes.has('tag')) {
      subQueries.push(`
        SELECT 
          'tag' AS type,
          t.id,
          t.name AS title,
          t.slug AS subtitle,
          NULL AS image,
          t.usage_count::text AS extra,
          t.created_at
        FROM tags t
        WHERE t.approved = true
          AND t.name ILIKE $${paramIndex}
      `);
      params.push(likeTerm);
      paramIndex += 1;
    }

    if (subQueries.length === 0) {
      return { results: [], total: 0 };
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
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(Number(limit), Number(offset));

    const rows = await this.db
      .executeQuery({
        query: finalQuery,
        parameters: params,
      })
      .then((res) => res.rows);

    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

    return {
      results: rows.map(({ total_count, ...item }) => item),
      total,
      limit: Number(limit),
      offset: Number(offset),
    };
  }
}
