-- =============================================================================
-- MOD Platform — combined migration (2026-11-14)
--
-- Equivalent to these four Kysely migrations, in order:
--   20261114000000_add_slugs_and_skus
--   20261114010000_add_terms_consent_and_invoice_sequence
--   20261114020000_add_disputes_holds_and_contest_prizes
--   20261114030000_normalise_admin_role_names
--
-- Use EITHER this file OR `npm run migrate`, not both. If you run this file by
-- hand, the Kysely migrator won't know it ran; see the optional block at the end.
--
-- Safe to re-run (IF NOT EXISTS / guarded blocks everywhere). Runs in a single
-- transaction: if anything fails, nothing is applied.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f mod_migrations_2026-11-14.sql
--
-- Take a database backup first.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. SLUGS & SKUs  (20261114000000)
--    contests.slug         backfill blanks, canonicalise, de-duplicate, unique
--    merch_products.slug   NEW column, backfilled from title, unique
--    merch_variants.sku    upper-case + case-insensitive unique
--    Uniqueness ignores soft-deleted rows.
-- -----------------------------------------------------------------------------

-- Same rules as backend/src/common/utils/slug.util.js
CREATE OR REPLACE FUNCTION pg_temp.mod_slugify(src text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' from regexp_replace(
           regexp_replace(lower(coalesce(src, '')), '[^a-z0-9]+', '-', 'g'),
           '-+', '-', 'g'))
$$;

-- contests ---------------------------------------------------------------------
ALTER TABLE contests ADD COLUMN IF NOT EXISTS slug text;

UPDATE contests
   SET slug = CASE
       WHEN pg_temp.mod_slugify(title) <> '' THEN left(pg_temp.mod_slugify(title), 80)
       ELSE 'contest-' || left(id::text, 8)
     END
 WHERE slug IS NULL OR btrim(slug) = '';

UPDATE contests
   SET slug = left(pg_temp.mod_slugify(slug), 80)
 WHERE slug <> left(pg_temp.mod_slugify(slug), 80)
   AND pg_temp.mod_slugify(slug) <> '';

WITH ranked AS (
  SELECT id, slug,
         row_number() OVER (PARTITION BY slug ORDER BY created_at, id) AS rn
    FROM contests
   WHERE deleted_at IS NULL
)
UPDATE contests t
   SET slug = r.slug || '-' || left(t.id::text, 6)
  FROM ranked r
 WHERE t.id = r.id AND r.rn > 1;

ALTER TABLE contests ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS contests_slug_live_key
  ON contests (slug) WHERE deleted_at IS NULL;

-- merch_products ---------------------------------------------------------------
ALTER TABLE merch_products ADD COLUMN IF NOT EXISTS slug text;

UPDATE merch_products
   SET slug = CASE
       WHEN pg_temp.mod_slugify(title) <> '' THEN left(pg_temp.mod_slugify(title), 80)
       ELSE 'product-' || left(id::text, 8)
     END
 WHERE slug IS NULL OR btrim(slug) = '';

UPDATE merch_products
   SET slug = left(pg_temp.mod_slugify(slug), 80)
 WHERE slug <> left(pg_temp.mod_slugify(slug), 80)
   AND pg_temp.mod_slugify(slug) <> '';

WITH ranked AS (
  SELECT id, slug,
         row_number() OVER (PARTITION BY slug ORDER BY created_at, id) AS rn
    FROM merch_products
   WHERE deleted_at IS NULL
)
UPDATE merch_products t
   SET slug = r.slug || '-' || left(t.id::text, 6)
  FROM ranked r
 WHERE t.id = r.id AND r.rn > 1;

ALTER TABLE merch_products ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS merch_products_slug_live_key
  ON merch_products (slug) WHERE deleted_at IS NULL;

-- merch_variants ---------------------------------------------------------------
UPDATE merch_variants
   SET sku = upper(btrim(sku))
 WHERE sku <> upper(btrim(sku));

CREATE UNIQUE INDEX IF NOT EXISTS merch_variants_sku_upper_key
  ON merch_variants (upper(sku));


-- -----------------------------------------------------------------------------
-- 2. TERMS CONSENT & INVOICE NUMBERS  (20261114010000)
--    GA-22: record accepted terms version/time and 18+ confirmation
--    GA-19: sequential, unique invoice numbers
-- -----------------------------------------------------------------------------

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS accepted_terms_version text,
  ADD COLUMN IF NOT EXISTS accepted_terms_at      timestamptz,
  ADD COLUMN IF NOT EXISTS age_confirmed_at       timestamptz;

