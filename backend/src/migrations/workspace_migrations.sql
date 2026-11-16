-- workspace_migrations.sql
--
-- Run once on the main database (safe to re-run). Same as Kysely migration
-- 20261115000000_audit_events_and_staff_permissions.js.
--
--   * audited_events: created if missing (the activity log model wrote to it
--     but no migration created it); legacy tables upgraded in place
--     (entity_id -> text, json/text -> jsonb, per-row, no data lost).
--   * roles.permissions saved as arrays by the old workspace modal are turned
--     into { key: true } objects; admin-tier roles get workspace.access.
--
-- Run it in one transaction: psql -1 -f workspace_migrations.sql

CREATE TABLE IF NOT EXISTS audited_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid,
  action      text NOT NULL,
  entity_type text,
  entity_id   text,
  old_values  jsonb,
  new_values  jsonb,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audited_events
  ADD COLUMN IF NOT EXISTS source      text NOT NULL DEFAULT 'api',
  ADD COLUMN IF NOT EXISTS summary     text,
  ADD COLUMN IF NOT EXISTS status_code integer;

CREATE OR REPLACE FUNCTION pg_temp.mod_try_jsonb(v text) RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE AS $f$
BEGIN
  RETURN v::jsonb;
EXCEPTION WHEN others THEN
  RETURN to_jsonb(v);
END
$f$;

DO $$
BEGIN
  IF (SELECT data_type FROM information_schema.columns
       WHERE table_name = 'audited_events' AND column_name = 'entity_id') <> 'text' THEN
    ALTER TABLE audited_events ALTER COLUMN entity_id TYPE text USING entity_id::text;
  END IF;
  IF (SELECT data_type FROM information_schema.columns
       WHERE table_name = 'audited_events' AND column_name = 'old_values') <> 'jsonb' THEN
    ALTER TABLE audited_events ALTER COLUMN old_values TYPE jsonb USING pg_temp.mod_try_jsonb(old_values::text);
  END IF;
  IF (SELECT data_type FROM information_schema.columns
       WHERE table_name = 'audited_events' AND column_name = 'new_values') <> 'jsonb' THEN
    ALTER TABLE audited_events ALTER COLUMN new_values TYPE jsonb USING pg_temp.mod_try_jsonb(new_values::text);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS audited_events_created_idx ON audited_events (created_at DESC);

