const router = require('express').Router();

const controller = require('./review.controller');
const {
  authenticateToken,
} = require('../../common/middleware/auth.middleware');
router.get('/:targetType/:targetId', controller.getReviews);
router.get('/:targetType/:targetId/summary', controller.getRatingSummary);

router.post('/', authenticateToken, controller.createReview);

module.exports = router;
