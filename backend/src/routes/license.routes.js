// backend/src/routes/license.routes.js
const express = require('express');
const router = express.Router();

const LicenseController = require('../controller/license.controller'); // ← plural "controllers"
const { authenticateToken } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');
const LicensePurchaseController = require("../controller/licensePurchase.controller");
// All license routes require authentication
// router.use(authenticateToken);
router.post("/checkout", LicensePurchaseController.createCheckoutSession);
// ────────────────────────────────────────────────
// User (buyer) routes
// ────────────────────────────────────────────────
router.get('/issued', hasPermission('licenses.manage'), LicenseController.getIssuedLicenses);

// GET /licenses/me → list all licenses owned by current user
router.get('/me', LicenseController.getMyLicenses);

// GET /licenses/:id → get single license (only if current user is the buyer)
router.get('/:id', LicenseController.getLicense);

// ────────────────────────────────────────────────
// Brand / creator routes (optional — if you want brands to manage issued licenses)
// ────────────────────────────────────────────────

// Example: GET /licenses/issued → list licenses issued by current user (seller)

// Example: PATCH /licenses/:id/revoke → revoke a license (seller/admin only)
router.patch('/:id/revoke', hasPermission('licenses.manage'), LicenseController.revokeLicense);

// ────────────────────────────────────────────────
// Admin / moderation routes (optional)
// ────────────────────────────────────────────────

// GET /licenses (admin only) — list all licenses
router.get('/', hasPermission('licenses.view_all'), LicenseController.getAllLicenses);

module.exports = router;