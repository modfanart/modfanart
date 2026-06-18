// src/routes/cdn.routes.js

const router = require("express").Router();

const CDNController = require("../controllers/cdn.controller");
const upload = require("../middleware/upload.middleware");
const auth = require("../middleware/auth");

router.post("/upload", auth, upload.single("file"), CDNController.uploadFile);

router.get("/", auth, CDNController.listFiles);

router.get("/:id", auth, CDNController.getFileById);

router.delete("/:id", auth, CDNController.deleteFile);

module.exports = router;
