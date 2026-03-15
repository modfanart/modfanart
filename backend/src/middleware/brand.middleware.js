const BrandManager = require('../models/brandManager.model');
const Brand = require('../models/brand.model'); // your Brand model

// Returns middleware for checking brand access
function ensureBrandAccessMiddleware(allowedManagerRoles = ['owner', 'manager', 'editor']) {
  return async function (req, res, next) {
    try {
      const brandId = req.params.brandId || req.params.id || req.params.brand_id;
      if (!brandId) {
        const err = new Error('Brand ID not found in request');
        err.status = 400;
        throw err;
      }

      // Check manager access first
      const access = await BrandManager.hasAccess(brandId, req.user.id, allowedManagerRoles);
      if (access) return next(); // allowed

      // Fallback: check if the current user is the brand creator
      const brand = await Brand.findById(brandId);
      if (!brand) {
        const err = new Error('Brand not found');
        err.status = 404;
        throw err;
      }

      if (brand.user_id === req.user.id) return next(); // allowed

      // No access
      const err = new Error('You do not have permission to perform this action on this brand');
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

module.exports = { ensureBrandAccessMiddleware, ensureBrandOwnerMiddleware };