// src/migrations/20260912000000_add_merch_marketplace_schema.js
//
// Implements the "Contests → Commerce" marketplace expansion: physical/POD
// merch, cart + multi-seller checkout, fulfillment/shipping, seller payouts,
// and product reviews. Everything here is additive — no existing table is
// renamed or dropped, per the planning doc.
//
// Style notes (matching this repo's conventions):
//  - New tables use the Kysely schema builder with .ifNotExists(), same as
//    judge_invite_tokens.
//  - Status/type columns use `text` + a CHECK constraint wrapped in a
//    DO $$ ... EXCEPTION WHEN duplicate_object $$ guard, same as
//    contest_entries.licensing_status, rather than native Postgres ENUM
//    types — keeps the migration idempotent and consistent with the rest of
//    the schema.
//  - ALTER ... ADD COLUMN IF NOT EXISTS for changes to existing tables, so
//    this can be re-run safely.
//
// Decisions this migration bakes in (see the doc's "open questions", §07):
//  1. Seller model: ANY user can sell merch, not just verified brands.
//     merch_products.seller_id -> users.id is required; brand_id stays
//     optional. A lightweight `seller_profiles` table gives individual
//     creators a KYC/payout-readiness record distinct from the heavier
//     brand_verification_requests (which assumes a registered company).
//  2. Licensing a third party's artwork onto merch: merch_products gets a
//     nullable `license_id` FK to `licenses`. It's enforced at the service
//     layer (merch.service.js), not the DB, because the rule is conditional
//     (only required when seller_id !== artworks.creator_id) and a CHECK
//     constraint can't join across tables.
//  3. Platform fee varies by fulfillment type: `platform_fee_rules` gives a
//     per-fulfillment-type (and optional per-product-type) fee percentage,
//     read by payout.service instead of trusting a client-supplied fee.
//  4. International shipping/tax: explicitly scoped out. `addresses` and
//     `fulfillments` carry a plain `country` column so Phase 1 can ship
//     domestically without blocking on a tax-jurisdiction model later.

const { sql } = require('kysely');

