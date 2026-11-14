// src/common/middleware/require-admin.js
//
// Single source of truth for "is this an admin-tier account".
// Role names in the DB are not consistent (SUPERADMIN vs SUPER_ADMIN), so we
// normalise before comparing. Use AFTER authenticateToken.

const ADMIN_ROLE_NAMES = ['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN', 'DEVELOPER'];

function normaliseRole(name) {
  return String(name || '')
    .toUpperCase()
    .replace(/[\s-]/g, '_');
}

function isAdminUser(user) {
  if (!user) return false;
  return ADMIN_ROLE_NAMES.includes(normaliseRole(user.role));
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (!isAdminUser(req.user)) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
}

module.exports = { requireAdmin, isAdminUser, ADMIN_ROLE_NAMES, normaliseRole };
