const BrandManager = require('../../modules/brands/models/brandManager.model');
const Brand = require('../../modules/brands/models/brand.model');

// System roles that can access any brand without brand-level assignment
const allowedRoles = ['BRAND_MANAGER', 'ADMIN', 'SUPER_ADMIN'];

// Returns middleware for checking brand access
function ensureBrandAccessMiddleware(
  allowedManagerRoles = ['owner', 'manager', 'editor']
) {
  return async function (req, res, next) {
    try {
      // --------------------------------------------------
      // 1. System role access
      // --------------------------------------------------
      // These roles have global access to brands.
      if (allowedRoles.includes(req.user?.role)) {
        return next();
      }

      // --------------------------------------------------
      // 2. Get Brand ID
      // --------------------------------------------------
      const brandId =
        req.params.brandId || req.params.id || req.params.brand_id;

      if (!brandId) {
        const err = new Error('Brand ID not found in request');
        err.status = 400;
        throw err;
      }

      // --------------------------------------------------
      // 3. Check Brand Manager access
      // --------------------------------------------------
      const access = await BrandManager.hasAccess(
        brandId,
        req.user.id,
        allowedManagerRoles
      );

      if (access) {
        return next();
      }

      // --------------------------------------------------
      // 4. Fallback: Brand creator access
      // --------------------------------------------------
      const brand = await Brand.findById(brandId);

      if (!brand) {
        const err = new Error('Brand not found');
        err.status = 404;
        throw err;
      }

      if (brand.user_id === req.user.id) {
        return next();
      }

      // --------------------------------------------------
      // 5. No access
      // --------------------------------------------------
      const err = new Error(
        'You do not have permission to perform this action on this brand'
      );
      err.status = 403;
      throw err;
    } catch (err) {
      next(err);
    }
  };
}

// Shortcut middleware for owner-only access
function ensureBrandOwnerMiddleware() {
  return ensureBrandAccessMiddleware(['owner']);
}

module.exports = {
  ensureBrandAccessMiddleware,
  ensureBrandOwnerMiddleware,
};
