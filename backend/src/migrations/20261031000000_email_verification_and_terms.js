// src/migrations/20261031000000_email_verification_and_terms.js
//
// Email verification is now enforced: unverified accounts can sign in and browse but
// cannot submit artwork, enter contests or request brand verification. Until now nothing
// checked users.email_verified, so most existing email/password accounts are false only
// because no flow ever set it. Grandfather every account that exists when this runs, so
// current artists and brands are not locked out mid-contest; accounts created afterwards
// start unverified and are flipped by Firebase's email_verified claim.
//
// terms_accepted_at records when an account accepted the Terms of Service and Privacy
// Policy at signup. Existing accounts stay NULL: they never accepted explicitly, and
// backfilling a timestamp would claim consent that was never given.

const { sql } = require('kysely');

async function up(db) {
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz
  `.execute(db);

  await sql`
    UPDATE users
    SET email_verified = true
    WHERE email_verified IS DISTINCT FROM true
  `.execute(db);
}

// Not reversed: the grandfathering cannot be told apart from real verifications
// afterwards, and dropping terms_accepted_at would destroy consent records.
async function down() {}

module.exports = { up, down };
