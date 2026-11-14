// src/common/middleware/optional-auth.js
//
// For public endpoints that behave slightly differently for a signed-in
// viewer (e.g. "is this my own profile"). If a valid bearer token is present
// req.user is populated exactly as authenticateToken would; otherwise the
// request continues anonymously instead of failing with 401/403.

const { authenticateToken } = require('./auth.middleware');

function optionalAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.split(' ')[1]) return next();

  // Run the real middleware, but treat its 401/403 as "anonymous".
  const fakeRes = {
    status() {
      return this;
    },
    json() {
      req.user = undefined;
      next();
    },
  };
  return authenticateToken(req, fakeRes, next);
}

module.exports = { optionalAuth };
