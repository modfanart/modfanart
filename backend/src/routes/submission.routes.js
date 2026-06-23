// backend/src/routes/submission.routes.js
const express = require('express');
const router = express.Router();
const {
  getSubmissionByIdHandler,
  getSubmissionsByUserIdHandler,
  getSubmissionsByStatusHandler,
  searchSubmissionsHandler,
} = require('../controllers/submission.controller');
const rateLimit = require('../middleware/rate-limit');
// Rate limit: 10 req/min for analysis (same as your original)
const analysisLimiter = rateLimit({ windowMs: 60_000, limit: 10 });
// GET /api/submissions/:id
router.get('/:id', getSubmissionByIdHandler);

// GET /api/submissions/user/:userId
router.get('/user/:userId', getSubmissionsByUserIdHandler);

// GET /api/submissions/status?status=...
router.get('/status', getSubmissionsByStatusHandler);

// GET /api/submissions/search (advanced filters via query params)
router.get('/search', searchSubmissionsHandler);
// POST /api/submissions/analyze
router.post('/analyze', analysisLimiter, analyzeSubmission);
// Placeholder for create/update/delete (add when ready)
// router.post('/', createSubmissionHandler);
// router.patch('/:id', updateSubmissionHandler);
// router.delete('/:id', deleteSubmissionHandler);

module.exports = router;