-- Columns the payment / fulfilment / refund / dispute code writes to on
-- `orders`. Some environments were created without them (e.g. no
-- invoice_number), which made fulfilment of a paid order fail. All nullable or
-- defaulted, so adding them is safe on a live table.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS invoice_number           text,
  ADD COLUMN IF NOT EXISTS invoice_pdf_url          text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_charge_id         text,
  ADD COLUMN IF NOT EXISTS paid_at                  timestamptz,
  ADD COLUMN IF NOT EXISTS fulfilled_at             timestamptz,
  ADD COLUMN IF NOT EXISTS created_at               timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at               timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS orders_stripe_charge_idx ON orders (stripe_charge_id);

-- Refunds and chargebacks set status to 'refunded' / 'disputed'. If an
-- existing CHECK on orders.status doesn't allow them, replace it. NOT VALID
-- so historical rows with other values don't block the migration.
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname, pg_get_constraintdef(oid) AS def
      FROM pg_constraint
     WHERE conrelid = 'orders'::regclass AND contype = 'c'
       AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    IF c.def NOT ILIKE '%disputed%' OR c.def NOT ILIKE '%refunded%' THEN
      EXECUTE format('ALTER TABLE orders DROP CONSTRAINT %I', c.conname);
      ALTER TABLE orders ADD CONSTRAINT orders_status_check
        CHECK (status IN ('pending', 'paid', 'fulfilled', 'refunded', 'disputed', 'failed'))
        NOT VALID;
    END IF;
  END LOOP;
END $$;

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 100001;

-- Old timestamp-based numbers may collide: keep the first, renumber the rest.
WITH dups AS (
  SELECT id,
         row_number() OVER (PARTITION BY invoice_number ORDER BY created_at, id) AS rn
    FROM orders
   WHERE invoice_number IS NOT NULL
)
UPDATE orders o
   SET invoice_number = 'INV-' || nextval('invoice_number_seq')
  FROM dups d
 WHERE o.id = d.id AND d.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS orders_invoice_number_key
  ON orders (invoice_number) WHERE invoice_number IS NOT NULL;


-- -----------------------------------------------------------------------------
-- 3. DISPUTES, PAYOUT HOLDS, CONTEST PRIZES  (20261114020000)
--    GA-18: payouts can be 'on_hold' during a chargeback; disputes table
--    GA-21: payout records survive deleting a user (RESTRICT, not CASCADE)
--    GA-25: prizes get their own table with a funding lifecycle
-- -----------------------------------------------------------------------------

ALTER TABLE payouts DROP CONSTRAINT IF EXISTS payouts_status_check;
ALTER TABLE payouts ADD CONSTRAINT payouts_status_check
  CHECK (status IN ('pending', 'on_hold', 'paid', 'failed'));

DO $$
DECLARE fk text;
BEGIN
  SELECT conname INTO fk
    FROM pg_constraint
   WHERE conrelid = 'payouts'::regclass
     AND contype = 'f'
     AND pg_get_constraintdef(oid) LIKE '%(seller_id)%REFERENCES users%'
     AND pg_get_constraintdef(oid) NOT LIKE '%ON DELETE RESTRICT%';
  IF fk IS NOT NULL THEN
    EXECUTE format('ALTER TABLE payouts DROP CONSTRAINT %I', fk);
    ALTER TABLE payouts ADD CONSTRAINT payouts_seller_id_fkey
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS payment_disputes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_dispute_id  text NOT NULL UNIQUE,
  stripe_charge_id   text NOT NULL,
  amount_cents       integer NOT NULL,
  reason             text,
  status             text NOT NULL,          -- Stripe dispute status
  outcome            text,                   -- 'won' | 'lost' | NULL while open
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payment_disputes_charge_idx
  ON payment_disputes (stripe_charge_id);

