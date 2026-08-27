// src/migrations/20260827000000_add_licensing_status_to_contest_entries.js
//
// Selection and licensing are separate facts: an entry can win the contest
// (status='winner') and still never complete its licensing agreement. This
// column tracks where that agreement is, set manually by the brand for now.
// 'finalized' is the terminal value and is what the public gallery gate
// requires - a winner whose paperwork never finishes stays out of the gallery
// without losing its selection or rank.

const { sql } = require('kysely');

// IF NOT EXISTS for the same reason as the results_share_token migration:
// production columns have historically been added by hand, and a re-run must
// not fail on an environment that already has it.
async function up(db) {
  await sql`
    ALTER TABLE contest_entries
    ADD COLUMN IF NOT EXISTS licensing_status text NOT NULL DEFAULT 'not_started'
  `.execute(db);

  // Postgres has no ADD CONSTRAINT IF NOT EXISTS, so guard with a DO block to
  // keep the migration re-runnable against a hand-patched database.
  await sql`
    DO $$ BEGIN
      ALTER TABLE contest_entries
        ADD CONSTRAINT contest_entries_licensing_status_check
        CHECK (licensing_status IN
          ('not_started', 'agreement_sent', 'signed', 'declined', 'expired', 'finalized'));
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `.execute(db);
}

// Not reversed, matching this repo's convention for ADD COLUMN IF NOT EXISTS
// migrations: on a database where the column predated this migration, up()
// did nothing, and an unconditional drop would destroy licensing progress.
async function down() {}

module.exports = { up, down };
