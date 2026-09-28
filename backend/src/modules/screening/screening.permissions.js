// Authorisation for the screening and moderation routes.
//
// Deliberately not `hasPermission()` from src/common/middleware/permission.middleware.js: that one
// reads `req.user.role_id`, which `authenticateToken` deletes before handing over the request
// (auth.middleware.js line 75). It therefore fails for every caller. Repairing it would silently
// open the other routes currently relying on it failing closed, so it is left alone and this
// module reads `req.user.permissions` — the shape auth actually provides, and the pattern the
// contest controllers already use.
//
// The wildcards are not decoration. Seeded roles hold `{"*": true}` (Admin) and `{"all": true}`
// (admin) rather than dotted permissions, so a check for only `moderation.review` would lock out
// every administrator in the database.
const WILDCARDS = ["*", "all"];

/**
 * @param {object|undefined} user req.user
 * @param {string} permission dotted permission name
 */
function can(user, permission) {
  const permissions = user?.permissions ?? {};

  if (WILDCARDS.some((key) => permissions[key] === true)) return true;

  return permissions[permission] === true;
}

/** Whether the user owns or manages this brand. */
function belongsToBrand(user, brandId) {
  if (!user || !brandId) return false;
  return (user.brands ?? []).some((brand) => brand.id === brandId);
}

/** Requires a platform-level permission. */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!can(req.user, permission)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        required: permission,
      });
    }

    next();
  };
}

/**
 * Requires either the platform permission or membership of the brand named in the request.
 *
 * This is what lets a brand configure its own thresholds and style guides without granting it
 * anything platform-wide. A request with no brand context falls back to the platform permission,
 * so a brand user cannot edit the platform default ruleset by omitting `brand_id`.
 */
function requireBrandOrPermission(permission, brandIdFrom = (req) => req.body?.brand_id ?? req.query?.brand_id) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (can(req.user, permission)) return next();

    const brandId = brandIdFrom(req);

    if (brandId && belongsToBrand(req.user, brandId)) return next();

    return res.status(403).json({
      error: brandId
        ? "You do not manage this brand"
        : "Insufficient permissions",
      required: permission,
    });
  };
}

module.exports = {
  belongsToBrand,
  can,
  requireBrandOrPermission,
  requirePermission,
};
