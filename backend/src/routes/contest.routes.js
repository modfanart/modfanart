// src/routes/contest.routes.js
const express = require('express');

const ContestController = require('../controller/contest.controller');
const ContestCategoryController = require('../controller/contestCategory.controller');
const ContestEntryController = require('../controller/contestEntry.controller');
const ContestJudgeController = require('../controller/contestJudge.controller');
const ContestJudgeScoreController = require('../controller/contestJudgeScore.controller');
const ContestVoteController = require('../controller/contestVote.controller');

const { authenticateToken } = require('../middleware/auth.middleware');
// const { hasPermission } = require('../middleware/permission.middleware'); // Commented if not used

const router = express.Router();

// ====================== MIDDLEWARE ======================
// Apply authentication to ALL routes in this router
router.use(authenticateToken);

// ====================== PUBLIC ROUTES ======================
// These routes are protected by auth but data is publicly viewable
router.get('/', ContestController.getContests);
router.get('/by-status', ContestController.getContestsByStatus); // GET /api/contest/by-status
router.get('/my-submitted', ContestController.getMySubmittedContests); // GET /api/contest
router.get('/:id', ContestController.getContest); // GET /api/contest/:id

router.get('/:contestId/leaderboard', ContestVoteController.getLeaderboard);

// ====================== CONTEST MANAGEMENT ======================
// Only brand owners and admins should access these
router.post('/', ContestController.createContest);
router.patch('/:id', ContestController.updateContest);
router.delete('/:id', ContestController.deleteContest);

router.patch('/:id/announce-winners', ContestController.announceWinners);
router.post('/:id/distribute-prizes', ContestController.distributePrizes);

// Brand-specific judges overview (if needed)
router.get(
  '/:brandId/contests/judges',
  ContestController.getAllContestJudgesByBrandId
);

// ====================== JUDGES ROUTES ======================
// Assigning & Managing Judges (Brand Owner / Admin only)
router.post('/:contestId/judges', ContestJudgeController.assignJudge);
router.get('/:contestId/judges', ContestJudgeController.getJudges);
router.delete(
  '/:contestId/judges/:judgeId',
  ContestJudgeController.removeJudge
);

// Judge self-action: Accept invitation
router.patch(
  '/:contestId/judges/:judgeId/accept',
  ContestJudgeController.acceptInvitation
);

// Judge's personal dashboard - contests they are assigned to
router.get('/judge/contests', ContestJudgeController.getAllContestsByJudgeId);

// ====================== CATEGORIES ======================
router.post('/:contestId/categories', ContestCategoryController.addCategory);
router.delete(
  '/:contestId/categories/:categoryId',
  ContestCategoryController.removeCategory
);
router.get('/:contestId/categories', ContestCategoryController.getCategories);

// ====================== ENTRIES ======================
router.post('/:contestId/entries', ContestEntryController.submitEntry);
router.get('/:contestId/entries', ContestEntryController.getEntries);
router.patch(
  '/:contestId/entries/:entryId/status',
  ContestEntryController.updateEntryStatus
);
router.delete(
  '/:contestId/entries/:entryId',
  ContestEntryController.deleteEntry
);

// User's own contest entries
router.get('/me/contest-entries', ContestEntryController.getAllMyEntries);

// ====================== JUDGE SCORING ======================
router.post(
  '/:contestId/entries/:entryId/score',
  ContestJudgeScoreController.submitScore
);
router.get(
  '/:contestId/entries/:entryId/scores',
  ContestJudgeScoreController.getScoresForEntry
);

// ====================== PUBLIC VOTING ======================
router.post('/:contestId/entries/:entryId/vote', ContestVoteController.vote);

module.exports = router;
