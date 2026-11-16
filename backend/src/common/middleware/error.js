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

  // Invalid UUID / bad input reaching Postgres is a client error, not a 500.
  if (err?.code === '22P02') {
    return res.status(400).json({ error: 'Invalid identifier' });
  }

  const status = err?.status || err?.statusCode || 500;
  // Don't leak internal error text (SQL, stack details) on 5xx in production.
  const message =
    status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err?.message || 'Internal Server Error';

  res.status(status).json({ error: message });
};
