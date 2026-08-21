// src/migrations/20260820000000_add_results_share_token_to_contests.js
//
// A brand shares its contest results (the selected winners) through an
// unauthenticated link. The link is keyed by a random token rather than the
// contest id so that standings never become guessable-by-id, and so the link
// can circulate before winners are publicly announced. NULL means the brand
// has never generated a share link for this contest.

const { sql } = require('kysely');

// IF NOT EXISTS for the same reason as the contest_judges timestamps
// migration: production columns have historically been added by hand, and a
// re-run must not fail on an environment that already has it.
async function up(db) {
  await sql`
    ALTER TABLE contests
    ADD COLUMN IF NOT EXISTS results_share_token text
  `.execute(db);

  // Unique so a token resolves to exactly one contest. Partial index: NULLs
  // (contests never shared) are the common case and need no index entries.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS contests_results_share_token_key
    ON contests (results_share_token)
    WHERE results_share_token IS NOT NULL
  `.execute(db);
}

// Not reversed, matching this repo's convention for ADD COLUMN IF NOT EXISTS
// migrations: on a database where the column predated this migration, up() did
// nothing, and an unconditional drop would destroy live share links.
async function down() {}

module.exports = { up, down };
