const router = require('express').Router();

const controller = require('./sellerProfile.controller');
const {
  authenticateToken,
} = require('../../common/middleware/auth.middleware');
const { hasPermission } = require('../../common/middleware/permission.middleware');

router.use(authenticateToken);

router.get('/mine', controller.getMine);
router.post('/', controller.apply);

// Admin/moderation-only.
router.get('/pending', hasPermission('sellers.manage'), controller.listPending);
router.patch('/:id', hasPermission('sellers.manage'), controller.decide);

module.exports = router;
