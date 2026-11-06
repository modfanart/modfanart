// src/migrations/20261106000000_add_order_license_columns_written_by_code.js
//
// orders / order_items / licenses in production still have the columns from
// the original schema dump, but the licensing checkout, cart checkout, order
// fulfillment and payout code (and OrderRow / OrderItemRow / LicenseRow in
// db/types.js) read and write a much wider set. Every insert on these paths
// fails on that schema. No migration ever added the columns; the hand-run
// migrations/marketplace.sql covers only part of them.
//
// Additive and idempotent (IF NOT EXISTS) so it is a no-op on a database
// where the columns were added by hand.

const { sql } = require('kysely');

async function up(db) {
  await sql`
    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS source_type text,
      ADD COLUMN IF NOT EXISTS source_id text,
      ADD COLUMN IF NOT EXISTS currency varchar(3) NOT NULL DEFAULT 'USD',
      ADD COLUMN IF NOT EXISTS subtotal_cents integer,
      ADD COLUMN IF NOT EXISTS platform_fee_cents integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS tax_cents integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
      ADD COLUMN IF NOT EXISTS stripe_charge_id text,
      ADD COLUMN IF NOT EXISTS invoice_pdf_url text,
      ADD COLUMN IF NOT EXISTS invoice_number text,
      ADD COLUMN IF NOT EXISTS paid_at timestamptz,
      ADD COLUMN IF NOT EXISTS fulfilled_at timestamptz,
      ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()
  `.execute(db);

  await sql`
    ALTER TABLE order_items
      ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS description text,
      ADD COLUMN IF NOT EXISTS metadata jsonb
  `.execute(db);

  await sql`
    ALTER TABLE licenses
      ADD COLUMN IF NOT EXISTS contract_pdf_url text,
      ADD COLUMN IF NOT EXISTS expires_at timestamptz,
      ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS revoked_at timestamptz,
      ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()
  `.execute(db);

  // Payment lookups by intent id (createPayment reuses an in-flight intent).
  await sql`
    CREATE INDEX IF NOT EXISTS orders_stripe_payment_intent_idx
      ON orders (stripe_payment_intent_id)
  `.execute(db);
}

// Not reversed, matching this repo's convention for ADD COLUMN IF NOT EXISTS
// migrations: on a database where the columns predated this migration, up()
// did nothing, and an unconditional drop would destroy order history.
async function down() {}

module.exports = { up, down };
