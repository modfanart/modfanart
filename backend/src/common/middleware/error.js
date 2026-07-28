// error.js
const multer = require('multer');

module.exports = (err, req, res, next) => {
  console.error('Global error handler:', err);

  // Rejected uploads (size cap, unexpected field) are client errors, not 500s.
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File is too large.' : err.message;
    return res.status(400).json({ error: message });
  }

  const status = err?.status || 500;
  const message = err?.message || 'Internal Server Error';

  res.status(status).json({ error: message });
};
