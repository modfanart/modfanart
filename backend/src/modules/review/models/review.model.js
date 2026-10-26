const { db } = require('../../../config');
const { sql } = require('kysely'); // config doesn't export sql
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
    .selectFrom('product_reviews as r')
    .leftJoin('users as u', 'u.id', 'r.reviewer_id')
    .selectAll('r')
    .select(['u.username as reviewer_username', 'u.avatar_url as reviewer_avatar_url'])
    .where('r.target_type', '=', targetType)
    .where('r.target_id', '=', targetId)
    .where('r.deleted_at', 'is', null)
    .orderBy('r.created_at', 'desc')
    .execute();
}

async function findByOrderItem(orderItemId, trx = db) {
  return trx
    .selectFrom('product_reviews')
    .selectAll()
    .where('order_item_id', '=', orderItemId)
    .executeTakeFirst();
}

async function getRatingSummary(targetType, targetId, trx = db) {
  const row = await trx
    .selectFrom('product_reviews')
    .select([
      sql`COUNT(*)`.as('review_count'),
      sql`AVG(rating)`.as('average_rating'),
    ])
    .where('target_type', '=', targetType)
    .where('target_id', '=', targetId)
    .where('deleted_at', 'is', null)
    .executeTakeFirst();

  return {
    review_count: Number(row?.review_count || 0),
    average_rating: row?.average_rating ? Number(row.average_rating) : null,
  };
}

module.exports = {
  createReview,
  findById,
  findForTarget,
  findByOrderItem,
  getRatingSummary,
};
