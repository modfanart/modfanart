// src/routes/order.routes.js
const express = require('express');
const OrderController = require('./controller/order.controller');
const LicenseController = require('./controller/license.controller');
const { authenticateToken } = require('../../common/middleware/auth.middleware');
const { hasPermission } = require('../../common/middleware/permission.middleware');

const router = express.Router();

// BUG FIX: this line was commented out, so req.user was never set and every
// license/order endpoint (purchase, my licenses, issued, revoke) failed
// with 401/500 - the licensing flow could not work at all.
router.use(authenticateToken);

// Orders
router.post(
  '/',
  hasPermission('orders.create'),
  OrderController.createLicenseOrder
);
router.post(
  '/:id/confirm',
  hasPermission('orders.confirm'),
  OrderController.confirmOrder
);
router.get('/me', OrderController.getMyOrders);

// Licenses
router.get('/licenses/me', LicenseController.getMyLicenses);
router.get('/licenses/:id', LicenseController.getLicense);

// Future: admin payout overview
// router.get('/payouts', hasPermission('payouts.view'), ...)

module.exports = router;