CREATE TABLE IF NOT EXISTS contest_prizes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id         uuid NOT NULL REFERENCES contests(id)        ON DELETE RESTRICT,
  entry_id           uuid NOT NULL UNIQUE REFERENCES contest_entries(id) ON DELETE RESTRICT,
  winner_id          uuid NOT NULL REFERENCES users(id)           ON DELETE RESTRICT,
  brand_id           uuid NOT NULL REFERENCES brands(id)          ON DELETE RESTRICT,
  rank               integer NOT NULL,
  prize_type         text NOT NULL DEFAULT 'cash',
  description        text,
  amount_cents       integer NOT NULL DEFAULT 0 CHECK (amount_cents >= 0),
  currency           text NOT NULL DEFAULT 'USD',
  status             text NOT NULL DEFAULT 'awaiting_funding'
                       CHECK (status IN ('awaiting_funding', 'funded', 'paid', 'cancelled')),
  funded_at          timestamptz,
  paid_at            timestamptz,
  payment_reference  text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contest_prizes_contest_idx ON contest_prizes (contest_id);
CREATE INDEX IF NOT EXISTS contest_prizes_winner_idx  ON contest_prizes (winner_id);

-- Move prizes previously stored as fake 'fulfilled' orders (if those columns exist).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_name = 'orders' AND column_name = 'source_type')
     AND EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_name = 'orders' AND column_name = 'source_id') THEN
    INSERT INTO contest_prizes (contest_id, entry_id, winner_id, brand_id, rank,
                                amount_cents, currency, status, created_at)
    SELECT ce.contest_id, ce.id, ce.creator_id, c.brand_id, coalesce(ce.rank, 0),
           coalesce(o.total_cents, 0), coalesce(o.currency, 'USD'),
           'awaiting_funding', o.created_at
      FROM orders o
      JOIN contest_entries ce ON ce.id::text = o.source_id::text
      JOIN contests c         ON c.id = ce.contest_id
     WHERE o.source_type = 'contest_prize'
    ON CONFLICT (entry_id) DO NOTHING;
  END IF;
END $$;


-- -----------------------------------------------------------------------------
-- 4. ADMIN ROLE NAMES  (20261114030000)
--    GA-11: canonical name is SUPER_ADMIN.
--      only SUPERADMIN exists -> rename it
--      both exist             -> merge permissions into SUPER_ADMIN, move users
--                                (old row left in place, unused)
-- -----------------------------------------------------------------------------

DO $$
DECLARE old_id uuid; new_id uuid;
BEGIN
  SELECT id INTO old_id FROM roles WHERE upper(name) = 'SUPERADMIN'  LIMIT 1;
  SELECT id INTO new_id FROM roles WHERE upper(name) = 'SUPER_ADMIN' LIMIT 1;
  IF old_id IS NULL THEN
    RETURN;
  ELSIF new_id IS NULL THEN
    UPDATE roles SET name = 'SUPER_ADMIN' WHERE id = old_id;
  ELSE
    UPDATE roles
       SET permissions = COALESCE((SELECT permissions FROM roles WHERE id = old_id), '{}'::jsonb)
                         || COALESCE(permissions, '{}'::jsonb)
     WHERE id = new_id;
    UPDATE users SET role_id = new_id WHERE role_id = old_id;
  END IF;
END $$;


-- -----------------------------------------------------------------------------
-- OPTIONAL: tell the Kysely migrator these are applied, so `npm run migrate`
-- later doesn't try to run them again. Uncomment if you use the migrator.
-- (They're idempotent anyway, so re-running would also be harmless.)
-- -----------------------------------------------------------------------------
-- INSERT INTO kysely_migration (name, timestamp) VALUES
--   ('20261114000000_add_slugs_and_skus',                    now()::text),
--   ('20261114010000_add_terms_consent_and_invoice_sequence', now()::text),
--   ('20261114020000_add_disputes_holds_and_contest_prizes',  now()::text),
--   ('20261114030000_normalise_admin_role_names',            now()::text)
-- ON CONFLICT (name) DO NOTHING;

COMMIT;

-- -----------------------------------------------------------------------------
-- Quick checks after running
-- -----------------------------------------------------------------------------
-- SELECT count(*) FILTER (WHERE slug IS NULL) AS missing, count(*) FROM contests;
-- SELECT count(*) FILTER (WHERE slug IS NULL) AS missing, count(*) FROM merch_products;
-- SELECT slug, count(*) FROM contests WHERE deleted_at IS NULL GROUP BY 1 HAVING count(*) > 1;  -- expect 0 rows
-- SELECT last_value FROM invoice_number_seq;
-- SELECT name FROM roles WHERE upper(name) IN ('SUPERADMIN','SUPER_ADMIN');