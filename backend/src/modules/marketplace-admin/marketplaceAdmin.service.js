// Admin-side management of the merch marketplace: every product in every
// status, seller accounts with their numbers, platform fee rules, print
// providers, order cancellation and review removal.
const { sql } = require('kysely');
const { db } = require('../../config');
const OrderFulfillmentService = require('../licenses/services/order-fullfillment.service');
const sellerProfileModel = require('../merch/models/sellerProfile.model');

const FULFILLMENT_TYPES = ['print_on_demand', 'in_house_stock', 'dropship'];
const INTEGRATION_TYPES = ['printful', 'printify', 'manual'];
const PRODUCT_STATUSES = [
  'draft',
  'pending_review',
  'published',
  'rejected',
  'suspended',
  'archived',
];

const clampLimit = (n, def = 50) => Math.min(Math.max(Number(n) || def, 1), 200);
const clampOffset = (n) => Math.max(Number(n) || 0, 0);

// ── Products ────────────────────────────────────────────────────────────

async function listProducts({ status, search, sellerId, limit, offset } = {}) {
  let q = db
    .selectFrom('merch_products as mp')
    .leftJoin('users as u', 'u.id', 'mp.seller_id')
    .leftJoin('brands as b', 'b.id', 'mp.brand_id')
    .leftJoin('artworks as a', 'a.id', 'mp.artwork_id')
    .select([
      'mp.id',
      'mp.title',
      'mp.status',
      'mp.base_product_type',
      'mp.fulfillment_type',
      'mp.seller_id',
      'mp.brand_id',
      'mp.artwork_id',
      'mp.license_id',
      'mp.created_at',
      'mp.updated_at',
      'u.username as seller_username',
      'b.name as brand_name',
      'a.title as artwork_title',
      sql`(select count(*)::int from merch_variants mv where mv.merch_product_id = mp.id)`.as(
        'variant_count'
      ),
      sql`(select min(mv.price_usd_cents) from merch_variants mv
            where mv.merch_product_id = mp.id and mv.is_active = true)`.as(
        'min_price_usd_cents'
      ),
      sql`(select max(mv.price_usd_cents) from merch_variants mv
            where mv.merch_product_id = mp.id and mv.is_active = true)`.as(
        'max_price_usd_cents'
      ),
      sql`(select coalesce(sum(oi.quantity), 0)::int from order_items oi
            join merch_variants mv on mv.id = oi.merch_variant_id
            join orders o on o.id = oi.order_id
            where mv.merch_product_id = mp.id and o.status in ('paid','fulfilled'))`.as(
        'units_sold'
      ),
    ])
    .orderBy('mp.updated_at', 'desc')
    .limit(clampLimit(limit))
    .offset(clampOffset(offset));

  if (status) q = q.where('mp.status', '=', status);
  if (sellerId) q = q.where('mp.seller_id', '=', sellerId);

  if (search) {
    const like = `%${String(search).trim()}%`;
    q = q.where((eb) =>
      eb.or([
        eb('mp.title', 'ilike', like),
        eb('u.username', 'ilike', like),
        eb('b.name', 'ilike', like),
      ])
    );
  }

  const [products, counts] = await Promise.all([
    q.execute(),
    db
      .selectFrom('merch_products')
      .select(['status', sql`count(*)::int`.as('count')])
      .groupBy('status')
      .execute(),
  ]);

  return { products, counts };
}

// Admin transitions outside the normal moderation flow:
//   published  -> suspended   (pull a live listing)
//   suspended  -> published   (reinstate)
//   any live-ish -> archived  (retire)
// pending_review products are decided through moderation, not here.
const ALLOWED_TRANSITIONS = {
  published: ['suspended', 'archived'],
  suspended: ['published', 'archived'],
  draft: ['archived'],
  rejected: ['archived'],
  archived: ['draft'],
};

async function setProductStatus(productId, status) {
  if (!PRODUCT_STATUSES.includes(status)) throw new Error('Invalid status');

  const product = await db
    .selectFrom('merch_products')
    .select(['id', 'status'])
    .where('id', '=', productId)
    .executeTakeFirst();

  if (!product) throw new Error('Product not found');

  if (!(ALLOWED_TRANSITIONS[product.status] || []).includes(status)) {
    throw new Error(`A ${product.status} product can't be moved to ${status}`);
  }

  return db
    .updateTable('merch_products')
    .set({ status, updated_at: new Date().toISOString() })
    .where('id', '=', productId)
    .returningAll()
    .executeTakeFirstOrThrow();
}

// ── Sellers ─────────────────────────────────────────────────────────────

