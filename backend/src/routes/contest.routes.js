// src/routes/contest.routes.js
const express = require('express');
const ContestController = require('../controller/contest.controller');
const ContestCategoryController = require('../controller/contestCategory.controller');
const ContestEntryController = require('../controller/contestEntry.controller');
const ContestJudgeController = require('../controller/contestJudge.controller');
const ContestJudgeScoreController = require('../controller/contestJudgeScore.controller');
const ContestVoteController = require('../controller/contestVote.controller');

const { authenticateToken } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

const router = express.Router();
router.use(authenticateToken); // All user routes require auth

// Public
router.get('/', ContestController.getContests);
router.get('/:id', ContestController.getContest);
router.get('/:contestId/leaderboard', ContestVoteController.getLeaderboard);

// Auth required below
// router.use(authenticateToken);

// Contest management
router.post('/',  ContestController.createContest);
router.patch('/:id',  ContestController.updateContest);
router.delete('/:id', ContestController.deleteContest);

// Categories
router.post('/:contestId/categories', ContestCategoryController.addCategory);
router.delete('/:contestId/categories/:categoryId',  ContestCategoryController.removeCategory);
router.get('/:contestId/categories', ContestCategoryController.getCategories);

// Entries
router.post('/:contestId/entries', ContestEntryController.submitEntry);
router.get('/:contestId/entries', ContestEntryController.getEntries);
router.patch('/:contestId/entries/:entryId/status',  ContestEntryController.updateEntryStatus);

// Judges
router.post('/:contestId/judges', ContestJudgeController.inviteJudge);
router.patch('/:contestId/judges/:judgeId/accept', ContestJudgeController.acceptInvitation);
router.get('/:contestId/judges', ContestJudgeController.getJudges);
router.delete('/:contestId/judges/:judgeId', ContestJudgeController.removeJudge);

// Judge Scoring
router.post('/:contestId/entries/:entryId/score',  ContestJudgeScoreController.submitScore);
router.get('/:contestId/entries/:entryId/scores',  ContestJudgeScoreController.getScoresForEntry);

// Voting
router.post('/:contestId/entries/:entryId/vote',  ContestVoteController.vote);

// Winner & Prizes
router.patch('/:id/announce-winners',  ContestController.announceWinners);
router.post('/:id/distribute-prizes', ContestController.distributePrizes);

module.exports = router;