const router = require('express').Router();

const controller = require('./merch.controller');
const {
  authenticateToken,
} = require('../../common/middleware/auth.middleware');
const { hasPermission } = require('../../common/middleware/permission.middleware');

router.get('/', controller.getPublishedProducts);
router.get('/mine', authenticateToken, controller.getMyProducts);
router.get('/:id', controller.getProduct);

router.post('/', authenticateToken, controller.createProduct);

router.patch('/:id', authenticateToken, controller.updateProduct);

router.post(
  '/:id/submit-for-review',
  authenticateToken,
  controller.submitForReview
);

// Admin/moderation-only — approves or rejects a product that's pending_review.
router.post(
  '/:id/moderate',
  authenticateToken,
  hasPermission('merch.moderate'),
  controller.moderateProduct
);

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
