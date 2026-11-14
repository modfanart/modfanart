const router = require('express').Router();

const controller = require('./payout.controller');
const {
  authenticateToken,
} = require('../../common/middleware/auth.middleware');
const { hasPermission, hasAnyPermission } = require('../../common/middleware/permission.middleware');

router.use(authenticateToken);

// A seller viewing their own payout history.
router.get('/mine', controller.getMyPayouts);

// Admin/finance overview of every payout across sellers.
router.get('/', hasAnyPermission('payouts.view', 'payouts.manage'), controller.listAllPayouts);

// Admin/finance-only from here down — a seller must never be able to create
// or settle their own payout.
router.post('/', hasPermission('payouts.manage'), controller.createPayout);

router.post(
  '/orders/:orderId/generate',
  hasPermission('payouts.manage'),
  controller.generateForOrder
);

// GA-12 segregation of duties: preparing payouts (payouts.manage) and
// approving them as paid (payouts.approve) are separate permissions.
router.patch(
  '/:id/paid',
  hasPermission('payouts.approve'),
  controller.markPaid
);

router.patch(
  '/:id/failed',
  hasPermission('payouts.manage'),
  controller.markFailed
);

module.exports = router;
