// src/models/brandVerificationRequest.model.js
const { db } = require('../config');
const { sql } = require('kysely');

// Lazy-loaded uuid (fix for uuid ESM-only issue)
let uuidv4;

async function getUuid() {
  if (!uuidv4) {
    const mod = await import('uuid');
    uuidv4 = mod.v4;
  }
  return uuidv4;
}

class BrandVerificationRequest {
  static async create(data) {
    const id = data.id || (await getUuid())();

    const [request] = await db
      .insertInto('brand_verification_requests')
      .values({
        id,
        user_id: data.user_id || null, // Can be null during signup
        company_name: data.company_name,
        website: data.website || null,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        description: data.description || null,
        documents: data.documents ? JSON.stringify(data.documents) : null,
        team_size: data.team_size || null,
        how_heard: data.how_heard || null,

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

  static async update(id, data) {
    const updateData = {
      updated_at: sql`NOW()`,
    };

    if (data.company_name !== undefined)
      updateData.company_name = data.company_name;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.contact_email !== undefined)
      updateData.contact_email = data.contact_email;
    if (data.contact_phone !== undefined)
      updateData.contact_phone = data.contact_phone;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.documents !== undefined) {
      updateData.documents = data.documents
        ? JSON.stringify(data.documents)
        : null;
    }
    if (data.team_size !== undefined) updateData.team_size = data.team_size;
    if (data.how_heard !== undefined) updateData.how_heard = data.how_heard;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.reviewed_by !== undefined)
      updateData.reviewed_by = data.reviewed_by;
    if (data.reviewed_at !== undefined)
      updateData.reviewed_at = data.reviewed_at;

    const [updated] = await db
      .updateTable('brand_verification_requests')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .execute();

    return updated || null;
  }

  static async findById(id) {
    const [request] = await db
      .selectFrom('brand_verification_requests')
      .selectAll()
      .where('id', '=', id)
      .execute();

    return request || null;
  }

  static async reject(id, reviewedBy = null, notes = null) {
    const [result] = await db
      .updateTable('brand_verification_requests')
      .set({
        status: 'rejected',
        reviewed_by: reviewedBy,
        reviewed_at: sql`NOW()`,
        notes: notes
          ? sql`COALESCE(notes || '\n' || ${notes}, ${notes})`
          : sql`notes`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .returning('id')
      .execute();

    return !!result;
  }

  static async approve(id, reviewedBy, notes = null) {
    const [result] = await db
      .updateTable('brand_verification_requests')
      .set({
        status: 'approved',
        reviewed_by: reviewedBy,
        reviewed_at: sql`NOW()`,
        notes: notes
          ? sql`COALESCE(notes || '\n' || ${notes}, ${notes})`
          : sql`notes`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .returning('id')
      .execute();

    return !!result;
  }

  static async scheduleInterview(id, reviewedBy, notes = null) {
    const [result] = await db
      .updateTable('brand_verification_requests')
      .set({
        status: 'interview_scheduled',
        reviewed_by: reviewedBy,
        reviewed_at: sql`NOW()`,
        notes: notes
          ? sql`COALESCE(notes || '\n' || ${notes}, ${notes})`
          : sql`notes`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .returning('id')
      .execute();

    return !!result;
  }

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
      .limit(Number(limit))
      .offset(Number(offset));

    if (status) query = query.where('status', '=', status);

    return await query.execute();
  }

  static async count(options = {}) {
    const { status } = options;

    let query = db
      .selectFrom('brand_verification_requests')
      .select(({ fn }) => fn.countAll().as('total'));

    if (status) query = query.where('status', '=', status);

    const [{ total }] = await query.execute();
    return Number(total);
  }
}

module.exports = BrandVerificationRequest;
