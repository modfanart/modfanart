const express = require("express");
const TagController = require("./controller/tag.controller");
const {
  authenticateToken,
} = require("../../common/middleware/auth.middleware");

const router = express.Router();

// The tag vocabulary itself, separate from artwork<->tag attachment which
// lives in tagging.routes.js under /api/artwork/:artworkId/tags.
router.get("/", authenticateToken, TagController.searchTags);

module.exports = router;
