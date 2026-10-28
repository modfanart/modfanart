// src/migrations/20261027000000_usd_only_currency.js
//
// The platform now prices and charges in USD only.
//  - merch_variants / artwork_pricing_tiers lose their INR price column.
//  - orders.currency defaults to 'USD'.
//  - Contest prizes stored as { amount_inr } are re-keyed to { amount_usd }.
//
// NOTE: this is a re-label, not a currency conversion. Existing prize
// amounts keep their numeric value; review them in the admin UI if any
// contests were created with rupee amounts. Historical orders keep the
// currency they were actually charged in (rewriting it would corrupt the
// financial record), but no new non-USD order can be created.

const { sql } = require('kysely');

async function up(db) {
  await sql`ALTER TABLE merch_variants DROP CONSTRAINT IF EXISTS merch_variants_price_inr_check`.execute(
    db
  );
  await sql`ALTER TABLE merch_variants DROP COLUMN IF EXISTS price_inr_cents`.execute(
    db
  );
  await sql`ALTER TABLE artwork_pricing_tiers DROP COLUMN IF EXISTS price_inr_cents`.execute(
    db
  );

  await sql`ALTER TABLE orders ALTER COLUMN currency SET DEFAULT 'USD'`.execute(
    db
  );

  // contests.prizes is jsonb in the live schema; guard so a text column
  // (or a missing table) doesn't abort the migration.
  await sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'contests' AND column_name = 'prizes'
          AND data_type = 'jsonb'
      ) THEN
        UPDATE contests c
        SET prizes = (
          SELECT jsonb_agg(
            CASE WHEN p ? 'amount_inr'
              THEN (p - 'amount_inr') || jsonb_build_object('amount_usd', p->'amount_inr')
              ELSE p END
          )
          FROM jsonb_array_elements(c.prizes) p
        )
        WHERE jsonb_typeof(c.prizes) = 'array'
          AND c.prizes::text LIKE '%amount_inr%';
      END IF;
    END $$
  `.execute(db);
}

// Not reversed: dropping a price column is destructive by nature.
async function down() {}

module.exports = { up, down };
