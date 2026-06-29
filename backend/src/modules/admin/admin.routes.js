// routes/admin.js
const express = require("express");
const router = express.Router();
const ctrl = require("./controller/admin.controller");
const {
  authenticateToken,
} = require("../../common/middleware/auth.middleware");
router.use(authenticateToken); // apply globally

router.get("/stats", ctrl.getPlatformStats);
router.get("/users", ctrl.getUsers);
router.patch("/users/:id/status", ctrl.updateUserStatus);
router.delete("/users/:id", ctrl.deleteUser);

router.get("/brands/pending-verification", ctrl.getPendingBrandVerifications);
router.patch("/brands/:brandId/verify", ctrl.verifyBrand);

router.get("/moderation/queue", ctrl.getModerationQueue);

module.exports = router;
