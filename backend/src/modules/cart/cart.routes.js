const router = require('express').Router();

const controller = require('./cart.controller');
const {
  authenticateToken,
} = require('../../common/middleware/auth.middleware');
router.use(authenticateToken);

router.get('/', controller.getCart);

router.post('/merch', controller.addMerchItem);

router.post('/license', controller.addLicenseItem);

router.patch('/items/:itemId', controller.updateItem);

router.delete('/items/:itemId', controller.removeItem);

module.exports = router;
