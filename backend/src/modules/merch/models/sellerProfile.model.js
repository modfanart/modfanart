const { db } = require('../../../config');

async function findByUser(userId, trx = db) {
  return trx
    .selectFrom('seller_profiles')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

async function create(data, trx = db) {
  return trx
    .insertInto('seller_profiles')
    .values({
      user_id: data.user_id,
      display_name: data.display_name,
      status: 'pending',
      payout_ready: false,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

async function decide(id, { reviewerId, status, notes }, trx = db) {
  return trx
    .updateTable('seller_profiles')
    .set({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

async function setPayoutReady(userId, ready, trx = db) {
  return trx
    .updateTable('seller_profiles')
    .set({ payout_ready: ready, updated_at: new Date().toISOString() })
    .where('user_id', '=', userId)
    .returningAll()
    .executeTakeFirst();
}

async function findPending(trx = db) {
  return trx
    .selectFrom('seller_profiles')
    .selectAll()
    .where('status', '=', 'pending')
    .orderBy('created_at', 'asc')
    .execute();
}

module.exports = {
  findByUser,
  create,
  decide,
  setPayoutReady,
  findPending,
};
