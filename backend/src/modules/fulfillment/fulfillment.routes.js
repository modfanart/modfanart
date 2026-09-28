// src/modules/fulfillment/fulfillment.routes.js
//
// This file was missing entirely — the controller/service existed but had
// no way to be reached over HTTP. Mounted under /api/orders/:orderId/fulfillments
// in the module's parent router registration.
const router = require('express').Router({ mergeParams: true });

const controller = require('./fulfillment.controller');
const {
  authenticateToken,
} = require('../../common/middleware/auth.middleware');

router.use(authenticateToken);

// List fulfillments for an order (buyer checking shipping status, or a
// seller checking their own shipments on a multi-seller order).
router.get('/', controller.getOrderFulfillments);

// A seller creates a fulfillment for their own order_items on this order.
router.post('/', controller.createFulfillment);

router.patch('/:id/status', controller.updateStatus);

router.patch('/:id/tracking', controller.updateTracking);

module.exports = router;
