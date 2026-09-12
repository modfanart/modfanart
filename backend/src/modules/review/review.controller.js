const service = require('./review.service');

function handleError(res, error) {
  console.error(error);

  return res.status(400).json({
    error: error.message || 'Something went wrong',
  });
}

async function createReview(req, res) {
  try {
    const review = await service.createReview({
      reviewerId: req.user.id,
      targetType: req.body.target_type,
      targetId: req.body.target_id,
      orderItemId: req.body.order_item_id,
      rating: req.body.rating,
      body: req.body.body,
    });

    return res.status(201).json({
      message: 'Review submitted',
      review,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getReviews(req, res) {
  try {
    const reviews = await service.getReviews(
      req.params.targetType,
      req.params.targetId
    );

    return res.json({ reviews });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  createReview,
  getReviews,
};