CREATE INDEX IF NOT EXISTS audited_events_actor_idx ON audited_events (actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audited_events_entity_idx ON audited_events (entity_type, entity_id);

UPDATE roles
   SET permissions = (
     SELECT COALESCE(jsonb_object_agg(k, true), '{}'::jsonb)
       FROM jsonb_array_elements_text(permissions::jsonb) AS k
   )
 WHERE jsonb_typeof(permissions::jsonb) = 'array';

UPDATE roles
   SET permissions = COALESCE(permissions::jsonb, '{}'::jsonb) || '{"workspace.access": true}'::jsonb
 WHERE upper(name) IN ('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'DEVELOPER');

-- fix_order_items_columns.sql
--
-- Fixes: error: column oi.quantity does not exist
--        (GET /api/marketplace-admin/products, and every order / payout /
--        seller screen that totals sales).
--
-- Your order_items table predates the migrations in this repo (none of them
-- creates it), so it's missing columns the code reads. This adds them,
-- backfilling from older column names where they exist. Safe to re-run.
--
--   psql -1 -v ON_ERROR_STOP=1 -f fix_order_items_columns.sql
--
-- PART 2 at the bottom is a read-only check that lists any OTHER missing
-- columns across the marketplace tables. Send me its output if it returns rows.

-- ── PART 0: orders columns the code (and this script) reads ────────────
-- Your orders table may predate these. Nullable or defaulted, so safe on a
-- live table. subtotal_cents is backfilled from total_cents (no tax/fees
-- were recorded separately on those orders).

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_number       text,
  ADD COLUMN IF NOT EXISTS seller_id          uuid,
  ADD COLUMN IF NOT EXISTS currency           text NOT NULL DEFAULT 'usd',
  ADD COLUMN IF NOT EXISTS subtotal_cents     integer,
  ADD COLUMN IF NOT EXISTS platform_fee_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_cents          integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cart_id            uuid,
  ADD COLUMN IF NOT EXISTS shipping_address_id uuid;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema = current_schema() AND table_name = 'orders' AND column_name = 'total_cents') THEN
    EXECUTE 'UPDATE orders SET subtotal_cents = total_cents WHERE subtotal_cents IS NULL';
  END IF;
END $$;

-- ── PART 1: order_items ────────────────────────────────────────────────

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS quantity         integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit_price_cents integer,
  ADD COLUMN IF NOT EXISTS description      text,
  ADD COLUMN IF NOT EXISTS metadata         jsonb,
  ADD COLUMN IF NOT EXISTS artwork_id       uuid,
  ADD COLUMN IF NOT EXISTS license_type     text,
  ADD COLUMN IF NOT EXISTS item_type        text NOT NULL DEFAULT 'license',
  ADD COLUMN IF NOT EXISTS merch_variant_id uuid,
  ADD COLUMN IF NOT EXISTS seller_id        uuid;

-- Backfill from older column names, if your table has any of them.
DO $$
DECLARE src text;
BEGIN
  -- quantity <- qty
  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema = current_schema() AND table_name = 'order_items' AND column_name = 'qty') THEN
    EXECUTE 'UPDATE order_items SET quantity = COALESCE(qty, 1) WHERE qty IS NOT NULL';
  END IF;

  -- unit_price_cents <- first legacy price column found
  SELECT column_name INTO src
    FROM information_schema.columns
   WHERE table_schema = current_schema() AND table_name = 'order_items'
     AND column_name IN ('price_cents', 'amount_cents', 'unit_amount_cents', 'unit_price')
   ORDER BY array_position(ARRAY['price_cents', 'amount_cents', 'unit_amount_cents', 'unit_price'], column_name)
   LIMIT 1;

  IF src = 'unit_price' THEN
    -- a decimal currency amount, not cents
    EXECUTE 'UPDATE order_items SET unit_price_cents = round(unit_price * 100)::int WHERE unit_price_cents IS NULL AND unit_price IS NOT NULL';
  ELSIF src IS NOT NULL THEN
    EXECUTE format('UPDATE order_items SET unit_price_cents = %I::int WHERE unit_price_cents IS NULL', src);
  END IF;
END $$;

-- Lines still without a price: take the order's subtotal when it has one line.
UPDATE order_items oi
   SET unit_price_cents = o.subtotal_cents
  FROM orders o
 WHERE oi.order_id = o.id
   AND oi.unit_price_cents IS NULL
   AND o.subtotal_cents IS NOT NULL
   AND (SELECT count(*) FROM order_items x WHERE x.order_id = o.id) = 1;

UPDATE order_items SET unit_price_cents = 0 WHERE unit_price_cents IS NULL;
ALTER TABLE order_items ALTER COLUMN unit_price_cents SET DEFAULT 0;
ALTER TABLE order_items ALTER COLUMN unit_price_cents SET NOT NULL;

-- Licence lines: the seller is the order's seller (used for payouts).
UPDATE order_items oi
   SET seller_id = o.seller_id
  FROM orders o
 WHERE oi.order_id = o.id
   AND oi.seller_id IS NULL
   AND oi.item_type = 'license'
   AND o.seller_id IS NOT NULL;

-- Merch lines are the ones pointing at a variant.
UPDATE order_items SET item_type = 'merch_variant'
 WHERE merch_variant_id IS NOT NULL AND item_type <> 'merch_variant';

