// backend/src/models/contest.js
const { db } = require('../config');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

// Status enum
const ContestStatus = ['draft', 'active', 'paused', 'completed', 'canceled'];

// ─────────────────────────────────────────────
//              CRUD Operations
// ─────────────────────────────────────────────

async function createContest(contestData) {
  const {
    title,
    description,
    startDate,
    endDate,
    prizeDescription,
    maxEntries,
    createdBy, // admin or brand userId
    rules,
    isFeatured = false,
  } = contestData;

  if (!title || !startDate || !endDate || !createdBy) {
    throw new Error('Missing required fields: title, startDate, endDate, createdBy');
  }

  const id = uuidv4();
  const now = new Date();

  const contest = {
    id,
    title,
    description: description || '',
    start_date: new Date(startDate),
    end_date: new Date(endDate),
    prize_description: prizeDescription || '',
    max_entries: maxEntries || null,
    created_by: createdBy,
    rules: rules || [],
    status: 'draft',
    is_featured: isFeatured,
    created_at: now,
    updated_at: now,
  };

  try {
    await db
      .insertInto('contests')
      .values(contest)
      .execute();

    logger.info('Contest created successfully', {
      contestId: id,
      title: contest.title,
      createdBy: contest.created_by,
    });

    return contest;
  } catch (error) {
    logger.error('Failed to create contest', { error: error.message, title });
    throw error;
  }
}

async function getContestById(id) {
  const row = await db
    .selectFrom('contests')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.start_date.toISOString(),
    endDate: row.end_date.toISOString(),
    prizeDescription: row.prize_description,
    maxEntries: row.max_entries,
    createdBy: row.created_by,
    rules: row.rules || [],
    status: row.status,
    isFeatured: !!row.is_featured,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

async function getActiveContests() {
  const rows = await db
    .selectFrom('contests')
    .selectAll()
    .where('status', '=', 'active')
    .where('start_date', '<=', new Date())
    .where('end_date', '>=', new Date())
    .orderBy('is_featured', 'desc')
    .orderBy('start_date', 'asc')
    .execute();

  return rows.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.start_date.toISOString(),
    endDate: row.end_date.toISOString(),
    prizeDescription: row.prize_description,
    maxEntries: row.max_entries,
    createdBy: row.created_by,
    status: row.status,
    isFeatured: !!row.is_featured,
  }));
}

async function updateContest(id, updateData) {
  const now = new Date();

  const updatePayload = {
    updated_at: now,
  };

  if ('title' in updateData) updatePayload.title = updateData.title;
  if ('description' in updateData) updatePayload.description = updateData.description;
  if ('startDate' in updateData) updatePayload.start_date = new Date(updateData.startDate);
  if ('endDate' in updateData) updatePayload.end_date = new Date(updateData.endDate);
  if ('prizeDescription' in updateData) updatePayload.prize_description = updateData.prizeDescription;
  if ('maxEntries' in updateData) updatePayload.max_entries = updateData.maxEntries;
  if ('rules' in updateData) updatePayload.rules = updateData.rules;
  if ('status' in updateData && ContestStatus.includes(updateData.status)) {
    updatePayload.status = updateData.status;
  }
  if ('isFeatured' in updateData) updatePayload.is_featured = !!updateData.isFeatured;

  if (Object.keys(updatePayload).length === 1) {
    // Only updated_at → no real update
    return await getContestById(id);
  }

  await db
    .updateTable('contests')
    .set(updatePayload)
    .where('id', '=', id)
    .execute();

  logger.info('Contest updated', { contestId: id });
  return await getContestById(id);
}

async function deleteContest(id) {
  const result = await db
    .deleteFrom('contests')
    .where('id', '=', id)
    .executeTakeFirst();

  const deleted = Number(result.numDeletedRows) > 0;
  if (deleted) logger.info('Contest deleted', { contestId: id });
  return deleted;
}

module.exports = {
  createContest,
  getContestById,
  getActiveContests,
  updateContest,
  deleteContest,
};