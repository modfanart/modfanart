const express = require('express');
const UserController = require('../controller/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const multer = require('multer');

// Temporary in-memory storage — replace with real disk/s3 buffer storage
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// router.use(authenticateToken); // All user routes require auth

router.get('/me', UserController.getCurrentUser);
router.patch('/me', UserController.updateProfile);
router.patch('/me/password', UserController.changePassword);
router.post('/me/avatar', upload.single('avatar'), UserController.uploadAvatar);
router.delete('/me/avatar', UserController.removeAvatar);
router.get('/all', UserController.getAllUsers);
router.get('/:id',  UserController.getUserById);
router.patch('/:id/status', UserController.updateUserStatus);
// Future: router.patch('/me/banner', ...)
// Future: router.post('/me/payout-setup', ...)

module.exports = router;