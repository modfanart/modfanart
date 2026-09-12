const { db, sql } = require('../../../config');

async function findActiveCart(userId, trx = db) {
  return trx
    .selectFrom('carts')
    .selectAll()
    .where('user_id', '=', userId)
    .where('status', '=', 'active')
    .orderBy('created_at', 'desc')
    .executeTakeFirst();
}

async function createCart(userId, trx = db) {
  return trx
    .insertInto('carts')
    .values({
      user_id: userId,
      status: 'active',
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

async function findCartById(id, trx = db) {
  return trx
    .selectFrom('carts')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

async function getCartItems(cartId, trx = db) {
  return trx
    .selectFrom('cart_items as ci')
    .leftJoin('merch_variants as mv', 'mv.id', 'ci.merch_variant_id')
    .leftJoin('merch_products as mp', 'mp.id', 'mv.merch_product_id')
    .select([
      'ci.id',
      'ci.cart_id',
      'ci.item_type',
      'ci.artwork_id',
      'ci.license_type',
      'ci.merch_variant_id',
      'ci.quantity',
      'mv.sku',
      'mv.price_inr_cents',
      'mv.price_usd_cents',
      'mp.title',
      'mp.seller_id',
    ])
    .where('ci.cart_id', '=', cartId)
    .execute();
}

async function addItem(data, trx = db) {
  return trx
    .insertInto('cart_items')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

async function findItem(id, trx = db) {
  return trx
    .selectFrom('cart_items')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

async function updateItemQuantity(id, quantity, trx = db) {
  return trx
    .updateTable('cart_items')
    .set({ quantity })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

async function removeItem(id, trx = db) {
  return trx
    .deleteFrom('cart_items')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

module.exports = {
  findActiveCart,
  createCart,
  findCartById,
  getCartItems,
  addItem,
  findItem,
  updateItemQuantity,
  removeItem,
};
