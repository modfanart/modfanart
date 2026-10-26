-- add_merch_marketplace_schema.sql
--
-- Plain-SQL equivalent of 20260912000000_add_merch_marketplace_schema.js,
-- for running directly (Supabase SQL editor / psql) so PostgREST exposes the
-- new tables. Fully idempotent and additive: safe to re-run.
--
-- Requires: Postgres 13+ (gen_random_uuid built in), and existing tables
-- users, brands, artworks, licenses, orders, order_items.

BEGIN;

-- Helper: add a CHECK constraint only if it doesn't already exist.
-- Lives in pg_temp, so it disappears at the end of the session.
CREATE OR REPLACE FUNCTION pg_temp.add_check(tbl regclass, cname text, def text)
RETURNS void LANGUAGE plpgsql AS $f$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = tbl AND conname = cname
  ) THEN
    EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I CHECK (%s)', tbl, cname, def);
  END IF;
END $f$;

-- ---------------------------------------------------------------------
-- CATALOG: print providers, seller profiles, merch products & variants
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS print_providers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  integration_type text NOT NULL DEFAULT 'manual',  -- 'printful' | 'printify' | 'manual'
  api_config       jsonb NOT NULL DEFAULT '{}',
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);
SELECT pg_temp.add_check('print_providers', 'print_providers_integration_type_check',
  $$integration_type IN ('printful', 'printify', 'manual')$$);

CREATE TABLE IF NOT EXISTS seller_profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name  text NOT NULL,
  status        text NOT NULL DEFAULT 'pending',  -- pending | approved | rejected | suspended
  payout_ready  boolean NOT NULL DEFAULT false,
  reviewed_by   uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at   timestamptz,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
SELECT pg_temp.add_check('seller_profiles', 'seller_profiles_status_check',
  $$status IN ('pending', 'approved', 'rejected', 'suspended')$$);

CREATE TABLE IF NOT EXISTS merch_products (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_id          uuid REFERENCES brands(id) ON DELETE SET NULL,
  artwork_id        uuid REFERENCES artworks(id) ON DELETE SET NULL,
  license_id        uuid REFERENCES licenses(id) ON DELETE SET NULL,
  title             text NOT NULL,
  description       text,
  base_product_type text NOT NULL,
  fulfillment_type  text NOT NULL,
  print_provider_id uuid REFERENCES print_providers(id) ON DELETE SET NULL,
  status            text NOT NULL DEFAULT 'draft',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);
SELECT pg_temp.add_check('merch_products', 'merch_products_fulfillment_type_check',
  $$fulfillment_type IN ('print_on_demand', 'in_house_stock', 'dropship')$$);
SELECT pg_temp.add_check('merch_products', 'merch_products_status_check',
  $$status IN ('draft', 'pending_review', 'published', 'rejected', 'suspended', 'archived')$$);
CREATE INDEX IF NOT EXISTS merch_products_seller_idx  ON merch_products (seller_id);
CREATE INDEX IF NOT EXISTS merch_products_artwork_idx ON merch_products (artwork_id);
CREATE INDEX IF NOT EXISTS merch_products_status_idx  ON merch_products (status);

CREATE TABLE IF NOT EXISTS merch_variants (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merch_product_id uuid NOT NULL REFERENCES merch_products(id) ON DELETE CASCADE,
  sku              text NOT NULL UNIQUE,
  size             text,
  color            text,
  material         text,
  price_inr_cents  integer NOT NULL,
  price_usd_cents  integer NOT NULL,
  stock_qty        integer,          -- null for pure POD (unbounded)
  weight_grams     integer,
  print_file_url   text,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);
SELECT pg_temp.add_check('merch_variants', 'merch_variants_price_inr_check', 'price_inr_cents >= 0');
SELECT pg_temp.add_check('merch_variants', 'merch_variants_price_usd_check', 'price_usd_cents >= 0');
SELECT pg_temp.add_check('merch_variants', 'merch_variants_stock_qty_check', 'stock_qty IS NULL OR stock_qty >= 0');
CREATE INDEX IF NOT EXISTS merch_variants_product_idx ON merch_variants (merch_product_id);

-- ---------------------------------------------------------------------
-- CHECKOUT: carts & multi-seller order support
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     text NOT NULL DEFAULT 'active',  -- active | converted | abandoned
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
SELECT pg_temp.add_check('carts', 'carts_status_check',
  $$status IN ('active', 'converted', 'abandoned')$$);
