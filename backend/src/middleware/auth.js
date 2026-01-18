// backend/src/middleware/auth.js
const { verifyToken } = require('../services/auth.service'); // ← updated import
const { mapRowToUser } = require('../services/auth.service'); // optional — if you want fuller user
const { logger } = require('../utils/logger');

const AUTH_COOKIE_NAME = 'authToken';
const AUTH_HEADER_PREFIX = 'Bearer ';

/**
 * Determines if authentication should be bypassed (dev/testing convenience)
 */
function shouldBypassAuth() {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.BYPASS_AUTH === 'true'
  );
}

/**
 * Main authentication middleware
 * Populates req.user if token is valid
 * Supports:
 *   - Cookie: authToken=...
 *   - Header: Authorization: Bearer <token>
 */
async function isAuthenticated(req, res, next) {
  if (shouldBypassAuth()) {
    logger.debug('Authentication bypassed (dev mode + BYPASS_AUTH=true)');
    req.user = {
      id: 'demo-user-123',
      email: 'demo@example.com',
      role: 'user',
      // Add more mock fields if needed for testing
    };
    return next();
  }

  // 1. Try cookie first (your original priority)
  let token = req.cookies?.[AUTH_COOKIE_NAME];

  // 2. Fallback to Authorization header (very common in APIs)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith(AUTH_HEADER_PREFIX)) {
      token = authHeader.slice(AUTH_HEADER_PREFIX.length).trim();
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'NO_TOKEN',
    });
  }

  try {
    const decoded = verifyToken(token);

    // Optional: fetch full user from DB (if you need more fields like settings, bio, etc.)
    // Comment out / remove if you only need id/email/role in most cases
    const fullUserRow = await req.db // assuming you attach db to req via middleware
      ?.selectFrom('users')
      .selectAll()
      .where('id', '=', decoded.sub || decoded.id)
      .executeTakeFirst();

    req.user = fullUserRow
      ? mapRowToUser(fullUserRow)
      : {
          id: decoded.sub || decoded.id,
          email: decoded.email,
          role: decoded.role,
        };

    logger.debug('User authenticated', {
      userId: req.user.id,
      role: req.user.role,
      authMethod: token === req.cookies?.[AUTH_COOKIE_NAME] ? 'cookie' : 'bearer',
    });

    next();
  } catch (err) {
    logger.warn('Token verification failed', {
      reason: err.message,
      tokenPrefix: token.slice(0, 10) + '...',
    });

    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication',
      code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
    });
  }
}

/**
 * Role guard — single required role
 * Must be used **after** isAuthenticated
 */
function requireRole(requiredRole) {
  return (req, res, next) => {
    if (shouldBypassAuth()) {
      logger.debug('Role check bypassed in dev mode');
      return next();
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_USER_CONTEXT',
      });
    }

    if (req.user.role !== requiredRole) {
      logger.warn('Insufficient permissions', {
        userId: req.user.id,
        required: requiredRole,
        actual: req.user.role,
      });

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_ROLE',
        requiredRole,
      });
    }

    next();
  };
}

/**
 * Role guard — any of the listed roles allowed
 * Must be used **after** isAuthenticated
 *
 * Example: requireAnyRole(['admin', 'artist'])
 */
function requireAnyRole(allowedRoles) {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    throw new Error('requireAnyRole: at least one role must be specified');
  }

  return (req, res, next) => {
    if (shouldBypassAuth()) {
      logger.debug('Multi-role check bypassed in dev mode');
      return next();
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_USER_CONTEXT',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Insufficient permissions (multi-role)', {
        userId: req.user.id,
        requiredAnyOf: allowedRoles,
        actual: req.user.role,
      });

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_ROLE',
        allowedRoles,
      });
    }

    next();
  };
}

module.exports = {
  isAuthenticated,
  requireRole,
  requireAnyRole,
  // Optional aliases for better readability in routes
  authRequired: isAuthenticated,
  restrictTo: requireRole,
  restrictToAny: requireAnyRole,
};