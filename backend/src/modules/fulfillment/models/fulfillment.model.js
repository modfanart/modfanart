const { db, sql } = require('../../../config');
async function createFulfillment(data, trx = db) {
  return trx
    .insertInto('fulfillments')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

async function findById(id, trx = db) {
  return trx
    .selectFrom('fulfillments')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

async function findByOrderId(orderId, trx = db) {
  return trx
    .selectFrom('fulfillments')
    .selectAll()
    .where('order_id', '=', orderId)
    .orderBy('id', 'asc')
    .execute();
}

async function updateStatus(id, status, trx = db) {
  const data = { status };

  if (status === 'shipped') {
    data.shipped_at = new Date().toISOString();
  }

  if (status === 'delivered') {
    data.delivered_at = new Date().toISOString();
  }

  return trx
    .updateTable('fulfillments')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

async function updateTracking(id, data, trx = db) {
  return trx
    .updateTable('fulfillments')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

async function addItems(items, trx = db) {
  if (!items.length) return [];

  return trx
    .insertInto('fulfillment_items')
    .values(items)
    .returningAll()
    .execute();
}

async function getItems(fulfillmentId, trx = db) {
  return trx
    .selectFrom('fulfillment_items as fi')
    .innerJoin('order_items as oi', 'oi.id', 'fi.order_item_id')
    .selectAll('oi')
    .where('fi.fulfillment_id', '=', fulfillmentId)
    .execute();
}

module.exports = {
  createFulfillment,
  findById,
  findByOrderId,
  updateStatus,
  updateTracking,
  addItems,
  getItems,
};
