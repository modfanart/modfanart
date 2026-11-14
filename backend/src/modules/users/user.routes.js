const express = require("express");
const UserController = require("./controller/user.controller");
const {
  authenticateToken,
} = require("../../common/middleware/auth.middleware");
const { singleAvatarUpload } = require("../../common/middleware/upload");

const { requireAdmin } = require("../../common/middleware/require-admin");
const { optionalAuth } = require("../../common/middleware/optional-auth");

const router = express.Router();

// Public profile lookup (AUTH-08 / ART-03 / FAN-01 / BRD-01): shareable
// /u/<username> links must work for guests and before the client has
// restored its Firebase token. Registered BEFORE the global auth guard.
router.get("/by-username/:username", optionalAuth, UserController.getUserByUsername);

// Public artist directory (ART-08: /explore and /explore/artists called the
// authenticated, email-returning /users/all and got 401s). Non-admins only
// get public fields; see controller.
router.get("/by-role/:roleSlug", optionalAuth, UserController.getAllUsersByRoleSlug);

// All routes below require authentication
router.use(authenticateToken);

// Brand managers need /users/all for the (search-gated) judge picker.
const BRAND_ROLES = ["BRAND_OWNER", "BRAND_MANAGER", "BRAND_EDITOR", "BRAND_MEMBER"];
const requireAdminOrBrand = (req, res, next) =>
  BRAND_ROLES.includes(String(req.user?.role || "").toUpperCase())
    ? next()
    : requireAdmin(req, res, next);

// ────────────────────────────────────────────────
// ✅ CURRENT USER ("me") ROUTES
// ────────────────────────────────────────────────
router.get("/me", UserController.getCurrentUser);
router.post("/me/consent", UserController.recordConsent);
router.patch("/me", UserController.updateProfile);
router.patch("/me/password", UserController.changePassword);

router.post("/me/avatar", singleAvatarUpload("avatar"), UserController.uploadAvatar);
router.delete("/me/avatar", UserController.removeAvatar);

router.get("/me/brands", UserController.getMyBrands);

// ────────────────────────────────────────────────
// ✅ FILTER / LOOKUP ROUTES
// ────────────────────────────────────────────────

// ────────────────────────────────────────────────
// ✅ ADMIN / COLLECTION ROUTES
// ────────────────────────────────────────────────
router.get("/all", requireAdminOrBrand, UserController.getAllUsers);
router.post("/create", requireAdmin, UserController.createUser);

// ────────────────────────────────────────────────
// ⚠️ DYNAMIC ROUTES (ALWAYS LAST)
// ────────────────────────────────────────────────
router.get("/:id", UserController.getUserById);
router.patch("/:id/status", requireAdmin, UserController.updateUserStatus);
router.patch("/:id", requireAdmin, UserController.updateUser);
router.delete("/:id", requireAdmin, UserController.deleteUser);

// ────────────────────────────────────────────────

module.exports = router;
