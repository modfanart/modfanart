import type { Submission, SubmissionStatus } from '../models/submission';
import { db, DB } from '../config';
import { dbCache, createCacheKey } from '../cache';
import { logger } from '../../utils/logger';
import { sql } from 'kysely';

// Cache TTLs
const CACHE_TTL = {
  SINGLE_SUBMISSION: 60_000, // 1 minute
  USER_SUBMISSIONS: 300_000, // 5 minutes
  STATUS_SUBMISSIONS: 120_000, // 2 minutes
};

export class SubmissionRepository {
  /**
   * Get a submission by ID with caching
   */
  async getById(id: string): Promise<Submission | null> {
    const cacheKey = createCacheKey('submission', { id });

    return dbCache.getOrSet(
      cacheKey,
      async () => {
        const result = await sql<Submission>`
          SELECT * FROM ${sql.table(DB.SUBMISSIONS)} WHERE id = ${id}
        `.execute(db);

        if (result.rows.length === 0) {
          return null;
        }

        return this.mapRowToSubmission(result.rows[0]);
      },
      CACHE_TTL.SINGLE_SUBMISSION
    );
  }

  /**
   * Get submissions by user ID with caching
   */
  async getByUserId(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<{ submissions: Submission[]; total: number }> {
    const cacheKey = createCacheKey('user_submissions', { userId, limit, offset });

    return dbCache.getOrSet(
      cacheKey,
      async () => {
        // Get total count
        const countResult = await sql<{ total: string }>`
          SELECT COUNT(*)::text as total 
          FROM ${sql.table(DB.SUBMISSIONS)} 
          WHERE user_id = ${userId}
        `.execute(db);

        const total = Number(countResult.rows[0]?.total || 0);

        // Get paginated results
        const result = await sql<Submission>`
          SELECT * FROM ${sql.table(DB.SUBMISSIONS)} 
          WHERE user_id = ${userId} 
          ORDER BY submitted_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `.execute(db);

        return {
          submissions: result.rows.map((row) => this.mapRowToSubmission(row)),
          total,
        };
      },
      CACHE_TTL.USER_SUBMISSIONS
    );
  }

  /**
   * Get submissions by status with caching
   */
  async getByStatus(
    status: SubmissionStatus,
    limit = 50,
    offset = 0
  ): Promise<{ submissions: Submission[]; total: number }> {
    const cacheKey = createCacheKey('status_submissions', { status, limit, offset });

    return dbCache.getOrSet(
      cacheKey,
      async () => {
        const countResult = await sql<{ total: string }>`
          SELECT COUNT(*)::text as total 
          FROM ${sql.table(DB.SUBMISSIONS)} 
          WHERE status = ${status}
        `.execute(db);

        const total = Number(countResult.rows[0]?.total || 0);

        const result = await sql<Submission>`
          SELECT * FROM ${sql.table(DB.SUBMISSIONS)} 
          WHERE status = ${status} 
          ORDER BY submitted_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `.execute(db);

        return {
          submissions: result.rows.map((row) => this.mapRowToSubmission(row)),
          total,
        };
      },
      CACHE_TTL.STATUS_SUBMISSIONS
    );
  }

  /**
   * Search submissions with filtering (dynamic conditions)
   */
  async search(params: {
    userId?: string;
    status?: SubmissionStatus;
    category?: string;
    originalIp?: string;
    startDate?: Date;
    endDate?: Date;
    searchTerm?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ submissions: Submission[]; total: number }> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    try {
      let query = db.selectFrom(DB.SUBMISSIONS).selectAll();

      if (params.userId) {
        query = query.where('user_id', '=', params.userId);
      }
      if (params.status) {
        query = query.where('status', '=', params.status);
      }
      if (params.category) {
        query = query.where('category', '=', params.category);
      }
      if (params.originalIp) {
        query = query.where('original_ip', '=', params.originalIp);
      }
      if (params.startDate) {
        query = query.where('submitted_at', '>=', params.startDate);
      }
      if (params.endDate) {
        query = query.where('submitted_at', '<=', params.endDate);
      }
      if (params.searchTerm) {
        const likeTerm = `%${params.searchTerm}%`;
        query = query.where((eb) =>
          eb.or([
            eb('title', 'ilike', likeTerm),
            eb('description', 'ilike', likeTerm),
            eb('original_ip', 'ilike', likeTerm),
          ])
        );
      }

      // Total count
      const countResult = await query
        .select(sql<number>`count(*) over()`.as('total'))
        .limit(1)
        .executeTakeFirst();

      const total = countResult ? Number(countResult.total) : 0;

      // Paginated results
      const result = await query
        .orderBy('submitted_at', 'desc')
        .limit(limit)
        .offset(offset)
        .execute();

      return {
        submissions: result.map((row) => this.mapRowToSubmission(row)),
        total,
      };
    } catch (error: any) {
      logger.error('Failed to search submissions', {
        context: 'submission-repository',
        error,
        data: params,
      });
      throw new Error(`Failed to search submissions: ${error.message}`);
    }
  }

  /**
   * Clear cache for a specific submission
   */
  clearCache(submissionId: string, userId?: string): void {
    dbCache.delete(createCacheKey('submission', { id: submissionId }));

    if (userId) {
      // Clear common pagination variants (you can expand if needed)
      for (let offset = 0; offset < 200; offset += 50) {
        dbCache.delete(createCacheKey('user_submissions', { userId, limit: 50, offset }));
      }
    }

    // Clear status-based caches
    const statuses: SubmissionStatus[] = ['pending', 'review', 'approved', 'rejected', 'licensed'];
    for (const status of statuses) {
      for (let offset = 0; offset < 200; offset += 50) {
        dbCache.delete(createCacheKey('status_submissions', { status, limit: 50, offset }));
      }
    }
  }

  /**
   * Map database row to Submission object
   */
  private mapRowToSubmission(row: any): Submission {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      originalIp: row.original_ip,
      tags: row.tags,
      status: row.status,
      imageUrl: row.image_url,
      licenseType: row.license_type,
      submittedAt: new Date(row.submitted_at),
      updatedAt: new Date(row.updated_at),
      userId: row.user_id,
      analysis: row.analysis,
      reviewNotes: row.review_notes,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
    };
  }
}

// Export singleton
export const submissionRepository = new SubmissionRepository();
