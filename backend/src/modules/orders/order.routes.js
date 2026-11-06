// Mounted at /api/orders. (The older /api/order router is the single-license
// purchase flow and is left untouched.)
const router = require('express').Router();

const controller = require('./order.controller');
const fulfillmentRoutes = require('../fulfillment/fulfillment.routes');
const {
  authenticateToken,
} = require('../../common/middleware/auth.middleware');
const {
  hasAnyPermission,
} = require('../../common/middleware/permission.middleware');

router.use(authenticateToken);

// Buyer
router.get('/me', controller.getMyOrders);
router.post('/pay', controller.createPayment);
router.post('/confirm-payment', controller.confirmPayment);

// Seller: orders that contain at least one of my line items.
router.get('/seller/mine', controller.getSellerOrders);

// Admin / finance
router.get(
  '/admin/all',
  hasAnyPermission('orders.view_all', 'payouts.manage'),
  controller.getAllOrders
);

router.get('/:id', controller.getOrder);
router.post('/:id/cancel', controller.cancelOrder);

// /api/orders/:orderId/fulfillments (the router was written for this mount
// point but was never registered).
router.use('/:orderId/fulfillments', fulfillmentRoutes);

module.exports = router;
