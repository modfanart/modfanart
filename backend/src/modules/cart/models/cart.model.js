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

// Fuller read used at checkout time: joins artwork_pricing_tiers for
// license items (getCartItems above only resolves merch pricing) and pulls
// the artwork's creator_id as the license "seller", plus enough merch
// status/stock to re-validate that nothing changed since it was added to
// the cart.
async function getCartItemsForCheckout(cartId, trx = db) {
  return trx
    .selectFrom('cart_items as ci')
    .leftJoin('merch_variants as mv', 'mv.id', 'ci.merch_variant_id')
    .leftJoin('merch_products as mp', 'mp.id', 'mv.merch_product_id')
    .leftJoin('artworks as a', 'a.id', 'ci.artwork_id')
    .leftJoin('artwork_pricing_tiers as apt', (join) =>
      join
        .onRef('apt.artwork_id', '=', 'ci.artwork_id')
        .onRef('apt.license_type', '=', 'ci.license_type')
    )
    .select([
      'ci.id',
      'ci.cart_id',
      'ci.item_type',
      'ci.artwork_id',
      'ci.license_type',
      'ci.merch_variant_id',
      'ci.quantity',
      'mv.sku',
      'mv.is_active as merch_is_active',
      'mv.stock_qty as merch_stock_qty',
      'mv.price_inr_cents as merch_price_inr_cents',
      'mv.price_usd_cents as merch_price_usd_cents',
      'mp.title as merch_title',
      'mp.seller_id as merch_seller_id',
      'mp.status as merch_product_status',
      'a.creator_id as license_seller_id',
      'a.status as artwork_status',
      'apt.price_inr_cents as license_price_inr_cents',
      'apt.price_usd_cents as license_price_usd_cents',
      'apt.is_active as license_tier_is_active',
    ])
    .where('ci.cart_id', '=', cartId)
    .execute();
}

async function markConverted(cartId, trx = db) {
  return trx
    .updateTable('carts')
    .set({ status: 'converted', updated_at: new Date().toISOString() })
    .where('id', '=', cartId)
    .returningAll()
    .executeTakeFirst();
}

async function clearItems(cartId, trx = db) {
  return trx.deleteFrom('cart_items').where('cart_id', '=', cartId).execute();
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
  getCartItemsForCheckout,
  markConverted,
  clearItems,
  addItem,
  findItem,
  updateItemQuantity,
  removeItem,
};
