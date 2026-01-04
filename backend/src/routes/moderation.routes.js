// backend/src/routes/moderation.routes.js
const express = require('express');
const router = express.Router();
const { getModerationMetrics } = require('../controllers/moderation.controller');
const { isAuthenticated, requireRole } = require('../middleware/auth');
const { createModerationSubmission } = require('../controllers/moderation.controller');
const rateLimit = require('../middleware/rate-limit');
// Rate limit: 30 req/min (same as your original)
const limiter = rateLimit({ windowMs: 60_000, limit: 30 });

// POST /api/moderation/submit (protected)
router.post('/submit', limiter, isAuthenticated, createModerationSubmission);

// GET /api/moderation/metrics (admin only)
router.get('/metrics', isAuthenticated, requireRole('admin'), getModerationMetrics);




module.exports = router;