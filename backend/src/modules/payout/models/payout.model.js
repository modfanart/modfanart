const { db } = require('../../../config');
async function createPayout(data, trx = db) {
  return trx
    .insertInto('payouts')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

async function findById(id, trx = db) {
  return trx
    .selectFrom('payouts')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

async function findBySeller(sellerId, trx = db) {
  return trx
    .selectFrom('payouts')
    .selectAll()
    .where('seller_id', '=', sellerId)
    .orderBy('created_at', 'desc')
    .execute();
}

async function findAllWithContext({ status, sellerId, limit = 100, offset = 0 } = {}, trx = db) {
  let q = trx
    .selectFrom('payouts as p')
    .leftJoin('users as u', 'u.id', 'p.seller_id')
    .leftJoin('order_items as oi', 'oi.id', 'p.order_item_id')
    .leftJoin('orders as o', 'o.id', 'oi.order_id')
    .selectAll('p')
    .select([
      'u.username as seller_username',
      'u.email as seller_email',
      'u.stripe_connect_id as seller_stripe_connect_id',
      'o.order_number',
      'o.currency',
      'oi.description as item_description',
    ])
    .orderBy('p.created_at', 'desc')
    .limit(Math.min(Number(limit) || 100, 500))
    .offset(Number(offset) || 0);

  if (status) q = q.where('p.status', '=', status);
  if (sellerId) q = q.where('p.seller_id', '=', sellerId);

  return q.execute();
}

async function findByOrderItem(orderItemId, trx = db) {
  return trx
    .selectFrom('payouts')
    .selectAll()
    .where('order_item_id', '=', orderItemId)
    .executeTakeFirst();
}

async function updateStatus(id, data, trx = db) {
  return trx
    .updateTable('payouts')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

module.exports = {
  createPayout,
  findById,
  findBySeller,
  findAllWithContext,
  findByOrderItem,
  updateStatus,
};
