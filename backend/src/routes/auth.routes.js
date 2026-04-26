const express = require('express');
const AuthController = require('../controller/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.get('/verify-email', AuthController.verifyEmail);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/logout', AuthController.logout);

module.exports = router;
