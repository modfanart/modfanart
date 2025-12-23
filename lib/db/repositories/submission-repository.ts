import type { Submission, SubmissionStatus } from "../models/submission"
import { postgresClient, DB } from "../config"
import { dbCache, createCacheKey } from "../cache"
import { logger } from "../../utils/logger"

// Cache TTLs
const CACHE_TTL = {
  SINGLE_SUBMISSION: 60000, // 1 minute
  USER_SUBMISSIONS: 300000, // 5 minutes
  STATUS_SUBMISSIONS: 120000, // 2 minutes
}

export class SubmissionRepository {
  /**
   * Get a submission by ID with caching
   */
  async getById(id: string): Promise<Submission | null> {
    const cacheKey = createCacheKey("submission", { id })

    return dbCache.getOrSet(
      cacheKey,
      async () => {
        const result = await postgresClient.sql`
          SELECT * FROM ${DB.SUBMISSIONS} WHERE id = ${id}
        `

        if (result.rows.length === 0) {
          return null
        }

        return this.mapRowToSubmission(result.rows[0])
      },
      CACHE_TTL.SINGLE_SUBMISSION,
    )
  }

  /**
   * Get submissions by user ID with caching
   */
  async getByUserId(userId: string, limit = 50, offset = 0): Promise<{ submissions: Submission[]; total: number }> {
    const cacheKey = createCacheKey("user_submissions", { userId, limit, offset })

    return dbCache.getOrSet(
      cacheKey,
      async () => {
        // Get total count
        const countResult = await postgresClient.sql`
          SELECT COUNT(*) as total FROM ${DB.SUBMISSIONS} WHERE user_id = ${userId}
        `
        const total = Number.parseInt(countResult.rows[0].total)

        // Get paginated results
        const result = await postgresClient.sql`
          SELECT * FROM ${DB.SUBMISSIONS} 
          WHERE user_id = ${userId} 
          ORDER BY submitted_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `

        return {
          submissions: result.rows.map((row) => this.mapRowToSubmission(row)),
          total,
        }
      },
      CACHE_TTL.USER_SUBMISSIONS,
    )
  }

  /**
   * Get submissions by status with caching
   */
  async getByStatus(
    status: SubmissionStatus,
    limit = 50,
    offset = 0,
  ): Promise<{ submissions: Submission[]; total: number }> {
    const cacheKey = createCacheKey("status_submissions", { status, limit, offset })

    return dbCache.getOrSet(
      cacheKey,
      async () => {
        // Get total count
        const countResult = await postgresClient.sql`
          SELECT COUNT(*) as total FROM ${DB.SUBMISSIONS} WHERE status = ${status}
        `
        const total = Number.parseInt(countResult.rows[0].total)

        // Get paginated results
        const result = await postgresClient.sql`
          SELECT * FROM ${DB.SUBMISSIONS} 
          WHERE status = ${status} 
          ORDER BY submitted_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `

        return {
          submissions: result.rows.map((row) => this.mapRowToSubmission(row)),
          total,
        }
      },
      CACHE_TTL.STATUS_SUBMISSIONS,
    )
  }

  /**
   * Search submissions with filtering
   */
  async search(params: {
    userId?: string
    status?: SubmissionStatus
    category?: string
    originalIp?: string
    startDate?: Date
    endDate?: Date
    searchTerm?: string
    limit?: number
    offset?: number
  }): Promise<{ submissions: Submission[]; total: number }> {
    try {
      const conditions = []
      const values = []
      let index = 1

      if (params.userId) {
        conditions.push(`user_id = $${index++}`)
        values.push(params.userId)
      }

      if (params.status) {
        conditions.push(`status = $${index++}`)
        values.push(params.status)
      }

      if (params.category) {
        conditions.push(`category = $${index++}`)
        values.push(params.category)
      }

      if (params.originalIp) {
        conditions.push(`original_ip = $${index++}`)
        values.push(params.originalIp)
      }

      if (params.startDate) {
        conditions.push(`submitted_at >= $${index++}`)
        values.push(params.startDate)
      }

      if (params.endDate) {
        conditions.push(`submitted_at <= $${index++}`)
        values.push(params.endDate)
      }

      if (params.searchTerm) {
        conditions.push(`(
          title ILIKE $${index} OR 
          description ILIKE $${index} OR 
          original_ip ILIKE $${index}
        )`)
        values.push(`%${params.searchTerm}%`)
        index++
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM ${DB.SUBMISSIONS} 
        ${whereClause}
      `

      const countResult = await postgresClient.query(countQuery, values)
      const total = Number.parseInt(countResult.rows[0].total)

      // Get paginated results
      const limit = params.limit || 50
      const offset = params.offset || 0

      const query = `
        SELECT * 
        FROM ${DB.SUBMISSIONS} 
        ${whereClause} 
        ORDER BY submitted_at DESC 
        LIMIT $${index++} OFFSET $${index++}
      `

      const result = await postgresClient.query(query, [...values, limit, offset])

      return {
        submissions: result.rows.map((row) => this.mapRowToSubmission(row)),
        total,
      }
    } catch (error) {
      logger.error("Failed to search submissions", {
        context: "submission-repository",
        error,
        data: params,
      })
      throw new Error(`Failed to search submissions: ${error.message}`)
    }
  }

  /**
   * Clear cache for a specific submission
   */
  clearCache(submissionId: string, userId?: string): void {
    // Clear specific submission cache
    dbCache.delete(createCacheKey("submission", { id: submissionId }))

    // Clear user submissions cache if userId provided
    if (userId) {
      dbCache.delete(createCacheKey("user_submissions", { userId, limit: 50, offset: 0 }))
    }

    // Clear status submissions caches for all statuses
    const statuses: SubmissionStatus[] = ["pending", "review", "approved", "rejected", "licensed"]
    statuses.forEach((status) => {
      dbCache.delete(createCacheKey("status_submissions", { status, limit: 50, offset: 0 }))
    })
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
    }
  }
}

// Export a singleton instance
export const submissionRepository = new SubmissionRepository()

