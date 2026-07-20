const express = require("express");
const TaggingController = require("./controller/tagging.controller");
const {
  authenticateToken,
} = require("../../common/middleware/auth.middleware");

const router = express.Router({ mergeParams: true });

// Auth is applied per-route, not via router.use(). This router mounts under
// /api/artwork alongside the public artwork routes, so a router-level guard
// would force authentication onto every artwork request, including the
// public browse endpoints.
//
// Authorization lives in the controller, which checks artwork ownership.
// The previous hasPermission("tags.add"/"tags.remove") guards checked role
// keys that are not granted to any role in the database, so every tag write
// returned 403 regardless of ownership.
router.post("/:artworkId/tags", authenticateToken, TaggingController.addTag);
router.delete(
  "/:artworkId/tags/:tagId",
  authenticateToken,
  TaggingController.removeTag
);
router.get("/:artworkId/tags", authenticateToken, TaggingController.getTags);

module.exports = router;
