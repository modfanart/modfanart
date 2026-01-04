// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { googleLogin, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

// Google OAuth callback (after user approves on Google)
router.get('/google/callback', googleLogin);

// Protected route: get current user
router.get('/me', authenticate, getMe);

module.exports = router;