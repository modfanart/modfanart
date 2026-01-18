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

// Public
router.get('/', ContestController.getContests);
router.get('/:id', ContestController.getContest);
router.get('/:contestId/leaderboard', ContestVoteController.getLeaderboard);

// Auth required below
// router.use(authenticateToken);

// Contest management
router.post('/', hasPermission('contests.create'), ContestController.createContest);
router.patch('/:id', hasPermission('contests.update'), ContestController.updateContest);
router.delete('/:id', hasPermission('contests.delete'), ContestController.deleteContest);

// Categories
router.post('/:contestId/categories', hasPermission('contests.update'), ContestCategoryController.addCategory);
router.delete('/:contestId/categories/:categoryId', hasPermission('contests.update'), ContestCategoryController.removeCategory);
router.get('/:contestId/categories', ContestCategoryController.getCategories);

// Entries
router.post('/:contestId/entries', hasPermission('contests.enter'), ContestEntryController.submitEntry);
router.get('/:contestId/entries', ContestEntryController.getEntries);
router.patch('/:contestId/entries/:entryId/status', hasPermission('contests.moderate'), ContestEntryController.updateEntryStatus);

// Judges
router.post('/:contestId/judges', hasPermission('contests.manage_judges'), ContestJudgeController.inviteJudge);
router.patch('/:contestId/judges/:judgeId/accept', ContestJudgeController.acceptInvitation);
router.get('/:contestId/judges', ContestJudgeController.getJudges);
router.delete('/:contestId/judges/:judgeId', hasPermission('contests.manage_judges'), ContestJudgeController.removeJudge);

// Judge Scoring
router.post('/:contestId/entries/:entryId/score', hasPermission('contests.judge'), ContestJudgeScoreController.submitScore);
router.get('/:contestId/entries/:entryId/scores', hasPermission('contests.view_scores'), ContestJudgeScoreController.getScoresForEntry);

// Voting
router.post('/:contestId/entries/:entryId/vote', hasPermission('contests.vote'), ContestVoteController.vote);

// Winner & Prizes
router.patch('/:id/announce-winners', hasPermission('contests.manage'), ContestController.announceWinners);
router.post('/:id/distribute-prizes', hasPermission('contests.manage'), ContestController.distributePrizes);

module.exports = router;