const { db } = require('../../config');
const model = require('./models/review.model');

async function createReview({
  reviewerId,
  targetType,
  targetId,
  orderItemId,
  rating,
  body,
}) {
  if (!['artwork', 'merch_product'].includes(targetType)) {
    throw new Error('Invalid review target');
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  return db.transaction().execute(async (trx) => {
    const existing = await model.findByOrderItem(orderItemId, trx);

    if (existing) {
      throw new Error('A review already exists for this purchase');
    }

    const orderItem = await trx
      .selectFrom('order_items')
      .selectAll()
      .where('id', '=', orderItemId)
      .executeTakeFirst();

    if (!orderItem) {
      throw new Error('Order item not found');
    }

    const order = await trx
      .selectFrom('orders')
      .selectAll()
      .where('id', '=', orderItem.order_id)
      .executeTakeFirst();

    if (!order || order.buyer_id !== reviewerId) {
      throw new Error('You can only review products you purchased');
    }

    if (order.status !== 'fulfilled') {
      throw new Error('You can review this product after fulfillment');
    }

    if (targetType === 'merch_product') {
      if (!orderItem.merch_variant_id) {
        throw new Error('Order item is not a merch purchase');
      }

      const variant = await trx
        .selectFrom('merch_variants')
        .select(['merch_product_id'])
        .where('id', '=', orderItem.merch_variant_id)
        .executeTakeFirst();

      if (!variant || variant.merch_product_id !== targetId) {
        throw new Error('Review target does not match purchased product');
      }
    }

    if (targetType === 'artwork') {
      if (orderItem.artwork_id !== targetId) {
        throw new Error('Review target does not match purchased artwork');
      }
    }

    return model.createReview(
      {
        reviewer_id: reviewerId,
        target_type: targetType,
        target_id: targetId,
        order_item_id: orderItemId,
        rating,
        body: body || null,
      },
      trx
    );
  });
}

async function getReviews(targetType, targetId) {
  return model.findForTarget(targetType, targetId);
}

module.exports = {
  createReview,
  getReviews,
};
