const { requireGoodStanding } = require('../../common/policy');
const router = require('express').Router();

const controller = require('./sellerProfile.controller');
const {
  authenticateToken,
} = require('../../common/middleware/auth.middleware');
const { hasPermission } = require('../../common/middleware/permission.middleware');

router.use(authenticateToken);

router.get('/mine', controller.getMine);
router.post('/', requireGoodStanding, controller.apply);

// Admin/moderation-only.
router.get('/pending', hasPermission('sellers.manage'), controller.listPending);
router.get('/', hasPermission('sellers.manage'), controller.listAll);
router.patch('/:id', hasPermission('sellers.manage'), controller.decide);

module.exports = router;
