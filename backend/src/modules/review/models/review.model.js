const { db, sql } = require('../../../config');
async function createReview(data, trx = db) {
  return trx
    .insertInto('product_reviews')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

async function findById(id, trx = db) {
  return trx
    .selectFrom('product_reviews')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

async function findForTarget(targetType, targetId, trx = db) {
  return trx
    .selectFrom('product_reviews')
    .selectAll()
    .where('target_type', '=', targetType)
    .where('target_id', '=', targetId)
    .orderBy('created_at', 'desc')
    .execute();
}

async function findByOrderItem(orderItemId, trx = db) {
  return trx
    .selectFrom('product_reviews')
    .selectAll()
    .where('order_item_id', '=', orderItemId)
    .executeTakeFirst();
}

module.exports = {
  createReview,
  findById,
  findForTarget,
  findByOrderItem,
};
