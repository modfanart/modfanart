const router = require("express").Router();

const CDNController = require("./cdn.controller");
const upload = require("../../common/middleware/upload");
const { authenticateToken } = require("../../common/middleware/auth.middleware");

// ✅ use wrapper you already created
router.post(
  "/upload",
  authenticateToken,
  upload.singleUpload("file"),
  CDNController.uploadFile
);

router.get("/", authenticateToken, CDNController.listFiles);
router.get("/:id", authenticateToken, CDNController.getFileById);
router.delete("/:id", authenticateToken, CDNController.deleteFile);

module.exports = router;