-- Foreign keys + type check, only if not already there.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'order_items'::regclass AND conname = 'order_items_item_type_check') THEN
    ALTER TABLE order_items ADD CONSTRAINT order_items_item_type_check
      CHECK (item_type IN ('license', 'merch_variant')) NOT VALID;
  END IF;
  IF to_regclass('merch_variants') IS NOT NULL AND NOT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conrelid = 'order_items'::regclass AND contype = 'f'
          AND pg_get_constraintdef(oid) LIKE '%(merch_variant_id)%') THEN
    ALTER TABLE order_items ADD CONSTRAINT order_items_merch_variant_id_fkey
      FOREIGN KEY (merch_variant_id) REFERENCES merch_variants(id) NOT VALID;
  END IF;
  IF NOT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conrelid = 'order_items'::regclass AND contype = 'f'
          AND pg_get_constraintdef(oid) LIKE '%(seller_id)%') THEN
    ALTER TABLE order_items ADD CONSTRAINT order_items_seller_id_fkey
      FOREIGN KEY (seller_id) REFERENCES users(id) NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS order_items_order_idx   ON order_items (order_id);
CREATE INDEX IF NOT EXISTS order_items_seller_idx  ON order_items (seller_id);
CREATE INDEX IF NOT EXISTS order_items_variant_idx ON order_items (merch_variant_id);


-- ── PART 2: check (read-only) ──────────────────────────────────────────
-- Lists every column the marketplace / orders / payouts code uses that your
-- database doesn't have. No rows = nothing else missing.

SELECT e.table_name, e.column_name AS missing_column
  FROM (VALUES
    ('order_items','id'),('order_items','order_id'),('order_items','artwork_id'),('order_items','license_type'),
    ('order_items','unit_price_cents'),('order_items','quantity'),('order_items','description'),('order_items','metadata'),
    ('order_items','item_type'),('order_items','merch_variant_id'),('order_items','seller_id'),
    ('orders','order_number'),('orders','buyer_id'),('orders','seller_id'),('orders','status'),('orders','currency'),
    ('orders','subtotal_cents'),('orders','platform_fee_cents'),('orders','tax_cents'),('orders','total_cents'),
    ('orders','stripe_payment_intent_id'),('orders','stripe_charge_id'),('orders','invoice_pdf_url'),('orders','invoice_number'),
    ('orders','paid_at'),('orders','fulfilled_at'),('orders','created_at'),('orders','updated_at'),('orders','cart_id'),
    ('orders','shipping_address_id'),
    ('merch_products','seller_id'),('merch_products','brand_id'),('merch_products','artwork_id'),('merch_products','license_id'),
    ('merch_products','title'),('merch_products','base_product_type'),('merch_products','fulfillment_type'),
    ('merch_products','print_provider_id'),('merch_products','status'),('merch_products','created_at'),
    ('merch_products','updated_at'),('merch_products','deleted_at'),
    ('merch_variants','merch_product_id'),('merch_variants','sku'),('merch_variants','size'),('merch_variants','color'),
    ('merch_variants','material'),('merch_variants','price_usd_cents'),('merch_variants','stock_qty'),
    ('merch_variants','print_file_url'),('merch_variants','is_active'),
    ('seller_profiles','user_id'),('seller_profiles','display_name'),('seller_profiles','status'),('seller_profiles','payout_ready'),
    ('seller_profiles','reviewed_by'),('seller_profiles','reviewed_at'),('seller_profiles','notes'),('seller_profiles','created_at'),
    ('product_reviews','reviewer_id'),('product_reviews','target_type'),('product_reviews','target_id'),
    ('product_reviews','order_item_id'),('product_reviews','rating'),('product_reviews','body'),('product_reviews','deleted_at'),
    ('fulfillments','order_id'),('fulfillments','seller_id'),('fulfillments','status'),('fulfillments','carrier'),
    ('fulfillments','tracking_number'),('fulfillments','tracking_url'),('fulfillment_items','fulfillment_id'),
    ('fulfillment_items','order_item_id'),
    ('payouts','seller_id'),('payouts','order_item_id'),('payouts','gross_cents'),('payouts','platform_fee_cents'),
    ('payouts','net_cents'),('payouts','status'),('payouts','stripe_transfer_id'),('payouts','created_at'),
    ('platform_fee_rules','fulfillment_type'),('platform_fee_rules','base_product_type'),('platform_fee_rules','fee_bps'),
    ('platform_fee_rules','is_active'),
    ('print_providers','name'),('print_providers','integration_type'),('print_providers','api_config'),
    ('users','stripe_connect_id'),('users','last_login_at'),('artworks','thumbnail_url')
  ) AS e(table_name, column_name)
  LEFT JOIN information_schema.columns c
    ON c.table_schema = current_schema() AND c.table_name = e.table_name AND c.column_name = e.column_name
 WHERE c.column_name IS NULL
 ORDER BY 1, 2;

 -- fix_brands_and_check_schema.sql
