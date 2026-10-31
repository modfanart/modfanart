const express = require("express");
const UserController = require("./controller/user.controller");
const {
  authenticateToken,
  optionalAuth,
} = require("../../common/middleware/auth.middleware");
const { singleAvatarUpload } = require("../../common/middleware/upload");

const router = express.Router();

// ────────────────────────────────────────────────
// ✅ PUBLIC ROUTES (registered before the auth wall)
// ────────────────────────────────────────────────
// Public profiles (/u/<username>) must load for logged-out visitors and on a hard refresh,
// before the browser has restored its Firebase session. A token, when sent, only marks
// whether the profile is the caller's own.
router.get("/by-username/:username", optionalAuth, UserController.getUserByUsername);

// All routes below require authentication
router.use(authenticateToken);

// ────────────────────────────────────────────────
// ✅ CURRENT USER ("me") ROUTES
// ────────────────────────────────────────────────
router.get("/me", UserController.getCurrentUser);
router.patch("/me", UserController.updateProfile);
router.patch("/me/password", UserController.changePassword);

router.post("/me/avatar", singleAvatarUpload("avatar"), UserController.uploadAvatar);
router.delete("/me/avatar", UserController.removeAvatar);

router.get("/me/brands", UserController.getMyBrands);

// ────────────────────────────────────────────────
// ✅ FILTER / LOOKUP ROUTES
// ────────────────────────────────────────────────
router.get("/by-role/:roleSlug", UserController.getAllUsersByRoleSlug);

// ────────────────────────────────────────────────
// ✅ ADMIN / COLLECTION ROUTES
// ────────────────────────────────────────────────
router.get("/all", UserController.getAllUsers);
router.post("/create", UserController.createUser);

// ────────────────────────────────────────────────
// ⚠️ DYNAMIC ROUTES (ALWAYS LAST)
// ────────────────────────────────────────────────
router.get("/:id", UserController.getUserById);
router.patch("/:id/status", UserController.updateUserStatus);
router.patch("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

// ────────────────────────────────────────────────

module.exports = router;
