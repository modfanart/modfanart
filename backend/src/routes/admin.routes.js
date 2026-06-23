// backend/src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const rateLimit = require('../middleware/rate-limit');
const {
  getAdminSettings,
  postAdminSettings,
} = require('../controllers/admin.controller');

// Rate limit: 500 req/min (same as your code)
const limiter = rateLimit({ windowMs: 60_000, limit: 500 });

// GET /api/admin/settings
router.get('/settings', limiter, getAdminSettings);

// POST /api/admin/settings (read-only message)
router.post('/settings', limiter, postAdminSettings);

module.exports = router;