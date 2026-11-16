// Mounted at /api/marketplace-admin. (/api/admin belongs to the general
// admin module.) Every route is permission-gated:
//   merch.moderate     products
//   sellers.manage     sellers
//   marketplace.manage fee rules, print providers, order cancel, reviews
const router = require('express').Router();

const controller = require('./marketplaceAdmin.controller');
const { authenticateToken } = require('../../common/middleware/auth.middleware');
const { hasPermission, hasAnyPermission } = require('../../common/middleware/permission.middleware');

router.use(authenticateToken);

router.get('/products', hasPermission('merch.moderate'), controller.listProducts);
router.patch('/products/:id/status', hasPermission('merch.moderate'), controller.setProductStatus);

router.get('/sellers', hasPermission('sellers.manage'), controller.listSellers);
router.patch('/sellers/:id/status', hasPermission('sellers.manage'), controller.setSellerStatus);

const manage = hasPermission('marketplace.manage');

router.get('/fee-rules', manage, controller.listFeeRules);
router.post('/fee-rules', manage, controller.createFeeRule);
router.patch('/fee-rules/:id', manage, controller.updateFeeRule);

router.get('/print-providers', manage, controller.listPrintProviders);
router.post('/print-providers', manage, controller.createPrintProvider);
router.patch('/print-providers/:id', manage, controller.updatePrintProvider);

router.post('/orders/:id/cancel', manage, controller.cancelOrder);

router.get('/reviews', manage, controller.listReviews);
router.delete('/reviews/:id', manage, controller.removeReview);

// Workspace overview tiles (any marketplace/finance staff).
router.get(
  '/overview',
  hasAnyPermission('merch.moderate', 'sellers.manage', 'marketplace.manage', 'orders.view_all', 'payouts.view', 'payouts.manage'),
  controller.overview
);

// Contest prizes ledger (GA-25)
router.get('/prizes', hasAnyPermission('prizes.manage', 'payouts.view', 'contests.manage'), controller.listPrizes);
router.patch('/prizes/:id/status', hasPermission('prizes.manage'), controller.setPrizeStatus);

// Chargebacks (GA-18)
router.get('/disputes', hasAnyPermission('disputes.view', 'payouts.manage'), controller.listDisputes);

module.exports = router;
