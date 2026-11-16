// src/common/middleware/require-admin.js
//
// Who counts as admin / staff, in one place. Use AFTER authenticateToken.
//
//   admin tier : ADMIN, SUPER_ADMIN (or legacy SUPERADMIN), DEVELOPER.
//                Implicitly hold every permission.
//   staff      : admin tier, or any role granted `workspace.access`
//                (e.g. a MODERATOR or FINANCE role built in the RBAC matrix).

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

function isSuperAdmin(user) {
  const r = normaliseRole(user?.role);
  return r === 'SUPER_ADMIN' || r === 'SUPERADMIN';
}

function userCan(user, permission) {
  if (!user) return false;
  if (isAdminUser(user)) return true;
  return user.permissions?.[permission] === true;
}

function isStaffUser(user) {
  return isAdminUser(user) || userCan(user, 'workspace.access');
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (!isAdminUser(req.user)) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
}

/** Admin tier OR an explicit permission. */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (!userCan(req.user, permission)) {
      return res.status(403).json({ error: 'Insufficient permissions', required: permission });
    }
    next();
  };
}

/** Admin tier OR any one of the listed permissions. */
function requireAnyPermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (!permissions.some((p) => userCan(req.user, p))) {
      return res.status(403).json({ error: 'Insufficient permissions', required: permissions });
    }
    next();
  };
}

module.exports = {
  requireAdmin,
  requirePermission,
  requireAnyPermission,
  isAdminUser,
  isSuperAdmin,
  isStaffUser,
  userCan,
  ADMIN_ROLE_NAMES,
  normaliseRole,
};
