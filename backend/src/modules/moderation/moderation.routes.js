// src/modules/moderation/moderation.routes.js — mounted at /api/moderation
//
// The shared human surface: the review queue that screening feeds, plus the user-reporting
// endpoint the frontend already calls. Screening's own resources are at /api/screening.
//
// The previous version of this file could not load: it required `../../common/middleware/auth`
// (the file is `auth.middleware.js` and exports `authenticateToken`/`authorize`, not
// `isAuthenticated`/`requireRole`) and `../middleware/rate-limit`, neither of which exists. It was
// never mounted in index.js, so the breakage stayed invisible.
const express = require("express");
const rateLimit = require("express-rate-limit");

const ModerationController = require("./controller/moderation.controller");
const { authenticateToken } = require("../../common/middleware/auth.middleware");
const { requirePermission } = require("../screening/screening.permissions");

const router = express.Router();

// Reporting is the one endpoint an ordinary user can reach, so it is the one that needs its own
// limit: without it, a single account can flood the review queue.
const reportLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many reports. Please slow down." },
});

router.use(authenticateToken);

router.post("/submit", reportLimiter, ModerationController.submitReport);

router.get(
  "/queue",
  requirePermission("moderation.review"),
  ModerationController.getQueue
);

router.post(
  "/queue/:id/resolve",
  requirePermission("moderation.review"),
  ModerationController.resolveQueueItem
);

router.get(
  "/metrics",
  requirePermission("moderation.review"),
  ModerationController.getMetrics
);

module.exports = router;
