const { db, sql } = require('../../../config');
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
  findByOrderItem,
  updateStatus,
};
