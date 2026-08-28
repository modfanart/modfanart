// src/routes/contest.routes.js
const express = require('express');

const ContestController = require('./controller/contest.controller');
const ContestCategoryController = require('./controller/contestCategory.controller');
const ContestEntryController = require('./controller/contestEntry.controller');
const ContestJudgeController = require('./controller/contestJudge.controller');
const ContestJudgeScoreController = require('./controller/contestJudgeScore.controller');
const ContestVoteController = require('./controller/contestVote.controller');
const ContestWinnerController = require('./controller/contestWinner.controller');

const {
  authenticateToken,
} = require('../../common/middleware/auth.middleware');
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

// Winner selection feeds announce-winners/distribute-prizes above: it is what
// writes the status='winner' + rank rows those endpoints read.
router.put('/:contestId/winners', ContestWinnerController.selectWinners);
router.post(
  '/:contestId/results-share-link',
  ContestWinnerController.getResultsShareLink
);
// Post-selection licensing tracking for winners; brand owner or
// contests.manage only (enforced in the controller). 'finalized' here is what
// admits the artwork to the public gallery.
router.patch(
  '/:contestId/entries/:entryId/licensing-status',
  ContestWinnerController.updateLicensingStatus
);

// Brand-specific judges overview (if needed)
router.get(
  '/:brandId/contests/judges',
  ContestController.getAllContestJudgesByBrandId
);

// ====================== JUDGES ROUTES ======================
// Assigning & Managing Judges (Brand Owner / Admin only)
router.post('/:contestId/judges', ContestJudgeController.assignJudge);
router.get('/:contestId/judges', ContestJudgeController.getJudges);
router.get('/judge/invitations', ContestJudgeController.getPendingInvitations);
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

router.post(
  '/:contestId/judges/:judgeId/invite-link',
  ContestJudgeController.generateInviteLink
);
router.post(
  '/:contestId/judges/self-assign-link',
  ContestJudgeController.generateSelfAssignLink
);
router.post(
  '/:contestId/judges/open-link',
  ContestJudgeController.generateOpenLink
);
router.post(
  '/judge-invite/:token/redeem',
  ContestJudgeController.redeemInviteLink
);

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
router.get('/:contestId/entries/:entryId', ContestEntryController.getEntry);
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
// The signed-in judge's own scores for this contest. The frontend has defined
// useGetMyJudgeScoresQuery against this path since before it existed.
router.get('/:contestId/my-scores', ContestJudgeScoreController.getMyScores);

// ====================== PUBLIC VOTING ======================
router.post('/:contestId/entries/:entryId/vote', ContestVoteController.vote);

module.exports = router;
