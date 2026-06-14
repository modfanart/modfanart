// src/middlewares/upload.js

const multer = require('multer');
const path = require('path');

// Allowed file types (you can adjust based on your needs)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/quicktime', // .mov
  'video/webm',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB - adjust as needed

// Multer configuration: store file in memory (buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.map(
          (t) => t.split('/')[1]
        ).join(', ')}`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

// Export different upload middlewares for common use cases

module.exports = {
  // For single image/file upload (e.g. avatar, artwork file)
  singleUpload: (fieldName = 'file') => upload.single(fieldName),

  // For multiple files (e.g. contest submissions with multiple assets)
  multipleUploads: (fieldName = 'files', maxCount = 10) =>
    upload.array(fieldName, maxCount),

  // For mixed fields (e.g. avatar + banner)
  fieldsUpload: (fields) => upload.fields(fields),

  // Raw multer instance if you need custom handling
  multer,
};
