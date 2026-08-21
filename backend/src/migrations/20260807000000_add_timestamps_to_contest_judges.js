// src/migrations/20260807000000_add_timestamps_to_contest_judges.js
//
// contest_judges was created without timestamps, but assignJudge writes
// created_at/updated_at on insert and getJudges selects and orders by them.
// Every assign/list call therefore failed with
// `column "created_at" of relation "contest_judges" does not exist`.
//
// Defaulting to now() backfills existing assignments, so the columns can be
// NOT NULL without a separate data-migration step.

const { sql } = require('kysely');

// IF NOT EXISTS because these columns may already have been added by hand on
// environments where someone patched around the failure before this landed.
async function up(db) {
  await sql`
    ALTER TABLE contest_judges
    ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()
  `.execute(db);

  await sql`
    ALTER TABLE contest_judges
    ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()
  `.execute(db);
}

// Deliberately not reversed. up() is ADD COLUMN IF NOT EXISTS, so on any
// database that already had these columns it did nothing. An unconditional
// drop here would therefore destroy pre-existing, populated columns that
// getJudges selects and orders by. Drop them by hand if a rollback genuinely
// needs it.
async function down() {}

module.exports = { up, down };
