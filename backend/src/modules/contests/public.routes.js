// src/modules/contests/public.routes.js
//
// The contests module's only unauthenticated surface. Every route in
// contest.routes.js sits behind authenticateToken; this router exists so the
// results share link works for someone with no account at all, which is the
// point of the link. Keep it to token-keyed reads - anything addressable by
// contest id belongs on the authenticated router.

const express = require('express');

const ContestWinnerController = require('./controller/contestWinner.controller');

const router = express.Router();

// GET /api/public/contest-results/:token
router.get('/contest-results/:token', ContestWinnerController.getPublicResults);

module.exports = router;
