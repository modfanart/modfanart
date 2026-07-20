// common/middleware/upload.js
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const TEMP_UPLOAD_DIR = process.env.TEMP_UPLOAD_DIR || "/tmp/cdn_uploads";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use temporary directory instead of final storage
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${crypto.randomUUID()}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "video/mp4", "video/quicktime", "video/mov",
      "application/pdf"
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`), false);
    }
  },
});

// Avatars are displayed at thumbnail size, so they get a much tighter cap and
// an image-only allowlist rather than the general upload's media/PDF set.
const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2MB

const avatarUpload = multer({
  storage,
  limits: {
    fileSize: AVATAR_MAX_BYTES,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error("Invalid file type. Allowed: JPG, PNG, GIF, WEBP.");
      err.status = 400;
      cb(err, false);
    }
  },
});

module.exports = {
  singleUpload: (fieldName = "file") => upload.single(fieldName),
  multipleUpload: (fieldName = "files", maxCount = 10) => upload.array(fieldName, maxCount),
  singleAvatarUpload: (fieldName = "avatar") => avatarUpload.single(fieldName),
};