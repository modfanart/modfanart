// src/middleware/brand.middleware.js
const BrandManager = require('../models/brandManager.model');

const ensureBrandAccess = (allowedRoles = ['owner', 'manager', 'editor']) => {
  return async (req, res, next) => {
    try {
      const brandId = req.params.brandId || req.params.id || req.params.brand_id;
      if (!brandId) {
        return res.status(400).json({ error: 'Brand ID required' });
      }

      const hasAccess = await BrandManager.hasAccess(brandId, req.user.id, allowedRoles);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Insufficient brand permissions' });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

const ensureBrandOwner = ensureBrandAccess(['owner']);

module.exports = {
  ensureBrandAccess,
  ensureBrandOwner,
};