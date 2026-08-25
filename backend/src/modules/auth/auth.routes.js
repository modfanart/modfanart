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

module.exports = router;
