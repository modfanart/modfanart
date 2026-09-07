'use strict';

const express = require('express');

const AuthController = require('./controller/auth.controller');
const WorkspaceAuthController = require('./controller/workspace-auth.controller');

const router = express.Router();

// ========================================
// FIREBASE AUTH
// ========================================

// Called by frontend after Firebase sign-in
// to sync the Firebase user into our local DB.
router.post('/sync', AuthController.sync);

// ========================================
// WORKSPACE AUTH
// ========================================

// Internal email/password login.
// This flow does NOT contact Firebase.
router.post('/workspace/login', WorkspaceAuthController.login);

// Internal refresh — exchanges a valid refresh token for a new
// access token (and a rotated refresh token). This was missing
// entirely, which is why the frontend's refresh call 404'd and
// the UI spun forever.
router.post('/workspace/refresh', WorkspaceAuthController.refresh);

module.exports = router;
