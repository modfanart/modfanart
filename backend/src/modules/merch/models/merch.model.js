const { db, sql } = require('../../../config');
/**
 * Create a merch product
 */
async function createProduct(data, trx = db) {
  const product = await trx
    .insertInto('merch_products')
    .values({
      seller_id: data.seller_id,
      brand_id: data.brand_id || null,
      artwork_id: data.artwork_id || null,
      title: data.title,
      description: data.description || null,
      base_product_type: data.base_product_type,
      fulfillment_type: data.fulfillment_type,
      print_provider_id: data.print_provider_id || null,
      status: data.status || 'draft',
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return product;
}

/**
 * Find product by ID
 */
async function findProductById(id, trx = db) {
  return trx
    .selectFrom('merch_products')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

/**
 * Find products by seller
 */
async function findProductsBySeller(sellerId, trx = db) {
  return trx
    .selectFrom('merch_products')
    .selectAll()
    .where('seller_id', '=', sellerId)
    .orderBy('created_at', 'desc')
    .execute();
}

/**
 * Find published products
 */
async function findPublishedProducts(trx = db) {
  return trx
    .selectFrom('merch_products')
    .selectAll()
    .where('status', '=', 'published')
    .orderBy('created_at', 'desc')
    .execute();
}

/**
 * Update product
 */
async function updateProduct(id, data, trx = db) {
  return trx
    .updateTable('merch_products')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

/**
 * Delete product
 */
async function deleteProduct(id, trx = db) {
  return trx
    .deleteFrom('merch_products')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

/**
 * Create variant
 */
async function createVariant(data, trx = db) {
  return trx
    .insertInto('merch_variants')
    .values({
      merch_product_id: data.merch_product_id,
      sku: data.sku,
      size: data.size || null,
      color: data.color || null,
      material: data.material || null,
      price_inr_cents: data.price_inr_cents,
      price_usd_cents: data.price_usd_cents,
      stock_qty: data.stock_qty ?? null,
      weight_grams: data.weight_grams ?? null,
      print_file_url: data.print_file_url || null,
      is_active: data.is_active ?? true,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Find variant
 */
async function findVariantById(id, trx = db) {
  return trx
    .selectFrom('merch_variants')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

/**
 * Find variants belonging to product
 */
async function findVariantsByProduct(productId, trx = db) {
  return trx
    .selectFrom('merch_variants')
    .selectAll()
    .where('merch_product_id', '=', productId)
    .orderBy('sku', 'asc')
    .execute();
}

/**
 * Update variant
 */
async function updateVariant(id, data, trx = db) {
  return trx
    .updateTable('merch_variants')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

/**
 * Delete variant
 */
async function deleteVariant(id, trx = db) {
  return trx
    .deleteFrom('merch_variants')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

/**
 * Find print provider
 */
async function findPrintProviderById(id, trx = db) {
  return trx
    .selectFrom('print_providers')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

module.exports = {
  createProduct,
  findProductById,
  findProductsBySeller,
  findPublishedProducts,
  updateProduct,
  deleteProduct,

  createVariant,
  findVariantById,
  findVariantsByProduct,
  updateVariant,
  deleteVariant,

  findPrintProviderById,
};
