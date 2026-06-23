// backend/src/models/contest-entry.js
const { db } = require('../config');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');
const z = require('zod');

// Validation schema for creating/updating an entry
const EntrySchema = z.object({
  contestId: z.string().uuid(),
  userId: z.string().uuid(),
  submissionId: z.string().uuid().optional(), // link to moderated submission
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000).optional(),
  imageUrl: z.string().url().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
});

// ─────────────────────────────────────────────
//              CRUD Operations
// ─────────────────────────────────────────────

async function createContestEntry(entryData) {
  const validation = EntrySchema.safeParse(entryData);
  if (!validation.success) {
    throw new Error(`Invalid entry data: ${JSON.stringify(validation.error.issues)}`);
  }

  const {
    contestId,
    userId,
    submissionId,
    title,
    description,
    imageUrl,
  } = validation.data;

  const id = uuidv4();
  const now = new Date();

  const entry = {
    id,
    contest_id: contestId,
    user_id: userId,
    submission_id: submissionId || null,
    title,
    description: description || '',
    image_url: imageUrl || null,
    status: 'pending',
    created_at: now,
    updated_at: now,
  };

  try {
    await db
      .insertInto('contest_entries')
      .values(entry)
      .execute();

    logger.info('Contest entry created', {
      entryId: id,
      contestId,
      userId,
      title,
    });

    return entry;
  } catch (error) {
    logger.error('Failed to create contest entry', { error: error.message });
    throw error;
  }
}

async function getEntriesByContestId(contestId) {
  const rows = await db
    .selectFrom('contest_entries')
    .selectAll()
    .where('contest_id', '=', contestId)
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map(row => ({
    id: row.id,
    contestId: row.contest_id,
    userId: row.user_id,
    submissionId: row.submission_id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }));
}

async function getEntryById(id) {
  const row = await db
    .selectFrom('contest_entries')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!row) return null;

  return {
    id: row.id,
    contestId: row.contest_id,
    userId: row.user_id,
    submissionId: row.submission_id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

async function updateContestEntry(id, updateData) {
  const now = new Date();

  const updatePayload = { updated_at: now };

  if ('title' in updateData) updatePayload.title = updateData.title;
  if ('description' in updateData) updatePayload.description = updateData.description;
  if ('imageUrl' in updateData) updatePayload.image_url = updateData.imageUrl;
  if ('status' in updateData && ['pending', 'approved', 'rejected'].includes(updateData.status)) {
    updatePayload.status = updateData.status;
  }

  if (Object.keys(updatePayload).length === 1) {
    return await getEntryById(id); // no real change
  }

  await db
    .updateTable('contest_entries')
    .set(updatePayload)
    .where('id', '=', id)
    .execute();

  logger.info('Contest entry updated', { entryId: id });
  return await getEntryById(id);
}

async function deleteContestEntry(id) {
  const result = await db
    .deleteFrom('contest_entries')
    .where('id', '=', id)
    .executeTakeFirst();

  const deleted = Number(result.numDeletedRows) > 0;
  if (deleted) logger.info('Contest entry deleted', { entryId: id });
  return deleted;
}

module.exports = {
  createContestEntry,
  getEntriesByContestId,
  getEntryById,
  updateContestEntry,
  deleteContestEntry,
};