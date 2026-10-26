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
    .selectFrom('seller_profiles as sp')
    .leftJoin('users as u', 'u.id', 'sp.user_id')
    .selectAll('sp')
    .select(['u.username', 'u.email'])
    .where('sp.status', '=', 'pending')
    .orderBy('sp.created_at', 'asc')
    .execute();
}

async function findAll(status, trx = db) {
  let q = trx
    .selectFrom('seller_profiles as sp')
    .leftJoin('users as u', 'u.id', 'sp.user_id')
    .selectAll('sp')
    .select(['u.username', 'u.email'])
    .orderBy('sp.created_at', 'desc');

  if (status) q = q.where('sp.status', '=', status);

  return q.execute();
}

module.exports = {
  findAll,
  findByUser,
  create,
  decide,
  setPayoutReady,
  findPending,
};
