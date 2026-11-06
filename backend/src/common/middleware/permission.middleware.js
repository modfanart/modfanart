// src/middleware/permission.middleware.js
const User = require("../../modules/users/models/user.model");
const Role = require("../../modules/rbac/models/role.model");

// authenticateToken already loads the role's permissions onto req.user (and
// strips role_id from it), so prefer that and only fall back to a role lookup
// when it isn't present. Previously this always did Role.findById(req.user.role_id),
// which was undefined after authenticateToken -> every permission-gated route
// failed with "Role not found".
async function resolvePermissions(user) {
  if (user.permissions && Object.keys(user.permissions).length) {
    return user.permissions;
  }

  if (!user.role_id) return user.permissions || {};

  const role = await Role.findById(user.role_id);
  return role?.permissions || {};
}

/**
 * Middleware factory: checks if current user has specific permission
 */
function hasPermission(permission) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const permissions = await resolvePermissions(req.user);
      const role = { permissions };

      // permission format: "resource.action" e.g. "contests.create"
      const hasPerm = role.permissions?.[permission] === true;

      if (!hasPerm) {
        return res.status(403).json({
          error: "Insufficient permissions",
          required: permission,
          your_permissions: Object.keys(role.permissions || {}).filter(
            (k) => role.permissions[k]
          ),
        });
      }

      next();
    } catch (err) {
      console.error("Permission check error:", err);
      res.status(500).json({ error: "Permission check failed" });
    }
  };
}

/**
 * Alternative: check multiple permissions (any or all)
 */
function hasAnyPermission(...permissions) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const role = { permissions: await resolvePermissions(req.user) };

    const hasAtLeastOne = permissions.some(
      (p) => role.permissions?.[p] === true
    );

    if (!hasAtLeastOne) {
      return res
        .status(403)
        .json({ error: "Missing at least one required permission" });
    }

    next();
  };
}

module.exports = { hasPermission, hasAnyPermission };