--
-- Fixes: getAllBrands error: column "views_count" does not exist
--        (GET /api/brands - the workspace brand list, contest form brand
--        picker, brand pages).
--
-- PART 1 adds the brands columns the code reads, if missing. Safe to re-run.
-- PART 2 is READ-ONLY: it lists every table/column the backend code uses
-- that your database doesn't have, across all 54 tables, so we can fix
-- the rest in one go instead of one error at a time. Paste its output to me.
--
--   psql -1 -v ON_ERROR_STOP=1 -f fix_brands_and_check_schema.sql

-- ── PART 1: brands ─────────────────────────────────────────────────────

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS description             text,
  ADD COLUMN IF NOT EXISTS logo_url                text,
  ADD COLUMN IF NOT EXISTS banner_url              text,
  ADD COLUMN IF NOT EXISTS website                 text,
  ADD COLUMN IF NOT EXISTS social_links            jsonb,
  ADD COLUMN IF NOT EXISTS status                  text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS followers_count         integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_count             integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verification_request_id uuid,
  ADD COLUMN IF NOT EXISTS created_at              timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at              timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at              timestamptz;

-- followers_count was never maintained on databases without it: backfill
-- from brand_followers when that table exists.
DO $$
BEGIN
  IF to_regclass('brand_followers') IS NOT NULL THEN
    UPDATE brands b
       SET followers_count = f.n
      FROM (SELECT brand_id, count(*)::int AS n FROM brand_followers GROUP BY brand_id) f
     WHERE f.brand_id = b.id AND b.followers_count = 0;
  END IF;
END $$;

-- ── PART 2: whole-database check (read-only) ───────────────────────────
-- missing_table = true means the whole table doesn't exist.