async function up(db) {
  // ---------------------------------------------------------------------
  // CATALOG: print providers, merch products & variants
  // ---------------------------------------------------------------------
  await db.schema
    .createTable('print_providers')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('integration_type', 'text', (col) =>
      col.notNull().defaultTo('manual')
    ) // 'printful' | 'printify' | 'manual'
    .addColumn('api_config', 'jsonb', (col) => col.notNull().defaultTo('{}'))
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  await sql`
    DO $$ BEGIN
      ALTER TABLE print_providers
        ADD CONSTRAINT print_providers_integration_type_check
        CHECK (integration_type IN ('printful', 'printify', 'manual'));
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  // Lightweight seller identity for individual creators (not a company).
  // Deliberately separate from brand_verification_requests: no company_name,
  // no documents-as-incorporation-proof — just enough to say "this user is
  // allowed to sell and has a payout method on file".
  await db.schema
    .createTable('seller_profiles')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'uuid', (col) =>
      col.notNull().unique().references('users.id').onDelete('cascade')
    )
    .addColumn('display_name', 'text', (col) => col.notNull())
    .addColumn('status', 'text', (col) => col.notNull().defaultTo('pending'))
    // 'pending' | 'approved' | 'rejected' | 'suspended'
    .addColumn('payout_ready', 'boolean', (col) =>
      col.notNull().defaultTo(false)
    ) // true once stripe_connect_id / payout_method is usable
    .addColumn('reviewed_by', 'uuid', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .addColumn('reviewed_at', 'timestamptz')
    .addColumn('notes', 'text')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  await sql`
    DO $$ BEGIN
      ALTER TABLE seller_profiles
        ADD CONSTRAINT seller_profiles_status_check
        CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  await db.schema
    .createTable('merch_products')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('seller_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('brand_id', 'uuid', (col) =>
      col.references('brands.id').onDelete('set null')
    ) // nullable — individual creators have no brand
    .addColumn('artwork_id', 'uuid', (col) =>
      col.references('artworks.id').onDelete('set null')
    ) // nullable = standalone product
    .addColumn('license_id', 'uuid', (col) =>
      col.references('licenses.id').onDelete('set null')
    ) // set when artwork isn't the seller's own — see open question #2
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('base_product_type', 'text', (col) => col.notNull()) // 'tshirt','mug','poster',...
    .addColumn('fulfillment_type', 'text', (col) => col.notNull())
    .addColumn('print_provider_id', 'uuid', (col) =>
      col.references('print_providers.id').onDelete('set null')
    )
    .addColumn('status', 'text', (col) => col.notNull().defaultTo('draft'))
    // 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived'
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('deleted_at', 'timestamptz')
    .execute();

  await sql`
    DO $$ BEGIN
      ALTER TABLE merch_products
        ADD CONSTRAINT merch_products_fulfillment_type_check
        CHECK (fulfillment_type IN ('print_on_demand', 'in_house_stock', 'dropship'));
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  await sql`
    DO $$ BEGIN
      ALTER TABLE merch_products
        ADD CONSTRAINT merch_products_status_check
        CHECK (status IN ('draft', 'pending_review', 'published', 'rejected', 'suspended', 'archived'));
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  await db.schema
    .createIndex('merch_products_seller_idx')
    .ifNotExists()
    .on('merch_products')
    .column('seller_id')
    .execute();

  await db.schema
    .createIndex('merch_products_artwork_idx')
    .ifNotExists()
    .on('merch_products')
    .column('artwork_id')
    .execute();

  await db.schema
    .createIndex('merch_products_status_idx')
    .ifNotExists()
    .on('merch_products')
    .column('status')
    .execute();

  await db.schema
    .createTable('merch_variants')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('merch_product_id', 'uuid', (col) =>
      col.notNull().references('merch_products.id').onDelete('cascade')
    )
    .addColumn('sku', 'text', (col) => col.notNull().unique())
    .addColumn('size', 'text')
    .addColumn('color', 'text')
    .addColumn('material', 'text')
    .addColumn('price_inr_cents', 'integer', (col) => col.notNull())
    .addColumn('price_usd_cents', 'integer', (col) => col.notNull())
    .addColumn('stock_qty', 'integer') // null for pure POD (unbounded)
    .addColumn('weight_grams', 'integer')
    .addColumn('print_file_url', 'text')
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  await sql`
    DO $$ BEGIN
      ALTER TABLE merch_variants
        ADD CONSTRAINT merch_variants_price_inr_check CHECK (price_inr_cents >= 0);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  await sql`
    DO $$ BEGIN
      ALTER TABLE merch_variants
        ADD CONSTRAINT merch_variants_price_usd_check CHECK (price_usd_cents >= 0);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  await sql`
    DO $$ BEGIN
      ALTER TABLE merch_variants
        ADD CONSTRAINT merch_variants_stock_qty_check CHECK (stock_qty IS NULL OR stock_qty >= 0);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  await db.schema
    .createIndex('merch_variants_product_idx')
    .ifNotExists()
    .on('merch_variants')
    .column('merch_product_id')
    .execute();

  // ---------------------------------------------------------------------
  // CHECKOUT: cart & multi-seller order support
  // ---------------------------------------------------------------------
  await db.schema
    .createTable('carts')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('status', 'text', (col) => col.notNull().defaultTo('active'))
    // 'active' | 'converted' | 'abandoned'
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  await sql`
    DO $$ BEGIN
      ALTER TABLE carts
        ADD CONSTRAINT carts_status_check
        CHECK (status IN ('active', 'converted', 'abandoned'));
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  // Only one active cart per user — findActiveCart/createCart in
  // cart.model.js assumes this; enforce it so a race can't create two.
  await db.schema
    .createIndex('carts_user_active_unique_idx')
    .ifNotExists()
    .on('carts')
    .column('user_id')
    .where('status', '=', 'active')
    .unique()
    .execute();

  await db.schema
    .createTable('cart_items')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('cart_id', 'uuid', (col) =>
      col.notNull().references('carts.id').onDelete('cascade')
    )
    .addColumn('item_type', 'text', (col) => col.notNull())
    // 'license' | 'merch_variant'
    .addColumn('artwork_id', 'uuid', (col) =>
      col.references('artworks.id').onDelete('cascade')
    )
    .addColumn('license_type', 'text')
    .addColumn('merch_variant_id', 'uuid', (col) =>
      col.references('merch_variants.id').onDelete('cascade')
    )
    .addColumn('quantity', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  await sql`
    DO $$ BEGIN
      ALTER TABLE cart_items
        ADD CONSTRAINT cart_items_item_type_check
        CHECK (item_type IN ('license', 'merch_variant'));
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  await sql`
    DO $$ BEGIN
      ALTER TABLE cart_items
        ADD CONSTRAINT cart_items_quantity_check CHECK (quantity >= 1);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  // A license item must carry a license_type + artwork_id and no variant;
  // a merch_variant item must carry a variant and no license_type. Keeps
  // cart_items honest at the DB level, not just in cart.service.js.
  await sql`
    DO $$ BEGIN
      ALTER TABLE cart_items
        ADD CONSTRAINT cart_items_shape_check
        CHECK (
          (item_type = 'license'
            AND artwork_id IS NOT NULL
            AND license_type IS NOT NULL
            AND merch_variant_id IS NULL)
          OR
          (item_type = 'merch_variant'
            AND merch_variant_id IS NOT NULL
            AND license_type IS NULL)
        );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  await db.schema
    .createIndex('cart_items_cart_idx')
    .ifNotExists()
    .on('cart_items')
    .column('cart_id')
    .execute();

  // orders/order_items: make a single order line-item owned by a seller, so
  // one cart checkout can fan out into per-seller orders (or a single order
  // with mixed-seller line items, depending on how checkout is modeled) —
  // see cart.service.js#checkout.
  await sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS cart_id uuid REFERENCES carts(id)
  `.execute(db);

  // A cart checkout that spans sellers no longer has one seller for the
  // whole order — seller now lives per-line-item (order_items.seller_id
  // below). Existing single-seller orders are untouched; this only widens
  // what's allowed going forward.
  await sql`ALTER TABLE orders ALTER COLUMN seller_id DROP NOT NULL`.execute(
    db
  );

  await sql`
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'license'
  `.execute(db);

  await sql`
    DO $$ BEGIN
      ALTER TABLE order_items
        ADD CONSTRAINT order_items_item_type_check
        CHECK (item_type IN ('license', 'merch_variant'));
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  await sql`
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS merch_variant_id uuid
      REFERENCES merch_variants(id)
  `.execute(db);

  await sql`
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES users(id)
  `.execute(db);

  // Backfill: every pre-existing order_item inherits its seller from the
  // order it belongs to, so seller_id is never null for historical rows even
  // though the column has no NOT NULL constraint (a mixed-seller cart order
  // has no single seller on the order itself).
  await sql`
    UPDATE order_items oi
    SET seller_id = o.seller_id
    FROM orders o
    WHERE oi.order_id = o.id
      AND oi.seller_id IS NULL
  `.execute(db);

  await db.schema
    .createIndex('order_items_seller_idx')
    .ifNotExists()
    .on('order_items')
    .column('seller_id')
    .execute();

  // ---------------------------------------------------------------------
  // FULFILLMENT: addresses, shipments
  // ---------------------------------------------------------------------
  await db.schema
    .createTable('addresses')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('full_name', 'text', (col) => col.notNull())
    .addColumn('phone', 'text')
    .addColumn('line1', 'text', (col) => col.notNull())
    .addColumn('line2', 'text')
    .addColumn('city', 'text', (col) => col.notNull())
    .addColumn('state', 'text')
    .addColumn('postal_code', 'text', (col) => col.notNull())
    .addColumn('country', 'text', (col) => col.notNull()) // ISO 3166-1 alpha-2
    .addColumn('is_default', 'boolean', (col) =>
      col.notNull().defaultTo(false)
    )
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('deleted_at', 'timestamptz')
    .execute();

  await db.schema
    .createIndex('addresses_user_idx')
    .ifNotExists()
    .on('addresses')
    .column('user_id')
    .execute();

  // Buyer's chosen shipping address at checkout time, for orders that
  // contain physical goods. Nullable — a pure-license order never needs one.
  // Added here (not in the earlier orders/order_items block) because it
  // references addresses, which doesn't exist until this point.
  await sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_id uuid
      REFERENCES addresses(id)
  `.execute(db);

  await db.schema
    .createTable('fulfillments')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('order_id', 'uuid', (col) =>
      col.notNull().references('orders.id').onDelete('cascade')
    )
    .addColumn('seller_id', 'uuid', (col) =>
      col.references('users.id').onDelete('set null')
    ) // which seller's line items this shipment covers
    .addColumn('address_id', 'uuid', (col) =>
      col.references('addresses.id').onDelete('set null')
    )
    .addColumn('print_provider_id', 'uuid', (col) =>
      col.references('print_providers.id').onDelete('set null')
    )
    .addColumn('status', 'text', (col) => col.notNull().defaultTo('pending'))
    .addColumn('carrier', 'text')
    .addColumn('tracking_number', 'text')
    .addColumn('tracking_url', 'text')
    .addColumn('shipped_at', 'timestamptz')
    .addColumn('delivered_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  await sql`
    DO $$ BEGIN
      ALTER TABLE fulfillments
        ADD CONSTRAINT fulfillments_status_check
        CHECK (status IN ('pending', 'in_production', 'shipped', 'delivered', 'failed', 'returned'));
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  await db.schema
    .createIndex('fulfillments_order_idx')
    .ifNotExists()
    .on('fulfillments')
    .column('order_id')
    .execute();

  await db.schema
    .createTable('fulfillment_items')
    .ifNotExists()
    .addColumn('fulfillment_id', 'uuid', (col) =>
      col.notNull().references('fulfillments.id').onDelete('cascade')
    )
    .addColumn('order_item_id', 'uuid', (col) =>
      col.notNull().references('order_items.id').onDelete('cascade')
    )
    .addPrimaryKeyConstraint('fulfillment_items_pkey', [
      'fulfillment_id',
      'order_item_id',
    ])
    .execute();

  // ---------------------------------------------------------------------
  // MONEY: platform fee rules, payouts, reviews
  // ---------------------------------------------------------------------
  await db.schema
    .createTable('platform_fee_rules')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('fulfillment_type', 'text') // null = applies to digital licenses
    .addColumn('base_product_type', 'text') // null = applies to all product types under fulfillment_type
    .addColumn('fee_bps', 'integer', (col) => col.notNull()) // basis points, e.g. 1500 = 15%
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  await sql`
    DO $$ BEGIN
      ALTER TABLE platform_fee_rules
        ADD CONSTRAINT platform_fee_rules_fee_bps_check
        CHECK (fee_bps >= 0 AND fee_bps <= 10000);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  // One active rule per (fulfillment_type, base_product_type) pair,
  // including the NULL/NULL "digital license" default and the
  // NULL-base_product_type "applies to all products of this fulfillment
  // type" wildcard.
  await db.schema
    .createIndex('platform_fee_rules_scope_unique_idx')
    .ifNotExists()
    .on('platform_fee_rules')
    .columns(['fulfillment_type', 'base_product_type'])
    .where('is_active', '=', true)
    .unique()
    .execute();

  // Seed sane defaults: 15% on digital licenses (unchanged behavior),
  // 12% on in-house-stock merch, 20% on print-on-demand (thinner margins
  // per the doc's open question #3), 18% on dropship.
  await sql`
    INSERT INTO platform_fee_rules (fulfillment_type, base_product_type, fee_bps)
    SELECT NULL, NULL, 1500
    WHERE NOT EXISTS (
      SELECT 1 FROM platform_fee_rules WHERE fulfillment_type IS NULL AND base_product_type IS NULL
    )
  `.execute(db);

  await sql`
    INSERT INTO platform_fee_rules (fulfillment_type, base_product_type, fee_bps)
    SELECT 'in_house_stock', NULL, 1200
    WHERE NOT EXISTS (
      SELECT 1 FROM platform_fee_rules WHERE fulfillment_type = 'in_house_stock' AND base_product_type IS NULL
    )
  `.execute(db);

  await sql`
    INSERT INTO platform_fee_rules (fulfillment_type, base_product_type, fee_bps)
    SELECT 'print_on_demand', NULL, 2000
    WHERE NOT EXISTS (
      SELECT 1 FROM platform_fee_rules WHERE fulfillment_type = 'print_on_demand' AND base_product_type IS NULL
    )
  `.execute(db);

  await sql`
    INSERT INTO platform_fee_rules (fulfillment_type, base_product_type, fee_bps)
    SELECT 'dropship', NULL, 1800
    WHERE NOT EXISTS (
      SELECT 1 FROM platform_fee_rules WHERE fulfillment_type = 'dropship' AND base_product_type IS NULL
    )
  `.execute(db);

  await db.schema
    .createTable('payouts')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('seller_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('order_item_id', 'uuid', (col) =>
      col
        .notNull()
        .unique()
        .references('order_items.id')
        .onDelete('cascade')
    )
    .addColumn('gross_cents', 'integer', (col) => col.notNull())
    .addColumn('platform_fee_cents', 'integer', (col) => col.notNull())
    .addColumn('net_cents', 'integer', (col) => col.notNull())
    .addColumn('status', 'text', (col) => col.notNull().defaultTo('pending'))
    // 'pending' | 'paid' | 'failed'
    .addColumn('stripe_transfer_id', 'text')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  await sql`
    DO $$ BEGIN
      ALTER TABLE payouts
        ADD CONSTRAINT payouts_status_check
        CHECK (status IN ('pending', 'paid', 'failed'));
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  await sql`
    DO $$ BEGIN
      ALTER TABLE payouts
        ADD CONSTRAINT payouts_amounts_check
        CHECK (gross_cents >= 0 AND platform_fee_cents >= 0
          AND platform_fee_cents <= gross_cents
          AND net_cents = gross_cents - platform_fee_cents);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  await db.schema
    .createIndex('payouts_seller_idx')
    .ifNotExists()
    .on('payouts')
    .column('seller_id')
    .execute();

  await db.schema
    .createTable('product_reviews')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('reviewer_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('target_type', 'text', (col) => col.notNull())
    // 'artwork' | 'merch_product'
    .addColumn('target_id', 'uuid', (col) => col.notNull())
    .addColumn('order_item_id', 'uuid', (col) =>
      col
        .notNull()
        .unique()
        .references('order_items.id')
        .onDelete('cascade')
    ) // verified purchase, one review per purchase line
    .addColumn('rating', 'integer', (col) => col.notNull())
    .addColumn('body', 'text')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('deleted_at', 'timestamptz')
    .execute();

  await sql`
    DO $$ BEGIN
      ALTER TABLE product_reviews
        ADD CONSTRAINT product_reviews_target_type_check
        CHECK (target_type IN ('artwork', 'merch_product'));
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  await sql`
    DO $$ BEGIN
      ALTER TABLE product_reviews
        ADD CONSTRAINT product_reviews_rating_check
        CHECK (rating BETWEEN 1 AND 5);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);

  await db.schema
    .createIndex('product_reviews_target_idx')
    .ifNotExists()
    .on('product_reviews')
    .columns(['target_type', 'target_id'])
    .execute();
}

// Not reversed: several steps here are additive-with-backfill (order_items
// seller_id) or seed data (platform_fee_rules), matching this repo's
// convention of leaving destructive down() migrations out rather than risk
// dropping data on a production rollback.
async function down() {}

module.exports = { up, down };