async function listSellers({ status, search, limit, offset } = {}) {
  let q = db
    .selectFrom('seller_profiles as sp')
    .innerJoin('users as u', 'u.id', 'sp.user_id')
    .select([
      'sp.id',
      'sp.user_id',
      'sp.display_name',
      'sp.status',
      'sp.payout_ready',
      'sp.notes',
      'sp.reviewed_at',
      'sp.created_at',
      'u.username',
      'u.email',
      sql`(u.stripe_connect_id is not null)`.as('stripe_connected'),
      sql`(select count(*)::int from merch_products mp where mp.seller_id = sp.user_id)`.as(
        'products_total'
      ),
      sql`(select count(*)::int from merch_products mp
            where mp.seller_id = sp.user_id and mp.status = 'published')`.as(
        'products_live'
      ),
      sql`(select coalesce(sum(oi.unit_price_cents * oi.quantity), 0)::bigint
            from order_items oi join orders o on o.id = oi.order_id
            where oi.seller_id = sp.user_id and o.status in ('paid','fulfilled'))`.as(
        'gross_cents'
      ),
    ])
    .orderBy('sp.created_at', 'desc')
    .limit(clampLimit(limit, 100))
    .offset(clampOffset(offset));

  if (status) q = q.where('sp.status', '=', status);

  if (search) {
    const like = `%${String(search).trim()}%`;
    q = q.where((eb) =>
      eb.or([
        eb('sp.display_name', 'ilike', like),
        eb('u.username', 'ilike', like),
        eb('u.email', 'ilike', like),
      ])
    );
  }

  const rows = await q.execute();

  return rows.map((r) => ({ ...r, gross_cents: Number(r.gross_cents) }));
}

// Approve / reject / suspend a seller. Suspending also pulls their live
// standalone listings (brand listings belong to the brand, so are untouched);
// approving a previously suspended seller puts those listings back.
async function setSellerStatus(reviewerId, profileId, status, notes) {
  if (!['approved', 'rejected', 'suspended'].includes(status)) {
    throw new Error('Invalid decision');
  }

  return db.transaction().execute(async (trx) => {
    const profile = await trx
      .selectFrom('seller_profiles')
      .select(['id', 'user_id', 'status'])
      .where('id', '=', profileId)
      .forUpdate()
      .executeTakeFirst();

    if (!profile) throw new Error('Seller profile not found');

    const updated = await sellerProfileModel.decide(
      profileId,
      { reviewerId, status, notes },
      trx
    );

    if (status === 'suspended' || status === 'rejected') {
      await trx
        .updateTable('merch_products')
        .set({ status: 'suspended', updated_at: new Date().toISOString() })
        .where('seller_id', '=', profile.user_id)
        .where('brand_id', 'is', null)
        .where('status', '=', 'published')
        .execute();
    } else if (profile.status === 'suspended') {
      await trx
        .updateTable('merch_products')
        .set({ status: 'published', updated_at: new Date().toISOString() })
        .where('seller_id', '=', profile.user_id)
        .where('brand_id', 'is', null)
        .where('status', '=', 'suspended')
        .execute();
    }

    return updated;
  });
}

// ── Platform fee rules ──────────────────────────────────────────────────

function validateFeeInput({ fulfillment_type, base_product_type, fee_bps }) {
  if (fulfillment_type != null && !FULFILLMENT_TYPES.includes(fulfillment_type)) {
    throw new Error('Invalid fulfilment type');
  }

  if (fulfillment_type == null && base_product_type != null) {
    throw new Error('A product type needs a fulfilment type too');
  }

  if (!Number.isInteger(fee_bps) || fee_bps < 0 || fee_bps > 10000) {
    throw new Error('Fee must be a whole number of basis points between 0 and 10000');
  }
}

function friendlyConflict(err) {
  if (err?.code === '23505') {
    return new Error('An active rule already exists for that scope. Edit it instead.');
  }

  return err;
}

async function listFeeRules() {
  return db
    .selectFrom('platform_fee_rules')
    .selectAll()
    .orderBy('is_active', 'desc')
    .orderBy('fulfillment_type', 'asc')
    .orderBy('base_product_type', 'asc')
    .execute();
}

async function createFeeRule(input) {
  const rule = {
    fulfillment_type: input.fulfillment_type || null,
    base_product_type: input.base_product_type || null,
    fee_bps: input.fee_bps,
  };

  validateFeeInput(rule);

  try {
    return await db
      .insertInto('platform_fee_rules')
      .values({ ...rule, is_active: true })
      .returningAll()
      .executeTakeFirstOrThrow();
  } catch (err) {
    throw friendlyConflict(err);
  }
}

async function updateFeeRule(id, input) {
  const existing = await db
    .selectFrom('platform_fee_rules')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!existing) throw new Error('Fee rule not found');

  const patch = {};

  if (input.fee_bps !== undefined) {
    validateFeeInput({ ...existing, fee_bps: input.fee_bps });
    patch.fee_bps = input.fee_bps;
  }

  if (input.is_active !== undefined) {
    const isDefault =
      existing.fulfillment_type == null && existing.base_product_type == null;

    if (input.is_active === false && isDefault) {
      throw new Error('The default rule (digital licences) can be edited but not switched off');
    }

    patch.is_active = Boolean(input.is_active);
  }

  if (!Object.keys(patch).length) throw new Error('Nothing to update');

  try {
    return await db
      .updateTable('platform_fee_rules')
      .set(patch)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  } catch (err) {
    throw friendlyConflict(err);
  }
}

