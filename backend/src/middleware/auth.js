// backend/src/middleware/auth.js
const { verifyToken } = require('../utils/jwt');
const { logger } = require('../utils/logger');

const AUTH_COOKIE_NAME = 'authToken';

// Bypass auth in development (same as your code)
function shouldBypassAuth() {
  return process.env.BYPASS_AUTH === 'true' && process.env.NODE_ENV !== 'production';
}

/**
 * Middleware: Check if request is authenticated
 * Sets req.user if valid token found
 */
function isAuthenticated(req, res, next) {
  // Bypass in dev mode
  if (shouldBypassAuth()) {
    logger.debug('Authentication bypassed (BYPASS_AUTH enabled)');
    req.user = { id: 'demo-user', role: 'user' }; // demo user
    return next();
  }

  // Get token from cookie (same as your Next.js version)
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    logger.debug('No auth token found in cookies');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - No token provided',
    });
  }

  // Verify JWT
  const decoded = verifyToken(token);
  if (!decoded) {
    logger.warn('Invalid or expired token');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid token',
    });
  }

  // Attach user to request
  req.user = {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
  };

  logger.debug('JWT authenticated successfully', { userId: req.user.id });
  next();
}

/**
 * Middleware: Check if user has required role
 * Must be used AFTER isAuthenticated
 */
function requireRole(role) {
  return (req, res, next) => {
    if (shouldBypassAuth()) {
      logger.debug('Role check bypassed (BYPASS_AUTH enabled)');
      return next();
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No user session',
      });
    }

    if (req.user.role !== role) {
      logger.warn('Role check failed', {
        required: role,
        actual: req.user.role,
        userId: req.user.id,
      });
      return res.status(403).json({
        success: false,
        error: `Forbidden - Required role: ${role}`,
      });
    }

    next();
  };
}

/**
 * Middleware: Check if user has ANY of the allowed roles
 * Must be used AFTER isAuthenticated
 */
function requireAnyRole(roles) {
  return (req, res, next) => {
    if (shouldBypassAuth()) {
      logger.debug('Multi-role check bypassed (BYPASS_AUTH enabled)');
      return next();
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No user session',
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Multi-role check failed', {
        required: roles,
        actual: req.user.role,
        userId: req.user.id,
      });
      return res.status(403).json({
        success: false,
        error: `Forbidden - Allowed roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
}

module.exports = {
  isAuthenticated,
  requireRole,
  requireAnyRole,
};