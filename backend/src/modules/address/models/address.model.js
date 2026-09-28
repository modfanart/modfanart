const { db } = require('../../../config');

async function createAddress(data, trx = db) {
  return trx
    .insertInto('addresses')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

async function findById(id, trx = db) {
  return trx
    .selectFrom('addresses')
    .selectAll()
    .where('id', '=', id)
    .where('deleted_at', 'is', null)
    .executeTakeFirst();
}

async function findByUser(userId, trx = db) {
  return trx
    .selectFrom('addresses')
    .selectAll()
    .where('user_id', '=', userId)
    .where('deleted_at', 'is', null)
    .orderBy('is_default', 'desc')
    .orderBy('created_at', 'desc')
    .execute();
}

async function findDefaultForUser(userId, trx = db) {
  return trx
    .selectFrom('addresses')
    .selectAll()
    .where('user_id', '=', userId)
    .where('is_default', '=', true)
    .where('deleted_at', 'is', null)
    .executeTakeFirst();
}

async function clearDefaultForUser(userId, trx = db) {
  return trx
    .updateTable('addresses')
    .set({ is_default: false })
    .where('user_id', '=', userId)
    .where('is_default', '=', true)
    .execute();
}

async function updateAddress(id, data, trx = db) {
  return trx
    .updateTable('addresses')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

async function softDelete(id, trx = db) {
  return trx
    .updateTable('addresses')
    .set({ deleted_at: new Date().toISOString() })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

module.exports = {
  createAddress,
  findById,
  findByUser,
  findDefaultForUser,
  clearDefaultForUser,
  updateAddress,
  softDelete,
};
