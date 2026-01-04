// backend/src/controllers/contest.controller.js
const {
  createContest,
  getContestById,
  getActiveContests,
  updateContest,
  deleteContest,
} = require('../models/contest');

const {
  createContestEntry,
  getEntriesByContestId,
  getEntryById,
  updateContestEntry,
  deleteContestEntry,
} = require('../models/contest-entry');

const { logger } = require('../utils/logger');

// ─────────────────────────────────────────────
//              Existing Contest Handlers
// ─────────────────────────────────────────────

async function createContestHandler(req, res, next) {
  try {
    const contest = await createContest(req.body);
    res.status(201).json({ success: true, data: contest });
  } catch (error) {
    next(error);
  }
}

async function getContestByIdHandler(req, res, next) {
  try {
    const contest = await getContestById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, error: 'Contest not found' });
    res.json({ success: true, data: contest });
  } catch (error) {
    next(error);
  }
}

async function getActiveContestsHandler(req, res, next) {
  try {
    const contests = await getActiveContests();
    res.json({ success: true, contests });
  } catch (error) {
    next(error);
  }
}

async function updateContestHandler(req, res, next) {
  try {
    const contest = await updateContest(req.params.id, req.body);
    if (!contest) return res.status(404).json({ success: false, error: 'Contest not found' });
    res.json({ success: true, data: contest });
  } catch (error) {
    next(error);
  }
}

async function deleteContestHandler(req, res, next) {
  try {
    const deleted = await deleteContest(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Contest not found' });
    res.json({ success: true, message: 'Contest deleted' });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
//              NEW: Contest Entries Handlers
// ─────────────────────────────────────────────

async function createContestEntryHandler(req, res, next) {
  try {
    const entry = await createContestEntry({
      ...req.body,
      contestId: req.params.contestId, // from route param
    });
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
}

async function getContestEntriesHandler(req, res, next) {
  try {
    const entries = await getEntriesByContestId(req.params.contestId);
    res.json({ success: true, entries });
  } catch (error) {
    next(error);
  }
}

async function getContestEntryByIdHandler(req, res, next) {
  try {
    const entry = await getEntryById(req.params.entryId);
    if (!entry) return res.status(404).json({ success: false, error: 'Entry not found' });
    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
}

async function updateContestEntryHandler(req, res, next) {
  try {
    const entry = await updateContestEntry(req.params.entryId, req.body);
    if (!entry) return res.status(404).json({ success: false, error: 'Entry not found' });
    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
}

async function deleteContestEntryHandler(req, res, next) {
  try {
    const deleted = await deleteContestEntry(req.params.entryId);
    if (!deleted) return res.status(404).json({ success: false, error: 'Entry not found' });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createContestHandler,
  getContestByIdHandler,
  getActiveContestsHandler,
  updateContestHandler,
  deleteContestHandler,
  createContestEntryHandler,
  getContestEntriesHandler,
  getContestEntryByIdHandler,
  updateContestEntryHandler,
  deleteContestEntryHandler,
};