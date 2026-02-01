// src/models/brandVerificationRequest.model.js
const { db } = require('../config');
const { sql } = require('kysely');
const { v4: uuidv4 } = require('uuid');

/**
 * @typedef {import('../db/types').BrandVerificationRequestRow} BrandVerificationRequestRow
 */

/**
 * Brand Verification Request Model
 */
class BrandVerificationRequest {
  /**
   * Create a new brand verification request
   * @param {Partial<BrandVerificationRequestRow>} data
   * @returns {Promise<BrandVerificationRequestRow>}
   */
  static async create(data) {
    const id = data.id || uuidv4();

    const [request] = await db
      .insertInto('brand_verification_requests')
      .values({
        id,
        user_id: data.user_id || null,
        company_name: data.company_name,
        website: data.website || null,
        documents: data.documents ? sql`ARRAY[${data.documents.map(d => sql.lit(d))}]::text[]` : null,
        status: data.status || 'pending',
        reviewed_by: data.reviewed_by || null,
        reviewed_at: data.reviewed_at || null,
        notes: data.notes || null,
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .execute();

    return request;
  }

  /**
   * Find a request by ID
   * @param {string} id
   * @returns {Promise<BrandVerificationRequestRow | null>}
   */
  static async findById(id) {
    const [request] = await db
      .selectFrom('brand_verification_requests')
      .selectAll()
      .where('id', '=', id)
      .execute();

    return request || null;
  }

  /**
   * Update a verification request
   * @param {string} id
   * @param {Partial<BrandVerificationRequestRow>} data
   * @returns {Promise<BrandVerificationRequestRow | null>}
   */
  static async update(id, data) {
    const updateData = {
      ...data,
      updated_at: sql`NOW()`,
    };

    // Handle documents array specially if provided
    if (data.documents !== undefined) {
      updateData.documents = data.documents
        ? sql`ARRAY[${data.documents.map(d => sql.lit(d))}]::text[]`
        : null;
    }

    const [updated] = await db
      .updateTable('brand_verification_requests')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .execute();

    return updated || null;
  }

  /**
   * Soft-delete / mark as rejected (optional helper)
   * @param {string} id
   * @param {string} [reviewedBy]
   * @param {string} [notes]
   * @returns {Promise<boolean>}
   */
  static async reject(id, reviewedBy = null, notes = null) {
    const [result] = await db
      .updateTable('brand_verification_requests')
      .set({
        status: 'rejected',
        reviewed_by: reviewedBy,
        reviewed_at: sql`NOW()`,
        notes: notes ? sql`COALESCE(notes || '\n' || ${notes}, ${notes})` : sql`notes`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .returning('id')
      .execute();

    return !!result;
  }

  /**
   * Approve request (status change + optional reviewer)
   * @param {string} id
   * @param {string} reviewedBy
   * @param {string} [notes]
   * @returns {Promise<boolean>}
   */
  static async approve(id, reviewedBy, notes = null) {
    const [result] = await db
      .updateTable('brand_verification_requests')
      .set({
        status: 'approved',
        reviewed_by: reviewedBy,
        reviewed_at: sql`NOW()`,
        notes: notes ? sql`COALESCE(notes || '\n' || ${notes}, ${notes})` : sql`notes`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .returning('id')
      .execute();

    return !!result;
  }

  /**
   * Schedule interview (status change)
   * @param {string} id
   * @param {string} reviewedBy
   * @param {string} [notes]
   * @returns {Promise<boolean>}
   */
  static async scheduleInterview(id, reviewedBy, notes = null) {
    const [result] = await db
      .updateTable('brand_verification_requests')
      .set({
        status: 'interview_scheduled',
        reviewed_by: reviewedBy,
        reviewed_at: sql`NOW()`,
        notes: notes ? sql`COALESCE(notes || '\n' || ${notes}, ${notes})` : sql`notes`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .returning('id')
      .execute();

    return !!result;
  }

  /**
   * List requests with optional filters
   * @param {Object} [options]
   * @param {string} [options.status]
   * @param {number} [options.limit=20]
   * @param {number} [options.offset=0]
   * @param {string} [options.orderBy='created_at']
   * @param {'asc'|'desc'} [options.orderDir='desc']
   * @returns {Promise<BrandVerificationRequestRow[]>}
   */
  static async findAll(options = {}) {
    const {
      status,
      limit = 20,
      offset = 0,
      orderBy = 'created_at',
      orderDir = 'desc',
    } = options;

    let query = db
      .selectFrom('brand_verification_requests')
      .selectAll()
      .orderBy(orderBy, orderDir)
      .limit(limit)
      .offset(offset);

    if (status) {
      query = query.where('status', '=', status);
    }

    return await query.execute();
  }

  /**
   * Count total requests (useful for pagination)
   * @param {Object} [options]
   * @param {string} [options.status]
   * @returns {Promise<number>}
   */
  static async count(options = {}) {
    const { status } = options;

    let query = db
      .selectFrom('brand_verification_requests')
      .select(({ fn }) => fn.countAll().as('total'));

    if (status) {
      query = query.where('status', '=', status);
    }

    const [{ total }] = await query.execute();
    return Number(total);
  }
}

module.exports = BrandVerificationRequest;