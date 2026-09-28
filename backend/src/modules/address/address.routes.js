const router = require('express').Router();

const controller = require('./address.controller');
const {
  authenticateToken,
} = require('../../common/middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', controller.listAddresses);
router.post('/', controller.createAddress);
router.patch('/:id', controller.updateAddress);
router.delete('/:id', controller.deleteAddress);

module.exports = router;