-- Only one active cart per user.
CREATE UNIQUE INDEX IF NOT EXISTS carts_user_active_unique_idx
  ON carts (user_id) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS cart_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id          uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  item_type        text NOT NULL,  -- 'license' | 'merch_variant'
  artwork_id       uuid REFERENCES artworks(id) ON DELETE CASCADE,
  license_type     text,
  merch_variant_id uuid REFERENCES merch_variants(id) ON DELETE CASCADE,
  quantity         integer NOT NULL DEFAULT 1,
  created_at       timestamptz NOT NULL DEFAULT now()
);
SELECT pg_temp.add_check('cart_items', 'cart_items_item_type_check',
  $$item_type IN ('license', 'merch_variant')$$);
SELECT pg_temp.add_check('cart_items', 'cart_items_quantity_check', 'quantity >= 1');
SELECT pg_temp.add_check('cart_items', 'cart_items_shape_check',
  $$(item_type = 'license' AND artwork_id IS NOT NULL AND license_type IS NOT NULL AND merch_variant_id IS NULL)
    OR (item_type = 'merch_variant' AND merch_variant_id IS NOT NULL AND license_type IS NULL)$$);
CREATE INDEX IF NOT EXISTS cart_items_cart_idx ON cart_items (cart_id);

-- Existing tables: additive changes only.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cart_id uuid REFERENCES carts(id);

-- Seller now lives per line item; a mixed-seller order has no single seller.
ALTER TABLE orders ALTER COLUMN seller_id DROP NOT NULL;

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'license';
SELECT pg_temp.add_check('order_items', 'order_items_item_type_check',
  $$item_type IN ('license', 'merch_variant')$$);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS merch_variant_id uuid REFERENCES merch_variants(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES users(id);

-- Backfill: historical order_items inherit seller from their order.
UPDATE order_items oi
SET seller_id = o.seller_id
FROM orders o
WHERE oi.order_id = o.id
  AND oi.seller_id IS NULL;

CREATE INDEX IF NOT EXISTS order_items_seller_idx ON order_items (seller_id);

-- ---------------------------------------------------------------------
-- FULFILLMENT: addresses, shipments
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name   text NOT NULL,
  phone       text,
  line1       text NOT NULL,
  line2       text,
  city        text NOT NULL,
  state       text,
  postal_code text NOT NULL,
  country     text NOT NULL,  -- ISO 3166-1 alpha-2
  is_default  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);
CREATE INDEX IF NOT EXISTS addresses_user_idx ON addresses (user_id);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_id uuid REFERENCES addresses(id);

CREATE TABLE IF NOT EXISTS fulfillments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_id         uuid REFERENCES users(id) ON DELETE SET NULL,
  address_id        uuid REFERENCES addresses(id) ON DELETE SET NULL,
  print_provider_id uuid REFERENCES print_providers(id) ON DELETE SET NULL,
  status            text NOT NULL DEFAULT 'pending',
  carrier           text,
  tracking_number   text,
  tracking_url      text,
  shipped_at        timestamptz,
  delivered_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);
SELECT pg_temp.add_check('fulfillments', 'fulfillments_status_check',
  $$status IN ('pending', 'in_production', 'shipped', 'delivered', 'failed', 'returned')$$);
CREATE INDEX IF NOT EXISTS fulfillments_order_idx ON fulfillments (order_id);

CREATE TABLE IF NOT EXISTS fulfillment_items (
  fulfillment_id uuid NOT NULL REFERENCES fulfillments(id) ON DELETE CASCADE,
  order_item_id  uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  CONSTRAINT fulfillment_items_pkey PRIMARY KEY (fulfillment_id, order_item_id)
);

-- ---------------------------------------------------------------------
-- MONEY: platform fee rules, payouts, reviews
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_fee_rules (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fulfillment_type  text,  -- null = digital licenses
  base_product_type text,  -- null = all product types under fulfillment_type
  fee_bps           integer NOT NULL,  -- 1500 = 15%
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);
SELECT pg_temp.add_check('platform_fee_rules', 'platform_fee_rules_fee_bps_check',
  'fee_bps >= 0 AND fee_bps <= 10000');

-- One active rule per scope. NOTE: the original Kysely index on the raw
-- columns did NOT enforce this for NULL pairs (NULLs are distinct in a
-- unique index), so duplicate "digital default" / wildcard rules were
-- possible. COALESCE makes NULLs compare equal. Works on all PG versions.
CREATE UNIQUE INDEX IF NOT EXISTS platform_fee_rules_scope_unique_idx
  ON platform_fee_rules (COALESCE(fulfillment_type, ''), COALESCE(base_product_type, ''))
  WHERE is_active = true;

