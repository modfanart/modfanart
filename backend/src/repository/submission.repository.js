// backend/src/repositories/submission.repository.js
const { db, DB } = require('../config');
const { logger } = require('../utils/logger');
const { dbCache, createCacheKey } = require('../cache'); // copy this from frontend/lib/cache

// Zod & types (copy from frontend if needed)
const SubmissionStatusEnum = ['pending', 'review', 'approved', 'rejected', 'licensed'];

// ─────────────────────────────────────────────
//              Repository Class
// ─────────────────────────────────────────────

class SubmissionRepository {
  // Cache TTLs (in ms)
  CACHE_TTL = {
    SINGLE_SUBMISSION: 60_000,      // 1 min
    USER_SUBMISSIONS: 300_000,      // 5 min
    STATUS_SUBMISSIONS: 120_000,    // 2 min
  };

  /**
   * Get a submission by ID with caching
   * @param {string} id
   * @returns {Promise<Submission | null>}
   */
  async getById(id) {
    const cacheKey = createCacheKey('submission', { id });

    return dbCache.getOrSet(
      cacheKey,
      async () => {
        const result = await db
          .selectFrom(DB.SUBMISSIONS)
          .selectAll()
          .where('id', '=', id)
          .executeTakeFirst();

        if (!result) return null;
        return this.mapRowToSubmission(result);
      },
      this.CACHE_TTL.SINGLE_SUBMISSION
    );
  }

  /**
   * Get submissions by user ID with pagination & caching
   * @param {string} userId
   * @param {number} [limit=50]
   * @param {number} [offset=0]
   * @returns {Promise<{ submissions: Submission[]; total: number }>}
   */
  async getByUserId(userId, limit = 50, offset = 0) {
    const cacheKey = createCacheKey('user_submissions', { userId, limit, offset });

    return dbCache.getOrSet(
      cacheKey,
      async () => {
        // Count total
        const countResult = await db
          .selectFrom(DB.SUBMISSIONS)
          .select(db.fn.countAll().as('total'))
          .where('user_id', '=', userId)
          .executeTakeFirst();

        const total = Number(countResult?.total || 0);

        // Paginated data
        const rows = await db
          .selectFrom(DB.SUBMISSIONS)
          .selectAll()
          .where('user_id', '=', userId)
          .orderBy('submitted_at', 'desc')
          .limit(limit)
          .offset(offset)
          .execute();

        return {
          submissions: rows.map(row => this.mapRowToSubmission(row)),
          total,
        };
      },
      this.CACHE_TTL.USER_SUBMISSIONS
    );
  }

  /**
   * Get submissions by status with pagination & caching
   * @param {SubmissionStatus} status
   * @param {number} [limit=50]
   * @param {number} [offset=0]
   * @returns {Promise<{ submissions: Submission[]; total: number }>}
   */
  async getByStatus(status, limit = 50, offset = 0) {
    const cacheKey = createCacheKey('status_submissions', { status, limit, offset });

    return dbCache.getOrSet(
      cacheKey,
      async () => {
        // Count total
        const countResult = await db
          .selectFrom(DB.SUBMISSIONS)
          .select(db.fn.countAll().as('total'))
          .where('status', '=', status)
          .executeTakeFirst();

        const total = Number(countResult?.total || 0);

        // Paginated data
        const rows = await db
          .selectFrom(DB.SUBMISSIONS)
          .selectAll()
          .where('status', '=', status)
          .orderBy('submitted_at', 'desc')
          .limit(limit)
          .offset(offset)
          .execute();

        return {
          submissions: rows.map(row => this.mapRowToSubmission(row)),
          total,
        };
      },
      this.CACHE_TTL.STATUS_SUBMISSIONS
    );
  }

  /**
   * Advanced search with dynamic filters
   * @param {Object} params
   * @returns {Promise<{ submissions: Submission[]; total: number }>}
   */
  async search(params = {}) {
    const {
      userId,
      status,
      category,
      originalIp,
      startDate,
      endDate,
      searchTerm,
      limit = 50,
      offset = 0,
    } = params;

    try {
      let query = db.selectFrom(DB.SUBMISSIONS).selectAll();

      if (userId) query = query.where('user_id', '=', userId);
      if (status) query = query.where('status', '=', status);
      if (category) query = query.where('category', '=', category);
      if (originalIp) query = query.where('original_ip', '=', originalIp);
      if (startDate) query = query.where('submitted_at', '>=', startDate);
      if (endDate) query = query.where('submitted_at', '<=', endDate);

      if (searchTerm) {
        const likeTerm = `%${searchTerm}%`;
        query = query.where(eb =>
          eb.or([
            eb('title', 'ilike', likeTerm),
            eb('description', 'ilike', likeTerm),
            eb('original_ip', 'ilike', likeTerm),
          ])
        );
      }

      // Total count (using window function for efficiency)
      const countResult = await query
        .select(db.fn.countAll().over().as('total'))
        .limit(1)
        .executeTakeFirst();

      const total = countResult ? Number(countResult.total) : 0;

      // Paginated results
      const rows = await query
        .orderBy('submitted_at', 'desc')
        .limit(limit)
        .offset(offset)
        .execute();

      return {
        submissions: rows.map(row => this.mapRowToSubmission(row)),
        total,
      };
    } catch (error) {
      logger.error('Failed to search submissions', {
        context: 'submission-repository',
        error: error.message || error,
        params,
      });
      throw new Error(`Failed to search submissions: ${error.message}`);
    }
  }

  /**
   * Clear cache for a submission (useful after create/update/delete)
   * @param {string} submissionId
   * @param {string} [userId]
   */
  clearCache(submissionId, userId) {
    dbCache.delete(createCacheKey('submission', { id: submissionId }));

    if (userId) {
      // Clear common pagination keys (adjust range as needed)
      for (let offset = 0; offset < 1000; offset += 50) {
        dbCache.delete(createCacheKey('user_submissions', { userId, limit: 50, offset }));
      }
    }

    // Clear status-based caches
    const statuses = ['pending', 'review', 'approved', 'rejected', 'licensed'];
    for (const status of statuses) {
      for (let offset = 0; offset < 1000; offset += 50) {
        dbCache.delete(createCacheKey('status_submissions', { status, limit: 50, offset }));
      }
    }
  }

  /**
   * Map DB row to Submission object
   * @private
   */
  mapRowToSubmission(row) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      originalIp: row.original_ip,
      tags: Array.isArray(row.tags) ? row.tags : [],
      status: row.status,
      imageUrl: row.image_url,
      licenseType: row.license_type,
      submittedAt: new Date(row.submitted_at),
      updatedAt: new Date(row.updated_at),
      userId: row.user_id,
      ...(row.analysis ? { analysis: row.analysis } : {}),
      ...(row.review_notes ? { reviewNotes: row.review_notes } : {}),
      ...(row.reviewed_by ? { reviewedBy: row.reviewed_by } : {}),
      ...(row.reviewed_at ? { reviewedAt: new Date(row.reviewed_at) } : {}),
    };
  }
}

// Export singleton instance
module.exports = new SubmissionRepository();