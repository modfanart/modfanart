const router = require('express').Router();

const controller = require('./merch.controller');
const {
  authenticateToken,
} = require('../../common/middleware/auth.middleware');
router.get('/', controller.getPublishedProducts);
router.get('/mine', authenticateToken, controller.getMyProducts);
router.get('/:id', controller.getProduct);

router.post('/', authenticateToken, controller.createProduct);

router.patch('/:id', authenticateToken, controller.updateProduct);

router.delete('/:id', authenticateToken, controller.deleteProduct);

router.post('/:productId/variants', authenticateToken, controller.addVariant);

router.patch(
  '/variants/:variantId',
  authenticateToken,
  controller.updateVariant
);

router.delete(
  '/variants/:variantId',
  authenticateToken,
  controller.deleteVariant
);

module.exports = router;
