// backend/src/routes/license.routes.js
const express = require('express');
const { requireGoodStanding } = require('../../common/policy');
const router = express.Router();

const LicenseController = require('./controller/license.controller'); // ← plural "controllers"
const { authenticateToken } = require('../../common/middleware/auth.middleware');
const { hasPermission } = require('../../common/middleware/permission.middleware');
const LicensePurchaseController = require('./controller/licensePurchase.controller');
// All license routes require authentication
// BUG FIX: this line was commented out, so req.user was never set and every
// license/order endpoint (purchase, my licenses, issued, revoke) failed
// with 401/500 - the licensing flow could not work at all.
router.use(authenticateToken);
router.post('/checkout', requireGoodStanding, LicensePurchaseController.createCheckoutSession);
// ────────────────────────────────────────────────
// User (buyer) routes
// ────────────────────────────────────────────────
router.get(
  '/issued',
  hasPermission('licenses.manage'),
  LicenseController.getIssuedLicenses
);

// GET /licenses/me → list all licenses owned by current user
router.get('/me', LicenseController.getMyLicenses);

// GET /licenses/:id → get single license (only if current user is the buyer)
router.get('/:id', LicenseController.getLicense);

// ────────────────────────────────────────────────
// Brand / creator routes (optional — if you want brands to manage issued licenses)
// ────────────────────────────────────────────────

// Example: GET /licenses/issued → list licenses issued by current user (seller)

// Example: PATCH /licenses/:id/revoke → revoke a license (seller/admin only)
router.patch(
  '/:id/revoke',
  hasPermission('licenses.manage'),
  LicenseController.revokeLicense
);

// ────────────────────────────────────────────────
// Admin / moderation routes (optional)
// ────────────────────────────────────────────────

// GET /licenses (admin only) — list all licenses
router.get(
  '/',
  hasPermission('licenses.view_all'),
  LicenseController.getAllLicenses
);

module.exports = router;
