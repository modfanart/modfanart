// src/modules/screening/screening.routes.js — mounted at /api/screening
//
// Screening-specific resources live here. The human-review surface is separate, at
// /api/moderation, because `moderationApi.ts` on the frontend already owns that namespace for
// user-submitted reports.
const express = require("express");

const ScreeningController = require("./controller/screening.controller");
const { authenticateToken } = require("../../common/middleware/auth.middleware");
const { singleUpload } = require("../../common/middleware/upload");
const {
  requireBrandOrPermission,
  requirePermission,
} = require("./screening.permissions");

const router = express.Router();

// Every route needs an identity; the per-route guards below decide what that identity may do.
router.use(authenticateToken);

// Reading a screening history exposes the provider verdicts behind a moderation decision, so it is
// a moderator/admin view rather than something an artist can poll.
router.get(
  "/runs/:artworkId",
  requirePermission("moderation.review"),
  ScreeningController.getRunsForArtwork
);

router.post(
  "/runs",
  requirePermission("moderation.review"),
  ScreeningController.createRun
);

router.get(
  "/rulesets",
  requireBrandOrPermission("screening.manage", (req) => req.query?.brand_id),
  ScreeningController.listRulesets
);

router.post(
  "/rulesets",
  requireBrandOrPermission("screening.manage", (req) => req.body?.brand_id),
  ScreeningController.createRuleset
);

router.get(
  "/style-guides",
  requireBrandOrPermission("screening.manage", (req) => req.query?.brand_id),
  ScreeningController.listStyleGuides
);

// `singleUpload` runs before the guard would otherwise see req.body: multipart fields are not
// parsed until multer has run, so brand_id is only readable afterwards.
router.post(
  "/style-guides",
  singleUpload("file"),
  requireBrandOrPermission("screening.manage", (req) => req.body?.brand_id),
  ScreeningController.createStyleGuide
);

module.exports = router;
