// src/middleware/permission.middleware.js
const User = require('../models/user.model');
const Role = require('../models/role.model');

/**
 * Middleware factory: checks if current user has specific permission
 * Example: app.get('/contests', hasPermission('contests.create'), ...)
 */
function hasPermission(permission) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const role = await Role.findById(req.user.role_id);
      if (!role) {
        return res.status(403).json({ error: 'Role not found' });
      }

      // permission format: "resource.action" e.g. "contests.create"
      const hasPerm = role.permissions?.[permission] === true;

      if (!hasPerm) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: permission,
          your_permissions: Object.keys(role.permissions || {}).filter(
            (k) => role.permissions[k]
          ),
        });
      }

      next();
    } catch (err) {
      console.error('Permission check error:', err);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Alternative: check multiple permissions (any or all)
 */
function hasAnyPermission(...permissions) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const role = await Role.findById(req.user.role_id);
    if (!role) return res.status(403).json({ error: 'Role not found' });

    const hasAtLeastOne = permissions.some(
      (p) => role.permissions?.[p] === true
    );

    if (!hasAtLeastOne) {
      return res
        .status(403)
        .json({ error: 'Missing at least one required permission' });
    }

    next();
  };
}

module.exports = { hasPermission, hasAnyPermission };
