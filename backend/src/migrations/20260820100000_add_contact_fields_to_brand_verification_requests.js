// src/migrations/20260820100000_add_contact_fields_to_brand_verification_requests.js
//
// BrandVerificationRequest.create has inserted contact_email, contact_phone,
// description, team_size and how_heard since the signup form started
// collecting them, but no migration ever added the columns: the table predates
// the migrations directory and was only ever created from a schema dump that
// lacks them. Every brand signup therefore failed at the final step with
// `column "contact_email" of relation "brand_verification_requests" does not
// exist` (Postgres reports only the first missing column; all five are absent).
//
// Nullable on purpose. The controller already rejects a request without a
// contact_email before it reaches the database, and any rows that predate this
// migration have no value to backfill, so NOT NULL would only make the
// migration fail on a populated table.

const { sql } = require('kysely');

const COLUMNS = ['contact_email', 'contact_phone', 'description', 'team_size', 'how_heard'];

// IF NOT EXISTS for the same reason as the contest_judges timestamps
// migration: production columns have historically been added by hand, and a
// re-run must not fail on an environment that already has one of them.
async function up(db) {
  for (const column of COLUMNS) {
    await sql`
      ALTER TABLE brand_verification_requests
      ADD COLUMN IF NOT EXISTS ${sql.ref(column)} text
    `.execute(db);
  }
}

// Deliberately not reversed, matching this repo's convention for ADD COLUMN
// IF NOT EXISTS migrations: on a database where a column predated this
// migration, up() did nothing for it, and an unconditional drop would destroy
// the contact details of every request already submitted.
async function down() {}

module.exports = { up, down, COLUMNS };
