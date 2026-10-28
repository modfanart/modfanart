// Mounted at /api/marketplace-admin. (/api/admin belongs to the general
// admin module.) Every route is permission-gated:
//   merch.moderate     products
//   sellers.manage     sellers
//   marketplace.manage fee rules, print providers, order cancel, reviews
const router = require('express').Router();

const controller = require('./marketplaceAdmin.controller');
const { authenticateToken } = require('../../common/middleware/auth.middleware');
const { hasPermission } = require('../../common/middleware/permission.middleware');

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

module.exports = router;
