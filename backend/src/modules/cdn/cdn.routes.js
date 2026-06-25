// routes/cdn.routes.js
const router = require("express").Router();
const CDNController = require("./cdn.controller");
const { singleUpload } = require("../../common/middleware/upload");
const { authenticateToken } = require("../../common/middleware/auth.middleware");

router.post(
  "/upload",
  authenticateToken,
  singleUpload("file"),
  CDNController.uploadFile
);

router.get("/", authenticateToken, CDNController.listFiles);
router.get("/:id", authenticateToken, CDNController.getFileById);
router.delete("/:id", authenticateToken, CDNController.deleteFile);

module.exports = router;