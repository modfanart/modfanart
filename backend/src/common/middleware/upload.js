const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "/opt/cdn/cdn_mod/storage");
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${crypto.randomUUID()}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
});

module.exports = {
  singleUpload: (fieldName) => upload.single(fieldName),
  multipleUpload: (fieldName, maxCount = 10) =>
    upload.array(fieldName, maxCount),
  upload,
};
