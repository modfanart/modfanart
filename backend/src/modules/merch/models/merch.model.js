const { db } = require('../../../config');
const { sql } = require('kysely');
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
 * Decrement stock for a variant at checkout time, guarded so it can never
 * go negative under concurrent checkouts. Returns undefined if there wasn't
 * enough stock (caller should treat that as "sold out").
 */
async function decrementStock(variantId, quantity, trx = db) {
  return trx
    .updateTable('merch_variants')
    .set((eb) => ({ stock_qty: eb('stock_qty', '-', quantity) }))
    .where('id', '=', variantId)
    .where('stock_qty', 'is not', null)
    .where('stock_qty', '>=', quantity)
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

// Shared SELECT for storefront / dashboard listings: product + seller name +
// brand + a representative image + price range across active variants. The
// plain findProductById stays as-is for write paths.
function enrichedProductQuery(trx = db) {
  return trx
    .selectFrom('merch_products as mp')
    .leftJoin('users as u', 'u.id', 'mp.seller_id')
    .leftJoin('seller_profiles as sp', 'sp.user_id', 'mp.seller_id')
    .leftJoin('brands as b', 'b.id', 'mp.brand_id')
    .leftJoin('artworks as a', 'a.id', 'mp.artwork_id')
    .select([
      'mp.id',
      'mp.seller_id',
      'mp.brand_id',
      'mp.artwork_id',
      'mp.license_id',
      'mp.title',
      'mp.description',
      'mp.base_product_type',
      'mp.fulfillment_type',
      'mp.print_provider_id',
      'mp.status',
      'mp.created_at',
      'mp.updated_at',
      'u.username as seller_username',
      sql`coalesce(b.name, sp.display_name, u.username)`.as('seller_name'),
      'b.name as brand_name',
      'b.slug as brand_slug',
      'a.title as artwork_title',
      sql`coalesce(
        a.thumbnail_url,
        a.file_url,
        (select mv.print_file_url from merch_variants mv
          where mv.merch_product_id = mp.id and mv.print_file_url is not null
          order by mv.created_at asc limit 1)
      )`.as('image_url'),
      sql`(select min(mv.price_inr_cents) from merch_variants mv
            where mv.merch_product_id = mp.id and mv.is_active = true)`.as(
        'min_price_inr_cents'
      ),
      sql`(select max(mv.price_inr_cents) from merch_variants mv
            where mv.merch_product_id = mp.id and mv.is_active = true)`.as(
        'max_price_inr_cents'
      ),
      sql`(select min(mv.price_usd_cents) from merch_variants mv
            where mv.merch_product_id = mp.id and mv.is_active = true)`.as(
        'min_price_usd_cents'
      ),
      sql`(select max(mv.price_usd_cents) from merch_variants mv
            where mv.merch_product_id = mp.id and mv.is_active = true)`.as(
        'max_price_usd_cents'
      ),
      sql`(select count(*) from merch_variants mv
            where mv.merch_product_id = mp.id)::int`.as('variant_count'),
      sql`(select coalesce(avg(r.rating), 0)::float from product_reviews r
            where r.target_type = 'merch_product' and r.target_id = mp.id
              and r.deleted_at is null)`.as('rating_avg'),
      sql`(select count(*) from product_reviews r
            where r.target_type = 'merch_product' and r.target_id = mp.id
              and r.deleted_at is null)::int`.as('rating_count'),
    ])
    .where('mp.deleted_at', 'is', null);
}

async function findEnrichedPublished(filters = {}, trx = db) {
  let q = enrichedProductQuery(trx).where('mp.status', '=', 'published');

  if (filters.search) {
    const term = `%${String(filters.search).trim()}%`;
    q = q.where((eb) =>
      eb.or([
        eb('mp.title', 'ilike', term),
        eb('mp.description', 'ilike', term),
        eb('mp.base_product_type', 'ilike', term),
      ])
    );
  }

  if (filters.type) q = q.where('mp.base_product_type', '=', filters.type);
  if (filters.fulfillment_type)
    q = q.where('mp.fulfillment_type', '=', filters.fulfillment_type);
  if (filters.brand_id) q = q.where('mp.brand_id', '=', filters.brand_id);
  if (filters.seller_id) q = q.where('mp.seller_id', '=', filters.seller_id);
  if (filters.artwork_id) q = q.where('mp.artwork_id', '=', filters.artwork_id);

  switch (filters.sort) {
    case 'oldest':
      q = q.orderBy('mp.created_at', 'asc');
      break;
    case 'title':
      q = q.orderBy('mp.title', 'asc');
      break;
    default:
      q = q.orderBy('mp.created_at', 'desc');
  }

  return q.execute();
}

async function findEnrichedBySeller(sellerId, trx = db) {
  return enrichedProductQuery(trx)
    .where('mp.seller_id', '=', sellerId)
    .orderBy('mp.created_at', 'desc')
    .execute();
}

async function findEnrichedByStatus(status, trx = db) {
  return enrichedProductQuery(trx)
    .where('mp.status', '=', status)
    .orderBy('mp.updated_at', 'asc')
    .execute();
}

async function findEnrichedById(id, trx = db) {
  return enrichedProductQuery(trx).where('mp.id', '=', id).executeTakeFirst();
}

async function listPrintProviders(trx = db) {
  return trx
    .selectFrom('print_providers')
    .select(['id', 'name', 'integration_type', 'is_active'])
    .where('is_active', '=', true)
    .orderBy('name', 'asc')
    .execute();
}

/**
 * Seller sales roll-up used by the seller dashboard.
 */
async function getSellerSalesSummary(sellerId, trx = db) {
  return trx
    .selectFrom('order_items as oi')
    .innerJoin('orders as o', 'o.id', 'oi.order_id')
    .select([
      sql`count(distinct o.id)::int`.as('orders_count'),
      sql`coalesce(sum(oi.quantity), 0)::int`.as('units_sold'),
      sql`coalesce(sum(oi.unit_price_cents * oi.quantity), 0)::bigint`.as(
        'gross_cents'
      ),
    ])
    .where('oi.seller_id', '=', sellerId)
    .where('o.status', 'in', ['paid', 'fulfilled'])
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
  decrementStock,

  findPrintProviderById,

  findEnrichedPublished,
  findEnrichedBySeller,
  findEnrichedByStatus,
  findEnrichedById,
  listPrintProviders,
  getSellerSalesSummary,
};