-- Seed defaults (skipped if a rule for that scope already exists).
INSERT INTO platform_fee_rules (fulfillment_type, base_product_type, fee_bps)
SELECT NULL, NULL, 1500
WHERE NOT EXISTS (SELECT 1 FROM platform_fee_rules WHERE fulfillment_type IS NULL AND base_product_type IS NULL);

INSERT INTO platform_fee_rules (fulfillment_type, base_product_type, fee_bps)
SELECT 'in_house_stock', NULL, 1200
WHERE NOT EXISTS (SELECT 1 FROM platform_fee_rules WHERE fulfillment_type = 'in_house_stock' AND base_product_type IS NULL);

INSERT INTO platform_fee_rules (fulfillment_type, base_product_type, fee_bps)
SELECT 'print_on_demand', NULL, 2000
WHERE NOT EXISTS (SELECT 1 FROM platform_fee_rules WHERE fulfillment_type = 'print_on_demand' AND base_product_type IS NULL);

INSERT INTO platform_fee_rules (fulfillment_type, base_product_type, fee_bps)
SELECT 'dropship', NULL, 1800
WHERE NOT EXISTS (SELECT 1 FROM platform_fee_rules WHERE fulfillment_type = 'dropship' AND base_product_type IS NULL);

CREATE TABLE IF NOT EXISTS payouts (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_item_id      uuid NOT NULL UNIQUE REFERENCES order_items(id) ON DELETE CASCADE,
  gross_cents        integer NOT NULL,
  platform_fee_cents integer NOT NULL,
  net_cents          integer NOT NULL,
  status             text NOT NULL DEFAULT 'pending',  -- pending | paid | failed
  stripe_transfer_id text,
  created_at         timestamptz NOT NULL DEFAULT now()
);
SELECT pg_temp.add_check('payouts', 'payouts_status_check', $$status IN ('pending', 'paid', 'failed')$$);
SELECT pg_temp.add_check('payouts', 'payouts_amounts_check',
  $$gross_cents >= 0 AND platform_fee_cents >= 0
    AND platform_fee_cents <= gross_cents
    AND net_cents = gross_cents - platform_fee_cents$$);
CREATE INDEX IF NOT EXISTS payouts_seller_idx ON payouts (seller_id);

CREATE TABLE IF NOT EXISTS product_reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type   text NOT NULL,  -- 'artwork' | 'merch_product'
  target_id     uuid NOT NULL,
  order_item_id uuid NOT NULL UNIQUE REFERENCES order_items(id) ON DELETE CASCADE,
  rating        integer NOT NULL,
  body          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);
SELECT pg_temp.add_check('product_reviews', 'product_reviews_target_type_check',
  $$target_type IN ('artwork', 'merch_product')$$);
SELECT pg_temp.add_check('product_reviews', 'product_reviews_rating_check', 'rating BETWEEN 1 AND 5');
CREATE INDEX IF NOT EXISTS product_reviews_target_idx ON product_reviews (target_type, target_id);

COMMIT;

-- ---------------------------------------------------------------------
-- POSTGREST: make the new tables visible
-- ---------------------------------------------------------------------
-- PostgREST caches the schema; this tells it to reload without a restart.
NOTIFY pgrst, 'reload schema';

-- OPTIONAL — uncomment and adapt to match how your existing tables are
-- exposed. Without grants, the anon/authenticated roles can't see these
-- tables through PostgREST. With RLS enabled and no policies, only the
-- service role (which bypasses RLS) can access them. Review before use:
--
-- GRANT SELECT, INSERT, UPDATE, DELETE ON
--   print_providers, seller_profiles, merch_products, merch_variants,
--   carts, cart_items, addresses, fulfillments, fulfillment_items,
--   platform_fee_rules, payouts, product_reviews
-- TO authenticated;
--
-- ALTER TABLE print_providers   ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE seller_profiles   ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE merch_products    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE merch_variants    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE carts             ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cart_items        ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE addresses         ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE fulfillments      ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE fulfillment_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE platform_fee_rules ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payouts           ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_reviews   ENABLE ROW LEVEL SECURITY;

ALTER TABLE contest_entries
ADD COLUMN IF NOT EXISTS licensing_status VARCHAR(50);