SELECT e.table_name,
       e.column_name AS missing_column,
       (to_regclass(e.table_name) IS NULL) AS missing_table
  FROM (VALUES
    ('addresses','city'), ('addresses','country'), ('addresses','created_at'), ('addresses','deleted_at'), ('addresses','full_name'), ('addresses','id'),
    ('addresses','is_default'), ('addresses','line1'), ('addresses','line2'), ('addresses','phone'), ('addresses','postal_code'), ('addresses','state'),
    ('addresses','user_id'), ('artwork_categories','artwork_id'), ('artwork_categories','category_id'), ('artwork_pricing_tiers','artwork_id'), ('artwork_pricing_tiers','created_at'), ('artwork_pricing_tiers','id'),
    ('artwork_pricing_tiers','is_active'), ('artwork_pricing_tiers','license_type'), ('artwork_pricing_tiers','price_usd_cents'), ('artworks','created_at'), ('artworks','creator_id'), ('artworks','deleted_at'),
    ('artworks','description'), ('artworks','favorites_count'), ('artworks','file_url'), ('artworks','id'), ('artworks','moderated_at'), ('artworks','moderated_by'),
    ('artworks','moderation_notes'), ('artworks','moderation_status'), ('artworks','preview_url'), ('artworks','slug'), ('artworks','source_file_url'), ('artworks','status'),
    ('artworks','thumbnail_url'), ('artworks','title'), ('artworks','updated_at'), ('artworks','views_count'), ('audited_events','action'), ('audited_events','actor_id'),
    ('audited_events','created_at'), ('audited_events','entity_id'), ('audited_events','entity_type'), ('audited_events','id'), ('audited_events','ip_address'), ('audited_events','new_values'),
    ('audited_events','old_values'), ('audited_events','source'), ('audited_events','status_code'), ('audited_events','summary'), ('audited_events','user_agent'), ('auth_tokens','created_at'),
    ('auth_tokens','expires_at'), ('auth_tokens','id'), ('auth_tokens','token_hash'), ('auth_tokens','type'), ('auth_tokens','used_at'), ('auth_tokens','user_id'),
    ('brand_artworks','added_at'), ('brand_artworks','artwork_id'), ('brand_artworks','brand_id'), ('brand_artworks','is_featured'), ('brand_artworks','sort_order'), ('brand_followers','brand_id'),
    ('brand_followers','followed_at'), ('brand_followers','user_id'), ('brand_managers','brand_id'), ('brand_managers','created_at'), ('brand_managers','id'), ('brand_managers','user_id'),
    ('brand_post_comments','content'), ('brand_post_comments','created_at'), ('brand_post_comments','deleted_at'), ('brand_post_comments','id'), ('brand_post_comments','likes_count'), ('brand_post_comments','parent_id'),
    ('brand_post_comments','post_id'), ('brand_post_comments','updated_at'), ('brand_post_comments','user_id'), ('brand_posts','brand_id'), ('brand_posts','comments_count'), ('brand_posts','content'),
    ('brand_posts','created_at'), ('brand_posts','deleted_at'), ('brand_posts','id'), ('brand_posts','is_pinned'), ('brand_posts','likes_count'), ('brand_posts','media_urls'),
    ('brand_posts','status'), ('brand_posts','title'), ('brand_posts','updated_at'), ('brand_posts','upvotes_count'), ('brand_verification_requests','brand_id'), ('brand_verification_requests','company_name'),
    ('brand_verification_requests','contact_email'), ('brand_verification_requests','contact_phone'), ('brand_verification_requests','created_at'), ('brand_verification_requests','description'), ('brand_verification_requests','documents'), ('brand_verification_requests','how_heard'),
    ('brand_verification_requests','id'), ('brand_verification_requests','notes'), ('brand_verification_requests','reviewed_at'), ('brand_verification_requests','reviewed_by'), ('brand_verification_requests','status'), ('brand_verification_requests','team_size'),
    ('brand_verification_requests','updated_at'), ('brand_verification_requests','user_id'), ('brand_verification_requests','website'), ('brands','banner_url'), ('brands','created_at'), ('brands','deleted_at'),
    ('brands','description'), ('brands','followers_count'), ('brands','id'), ('brands','logo_url'), ('brands','name'), ('brands','slug'),
    ('brands','social_links'), ('brands','status'), ('brands','updated_at'), ('brands','user_id'), ('brands','verification_request_id'), ('brands','views_count'),
    ('brands','website'), ('cart_items','artwork_id'), ('cart_items','cart_id'), ('cart_items','created_at'), ('cart_items','id'), ('cart_items','item_type'),
    ('cart_items','license_type'), ('cart_items','merch_variant_id'), ('cart_items','quantity'), ('carts','created_at'), ('carts','id'), ('carts','status'),
    ('carts','user_id'), ('categories','created_at'), ('categories','description'), ('categories','icon_url'), ('categories','id'), ('categories','is_active'),
    ('categories','name'), ('categories','parent_id'), ('categories','slug'), ('categories','sort_order'), ('categories','updated_at'), ('cdn_files','created_at'),
    ('cdn_files','id'), ('cdn_files','stored_name'), ('cdn_files','updated_at'), ('cdn_files','uploaded_by'), ('collections','cover_image_url'), ('collections','created_at'),
    ('collections','deleted_at'), ('collections','description'), ('collections','id'), ('collections','is_public'), ('collections','name'), ('collections','owner_id'),
    ('collections','owner_type'), ('collections','slug'), ('collections','sort_order'), ('collections','updated_at'), ('contest_categories','category_id'), ('contest_categories','contest_id'),
    ('contest_entries','artwork_id'), ('contest_entries','contest_id'), ('contest_entries','created_at'), ('contest_entries','creator_id'), ('contest_entries','id'), ('contest_entries','licensing_status'),
    ('contest_entries','moderated_at'), ('contest_entries','moderated_by'), ('contest_entries','moderation_status'), ('contest_entries','rank'), ('contest_entries','score_judge'), ('contest_entries','score_public'),
    ('contest_entries','status'), ('contest_entries','submission_notes'), ('contest_entries','updated_at'), ('contest_judge_scores','comments'), ('contest_judge_scores','created_at'), ('contest_judge_scores','entry_id'),
    ('contest_judge_scores','judge_id'), ('contest_judge_scores','score'), ('contest_judges','accepted'), ('contest_judges','contest_id'), ('contest_judges','created_at'), ('contest_judges','id'),
    ('contest_judges','invited_by'), ('contest_judges','judge_id'), ('contest_judges','updated_at'), ('contest_prizes','amount_cents'), ('contest_prizes','brand_id'), ('contest_prizes','contest_id'),
    ('contest_prizes','created_at'), ('contest_prizes','currency'), ('contest_prizes','description'), ('contest_prizes','entry_id'), ('contest_prizes','funded_at'), ('contest_prizes','id'),
    ('contest_prizes','paid_at'), ('contest_prizes','payment_reference'), ('contest_prizes','prize_type'), ('contest_prizes','rank'), ('contest_prizes','status'), ('contest_prizes','winner_id'),
    ('contest_votes','created_at'), ('contest_votes','entry_id'), ('contest_votes','user_id'), ('contest_votes','vote_weight'), ('contests','brand_id'), ('contests','created_at'),
    ('contests','deleted_at'), ('contests','description'), ('contests','entry_requirements'), ('contests','gallery'), ('contests','hero_image'), ('contests','id'),
    ('contests','judging_criteria'), ('contests','judging_end_date'), ('contests','max_entries_per_user'), ('contests','prizes'), ('contests','results_share_token'), ('contests','rules'),
    ('contests','slug'), ('contests','start_date'), ('contests','status'), ('contests','submission_end_date'), ('contests','title'), ('contests','updated_at'),
    ('contests','visibility'), ('contests','voting_end_date'), ('contests','winner_announced'), ('favorites','created_at'), ('favorites','favoritable_id'), ('favorites','favoritable_type'),
    ('favorites','user_id'), ('fulfillment_items','fulfillment_id'), ('fulfillment_items','order_item_id'), ('fulfillments','address_id'), ('fulfillments','carrier'), ('fulfillments','created_at'),
    ('fulfillments','delivered_at'), ('fulfillments','id'), ('fulfillments','order_id'), ('fulfillments','print_provider_id'), ('fulfillments','seller_id'), ('fulfillments','shipped_at'),
    ('fulfillments','status'), ('fulfillments','tracking_number'), ('fulfillments','tracking_url'), ('judge_invite_tokens','contest_id'), ('judge_invite_tokens','created_at'), ('judge_invite_tokens','expires_at'),
    ('judge_invite_tokens','invited_by'), ('judge_invite_tokens','judge_id'), ('judge_invite_tokens','token'), ('judge_invite_tokens','type'), ('judge_invite_tokens','used_at'), ('licenses','artwork_id'),
    ('licenses','buyer_id'), ('licenses','contract_pdf_url'), ('licenses','created_at'), ('licenses','expires_at'), ('licenses','id'), ('licenses','is_active'),
    ('licenses','license_type'), ('licenses','order_item_id'), ('licenses','revoked_at'), ('licenses','seller_id'), ('licenses','updated_at'), ('merch_products','artwork_id'),
    ('merch_products','base_product_type'), ('merch_products','brand_id'), ('merch_products','created_at'), ('merch_products','deleted_at'), ('merch_products','description'), ('merch_products','fulfillment_type'),
    ('merch_products','id'), ('merch_products','license_id'), ('merch_products','print_provider_id'), ('merch_products','seller_id'), ('merch_products','slug'), ('merch_products','status'),
    ('merch_products','title'), ('merch_products','updated_at'), ('merch_variants','color'), ('merch_variants','id'), ('merch_variants','is_active'), ('merch_variants','material'),
    ('merch_variants','merch_product_id'), ('merch_variants','price_usd_cents'), ('merch_variants','print_file_url'), ('merch_variants','size'), ('merch_variants','sku'), ('merch_variants','stock_qty'),
    ('merch_variants','weight_grams'), ('moderation_queue','assigned_to'), ('moderation_queue','created_at'), ('moderation_queue','entity_id'), ('moderation_queue','entity_type'), ('moderation_queue','id'),
    ('moderation_queue','priority'), ('moderation_queue','reviewed_at'), ('moderation_queue','reviewed_by'), ('moderation_queue','status'), ('moderation_queue','updated_at'), ('notifications','body'),
    ('notifications','created_at'), ('notifications','data'), ('notifications','deleted_at'), ('notifications','id'), ('notifications','read_at'), ('notifications','title'),
    ('notifications','type'), ('notifications','user_id'), ('order_items','artwork_id'), ('order_items','description'), ('order_items','id'), ('order_items','item_type'),
    ('order_items','license_type'), ('order_items','merch_variant_id'), ('order_items','metadata'), ('order_items','order_id'), ('order_items','quantity'), ('order_items','seller_id'),
    ('order_items','unit_price_cents'), ('orders','buyer_id'), ('orders','cart_id'), ('orders','created_at'), ('orders','currency'), ('orders','fulfilled_at'),
    ('orders','id'), ('orders','invoice_number'), ('orders','invoice_pdf_url'), ('orders','order_number'), ('orders','paid_at'), ('orders','platform_fee_cents'),
    ('orders','seller_id'), ('orders','shipping_address_id'), ('orders','source_id'), ('orders','source_type'), ('orders','status'), ('orders','stripe_charge_id'),
    ('orders','stripe_payment_intent_id'), ('orders','subtotal_cents'), ('orders','tax_cents'), ('orders','total_cents'), ('orders','updated_at'), ('payment_disputes','amount_cents'),
    ('payment_disputes','created_at'), ('payment_disputes','id'), ('payment_disputes','outcome'), ('payment_disputes','reason'), ('payment_disputes','status'), ('payment_disputes','stripe_charge_id'),
    ('payment_disputes','stripe_dispute_id'), ('payment_disputes','updated_at'), ('payouts','created_at'), ('payouts','gross_cents'), ('payouts','id'), ('payouts','net_cents'),
    ('payouts','order_item_id'), ('payouts','platform_fee_cents'), ('payouts','seller_id'), ('payouts','status'), ('payouts','stripe_transfer_id'), ('platform_fee_rules','base_product_type'),
    ('platform_fee_rules','created_at'), ('platform_fee_rules','fee_bps'), ('platform_fee_rules','fulfillment_type'), ('platform_fee_rules','id'), ('platform_fee_rules','is_active'), ('print_providers','api_config'),
    ('print_providers','id'), ('print_providers','integration_type'), ('print_providers','is_active'), ('print_providers','name'), ('product_reviews','body'), ('product_reviews','created_at'),
    ('product_reviews','deleted_at'), ('product_reviews','id'), ('product_reviews','order_item_id'), ('product_reviews','rating'), ('product_reviews','reviewer_id'), ('product_reviews','target_id'),
    ('product_reviews','target_type'), ('project_members','joined_at'), ('project_members','project_id'), ('project_members','user_id'), ('projects','created_at'), ('projects','created_by'),
    ('projects','description'), ('projects','id'), ('projects','is_active'), ('projects','name'), ('projects','slug'), ('refresh_tokens','created_at'),
    ('refresh_tokens','expires_at'), ('refresh_tokens','id'), ('refresh_tokens','revoked_at'), ('refresh_tokens','token_hash'), ('refresh_tokens','user_id'), ('refunds','amount_cents'),
    ('refunds','approved_by'), ('refunds','created_at'), ('refunds','id'), ('refunds','order_id'), ('refunds','processed_at'), ('refunds','status'),
    ('refunds','stripe_refund_id'), ('roles','created_at'), ('roles','hierarchy_level'), ('roles','id'), ('roles','is_system'), ('roles','name'),
    ('roles','permissions'), ('seller_profiles','created_at'), ('seller_profiles','display_name'), ('seller_profiles','id'), ('seller_profiles','notes'), ('seller_profiles','payout_ready'),
    ('seller_profiles','reviewed_at'), ('seller_profiles','reviewed_by'), ('seller_profiles','status'), ('seller_profiles','updated_at'), ('seller_profiles','user_id'), ('taggings','created_at'),
    ('taggings','created_by'), ('taggings','tag_id'), ('taggings','taggable_id'), ('taggings','taggable_type'), ('tags','approved'), ('tags','approved_by'),
    ('tags','created_at'), ('tags','created_by'), ('tags','id'), ('tags','name'), ('tags','slug'), ('tags','usage_count'),
    ('task_activity_logs','actor_id'), ('task_activity_logs','created_at'), ('task_activity_logs','new_value'), ('task_activity_logs','old_value'), ('task_activity_logs','task_id'), ('task_comments','created_at'),
    ('task_comments','task_id'), ('task_comments','user_id'), ('tasks','assigned_to'), ('tasks','completed_at'), ('tasks','created_at'), ('tasks','created_by'),
    ('tasks','description'), ('tasks','due_date'), ('tasks','id'), ('tasks','labels'), ('tasks','priority'), ('tasks','project_id'),
    ('tasks','status'), ('tasks','story_points'), ('tasks','title'), ('tasks','updated_at'), ('user_violations','created_at'), ('user_violations','entity_id'),
    ('user_violations','entity_type'), ('user_violations','id'), ('user_violations','reported_by'), ('user_violations','resolved_at'), ('user_violations','resolved_by'), ('user_violations','status'),
    ('user_violations','strike_issued'), ('user_violations','user_id'), ('user_violations','violation_type'), ('users','accepted_terms_at'), ('users','accepted_terms_version'), ('users','age_confirmed_at'),
    ('users','avatar_url'), ('users','banner_url'), ('users','bio'), ('users','created_at'), ('users','deleted_at'), ('users','display_name'),
    ('users','email'), ('users','email_verified'), ('users','firebase_uid'), ('users','id'), ('users','last_login_at'), ('users','location'),
    ('users','name'), ('users','password_hash'), ('users','payout_method'), ('users','profile'), ('users','profile_image_url'), ('users','role_id'),
    ('users','signup_key_used'), ('users','status'), ('users','stripe_connect_id'), ('users','updated_at'), ('users','username'), ('users','website')
  ) AS e(table_name, column_name)
  LEFT JOIN information_schema.columns c
    ON c.table_schema = current_schema()
   AND c.table_name = e.table_name
   AND c.column_name = e.column_name
 WHERE c.column_name IS NULL
 ORDER BY 3 DESC, 1, 2;

 ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS description             text,
  ADD COLUMN IF NOT EXISTS logo_url                text,
  ADD COLUMN IF NOT EXISTS banner_url              text,
  ADD COLUMN IF NOT EXISTS website                 text,
  ADD COLUMN IF NOT EXISTS social_links            jsonb,
  ADD COLUMN IF NOT EXISTS status                  text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS followers_count         integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_count             integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verification_request_id uuid,
  ADD COLUMN IF NOT EXISTS created_at              timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at              timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at              timestamptz;