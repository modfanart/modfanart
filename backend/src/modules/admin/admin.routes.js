// routes/admin.js
const express = require("express");
const router = express.Router();
const ctrl = require("./controller/admin.controller");
const {
  authenticateToken,
} = require("../../common/middleware/auth.middleware");

// SECURITY: was authenticate-only -> any signed-in user could list/ban/delete
// users and verify brands.
router.use(authenticateToken);
const { requirePermission } = require("../../common/middleware/require-admin");
// Per-permission instead of admin-only, so staff roles from the RBAC matrix work.

router.get("/stats", requirePermission("workspace.access"), ctrl.getPlatformStats);
router.get("/users", requirePermission("users.view"), ctrl.getUsers);
router.patch("/users/:id/status", requirePermission("users.manage"), ctrl.updateUserStatus);
router.delete("/users/:id", requirePermission("users.manage"), ctrl.deleteUser);

router.get("/brands/pending-verification", requirePermission("brands.verify"), ctrl.getPendingBrandVerifications);
router.patch("/brands/:brandId/verify", requirePermission("brands.verify"), ctrl.verifyBrand);

router.get("/moderation/queue", requirePermission("contests.moderate"), ctrl.getModerationQueue);

module.exports = router;
