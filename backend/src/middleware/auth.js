// backend/src/middleware/auth.js  → simplified & safer version

async function isAuthenticated(req, res, next) {
  if (shouldBypassAuth()) {
    req.user = { id: 'demo-user-123', email: 'demo@example.com', role: 'user' };
    return next();
  }

  let token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith(AUTH_HEADER_PREFIX)) {
      token = authHeader.slice(AUTH_HEADER_PREFIX.length).trim();
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);

    // Attach **only** what's reliably in the token
    req.user = {
      id: decoded.sub || decoded.userId || decoded.id,
      // Do NOT assume role_id, email, etc. are here — fetch them later if needed
    };

    if (!req.user.id) {
      throw new Error('Token missing user identifier');
    }

    next();
  } catch (err) {
    logger.warn('Auth failed', { reason: err.message });
    const status = err.name === 'TokenExpiredError' ? 401 : 403;
    return res.status(status).json({
      success: false,
      error:
        err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
    });
  }
}
