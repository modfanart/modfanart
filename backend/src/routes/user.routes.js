const express = require('express');
const UserController = require('../controller/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ────────────────────────────────────────────────
// ✅ CURRENT USER ("me") ROUTES
// ────────────────────────────────────────────────
router.get('/me', UserController.getCurrentUser);
router.patch('/me', UserController.updateProfile);
router.patch('/me/password', UserController.changePassword);

router.post('/me/avatar', upload.single('avatar'), UserController.uploadAvatar);
router.delete('/me/avatar', UserController.removeAvatar);

router.get('/me/brands', UserController.getMyBrands);

// ────────────────────────────────────────────────
// ✅ FILTER / LOOKUP ROUTES
// ────────────────────────────────────────────────
router.get('/by-username/:username', UserController.getUserByUsername);
router.get('/by-role/:roleSlug', UserController.getAllUsersByRoleSlug);

// ────────────────────────────────────────────────
// ✅ ADMIN / COLLECTION ROUTES
// ────────────────────────────────────────────────
router.get('/all', UserController.getAllUsers);
router.post('/create', UserController.createUser);

// ────────────────────────────────────────────────
// ⚠️ DYNAMIC ROUTES (ALWAYS LAST)
// ────────────────────────────────────────────────
router.get('/:id', UserController.getUserById);
router.patch('/:id/status', UserController.updateUserStatus);
router.patch('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

// ────────────────────────────────────────────────

module.exports = router;
