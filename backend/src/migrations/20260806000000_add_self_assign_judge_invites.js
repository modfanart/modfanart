// src/migrations/20260806000000_add_self_assign_judge_invites.js
//
// Adds support for "self-assign" and "open" judge invite links, on top
// of the original per-judge ("direct") flow:
//  - self_assign: contest-level link, locked to whoever redeems it first.
//  - open: contest-level link, reusable by any number of different
//    people, each becoming an assigned judge on their own first visit.
//
// - judge_id becomes nullable: null means "not yet claimed" (self_assign)
//   or "never claimed by design" (open).
// - type distinguishes the three flows so redeemInviteLink can branch
//   cleanly instead of inferring intent from judge_id being null.

const { sql } = require('kysely');

async function up(db) {
  await db.schema
    .alterTable('judge_invite_tokens')
    .alterColumn('judge_id', (col) => col.dropNotNull())
    .execute();

  await db.schema
    .alterTable('judge_invite_tokens')
    .addColumn('type', 'text', (col) =>
      col.notNull().defaultTo('direct')
    )
    .execute();

  await sql`
    ALTER TABLE judge_invite_tokens
    ADD CONSTRAINT judge_invite_tokens_type_check
    CHECK (type IN ('direct', 'self_assign', 'open'))
  `.execute(db);

  // A direct (per-judge) token must always name the judge it was issued to.
  // self_assign and open tokens never do up front — self_assign gets its
  // judge_id filled in on first claim; open never gets one at all.
  await sql`
    ALTER TABLE judge_invite_tokens
    ADD CONSTRAINT judge_invite_tokens_direct_requires_judge
    CHECK (type <> 'direct' OR judge_id IS NOT NULL)
  `.execute(db);
}

async function down(db) {
  await sql`
    ALTER TABLE judge_invite_tokens
    DROP CONSTRAINT IF EXISTS judge_invite_tokens_direct_requires_judge
  `.execute(db);

  await sql`
    ALTER TABLE judge_invite_tokens
    DROP CONSTRAINT IF EXISTS judge_invite_tokens_type_check
  `.execute(db);

  await db.schema
    .alterTable('judge_invite_tokens')
    .dropColumn('type')
    .execute();

  // Not reversed: re-adding NOT NULL on judge_id would fail if any
  // self-assign/open rows with a null judge_id exist. Clean those up
  // manually first if you need to roll this migration back.
}

module.exports = { up, down };