// ── Print providers ─────────────────────────────────────────────────────

// api_config can hold third-party credentials, so it is never sent back to
// the browser, only whether one is set.
function publicProvider(row) {
  const { api_config, ...rest } = row;

  return {
    ...rest,
    has_api_config: Boolean(api_config && Object.keys(api_config).length),
  };
}

async function listPrintProviders() {
  const rows = await db
    .selectFrom('print_providers')
    .selectAll()
    .orderBy('is_active', 'desc')
    .orderBy('name', 'asc')
    .execute();

  return rows.map(publicProvider);
}

function assertApiConfig(cfg) {
  if (cfg !== undefined && (cfg === null || typeof cfg !== 'object' || Array.isArray(cfg))) {
    throw new Error('api_config must be a JSON object');
  }
}

async function createPrintProvider({ name, integration_type = 'manual', api_config }) {
  if (!String(name || '').trim()) throw new Error('Name is required');

  if (!INTEGRATION_TYPES.includes(integration_type)) {
    throw new Error('Invalid integration type');
  }

  assertApiConfig(api_config);

  const row = await db
    .insertInto('print_providers')
    .values({
      name: String(name).trim(),
      integration_type,
      api_config: JSON.stringify(api_config || {}),
      is_active: true,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return publicProvider(row);
}

// Providers are deactivated rather than deleted: products reference them.
async function updatePrintProvider(id, input) {
  const patch = {};

  if (input.name !== undefined) {
    if (!String(input.name).trim()) throw new Error('Name cannot be empty');
    patch.name = String(input.name).trim();
  }

  if (input.integration_type !== undefined) {
    if (!INTEGRATION_TYPES.includes(input.integration_type)) {
      throw new Error('Invalid integration type');
    }
    patch.integration_type = input.integration_type;
  }

  if (input.is_active !== undefined) patch.is_active = Boolean(input.is_active);

  if (input.api_config !== undefined) {
    assertApiConfig(input.api_config);
    patch.api_config = JSON.stringify(input.api_config);
  }

  if (!Object.keys(patch).length) throw new Error('Nothing to update');

  const row = await db
    .updateTable('print_providers')
    .set(patch)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();

  if (!row) throw new Error('Print provider not found');

  return publicProvider(row);
}

// ── Orders ──────────────────────────────────────────────────────────────

// Admin cancel of an unpaid order (stock goes back). Paid orders need a
// refund through Stripe, which is deliberately not done from here.
async function cancelOrder(orderId) {
  const order = await db
    .selectFrom('orders')
    .select(['id', 'status', 'stripe_payment_intent_id'])
    .where('id', '=', orderId)
    .executeTakeFirst();

  if (!order) throw new Error('Order not found');

  if (order.status !== 'pending') {
    throw new Error('Only unpaid orders can be cancelled here. Paid orders need a refund.');
  }

  await OrderFulfillmentService.markOrderAsFailed(orderId);

  return db.selectFrom('orders').selectAll().where('id', '=', orderId).executeTakeFirst();
}

// ── Reviews ─────────────────────────────────────────────────────────────

async function listReviews({ rating, search, limit, offset } = {}) {
  let q = db
    .selectFrom('product_reviews as pr')
    .leftJoin('users as u', 'u.id', 'pr.reviewer_id')
    .leftJoin('merch_products as mp', 'mp.id', 'pr.target_id')
    .select([
      'pr.id',
      'pr.rating',
      'pr.body',
      'pr.target_type',
      'pr.target_id',
      'pr.created_at',
      'u.username as reviewer_username',
      'mp.title as product_title',
    ])
    .where('pr.deleted_at', 'is', null)
    .orderBy('pr.created_at', 'desc')
    .limit(clampLimit(limit))
    .offset(clampOffset(offset));

  if (rating) q = q.where('pr.rating', '=', Number(rating));

  if (search) {
    const like = `%${String(search).trim()}%`;
    q = q.where((eb) =>
      eb.or([eb('pr.body', 'ilike', like), eb('mp.title', 'ilike', like), eb('u.username', 'ilike', like)])
    );
  }

  return q.execute();
}

async function removeReview(id) {
  const row = await db
    .updateTable('product_reviews')
    .set({ deleted_at: new Date().toISOString() })
    .where('id', '=', id)
    .where('deleted_at', 'is', null)
    .returning('id')
    .executeTakeFirst();

  if (!row) throw new Error('Review not found');

  return row;
}

module.exports = {
  listProducts,
  setProductStatus,
  listSellers,
  setSellerStatus,
  listFeeRules,
  createFeeRule,
  updateFeeRule,
  listPrintProviders,
  createPrintProvider,
  updatePrintProvider,
  cancelOrder,
  listReviews,
  removeReview,
};
