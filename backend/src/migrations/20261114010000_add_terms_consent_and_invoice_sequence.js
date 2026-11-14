// src/migrations/20261114010000_add_terms_consent_and_invoice_sequence.js
//
// GA-22: record which terms a user accepted, when, and that they confirmed
//        they are 18+ (contest rules require it). Existing accounts get NULL
//        and are asked to accept on their next sign-in.
// GA-19: invoice numbers were "INV-" + last 8 digits of Date.now(), which is
//        neither sequential nor unique. Use a DB sequence + unique index.

const { sql } = require('kysely');

async function up(db) {
  await sql`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS accepted_terms_version text,
      ADD COLUMN IF NOT EXISTS accepted_terms_at timestamptz,
      ADD COLUMN IF NOT EXISTS age_confirmed_at timestamptz
  `.execute(db);

  await sql`CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 100001`.execute(db);

  // Existing timestamp-based numbers may already collide; keep the first and
  // re-number the rest so the unique index can be created.
  await sql`
    WITH dups AS (
      SELECT id, row_number() OVER (PARTITION BY invoice_number ORDER BY created_at, id) AS rn
        FROM orders
       WHERE invoice_number IS NOT NULL
    )
    UPDATE orders o
       SET invoice_number = 'INV-' || nextval('invoice_number_seq')
      FROM dups d
     WHERE o.id = d.id AND d.rn > 1
  `.execute(db);

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS orders_invoice_number_key
      ON orders (invoice_number) WHERE invoice_number IS NOT NULL
  `.execute(db);
}

async function down(db) {
  await sql`DROP INDEX IF EXISTS orders_invoice_number_key`.execute(db);
  await sql`DROP SEQUENCE IF EXISTS invoice_number_seq`.execute(db);
  await sql`
    ALTER TABLE users
      DROP COLUMN IF EXISTS accepted_terms_version,
      DROP COLUMN IF EXISTS accepted_terms_at,
      DROP COLUMN IF EXISTS age_confirmed_at
  `.execute(db);
}

module.exports = { up, down };
