// backend/src/routes/contest.routes.js
const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/contest.controller');
const { isAuthenticated, requireRole } = require('../middleware/auth');

// ─────────────────────────────────────────────
//              Contest Routes (admin only)
// ─────────────────────────────────────────────

router.post('/', isAuthenticated, requireRole('admin'), createContestHandler);
router.get('/:id', getContestByIdHandler);
router.get('/', getActiveContestsHandler);
router.patch('/:id', isAuthenticated, requireRole('admin'), updateContestHandler);
router.delete('/:id', isAuthenticated, requireRole('admin'), deleteContestHandler);

// ─────────────────────────────────────────────
//              Contest Entries Routes
// ─────────────────────────────────────────────

// POST /api/contests/:contestId/entries
router.post('/:contestId/entries', isAuthenticated, createContestEntryHandler);

// GET /api/contests/:contestId/entries
router.get('/:contestId/entries', getContestEntriesHandler);

// GET /api/contests/:contestId/entries/:entryId
router.get('/:contestId/entries/:entryId', getContestEntryByIdHandler);

// PATCH /api/contests/:contestId/entries/:entryId
router.patch('/:contestId/entries/:entryId', isAuthenticated, requireRole('admin'), updateContestEntryHandler);

// DELETE /api/contests/:contestId/entries/:entryId
router.delete('/:contestId/entries/:entryId', isAuthenticated, requireRole('admin'), deleteContestEntryHandler);

module.exports = router;