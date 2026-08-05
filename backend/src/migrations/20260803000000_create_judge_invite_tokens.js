// src/migrations/20260803000000_create_judge_invite_tokens.js
//
//not sure if this is the right folder/done, may need to remove later


const { sql } = require('kysely');

async function up(db) {
  await db.schema
    .createTable('judge_invite_tokens')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('token', 'text', (col) => col.notNull().unique())
    .addColumn('contest_id', 'uuid', (col) =>
      col.notNull().references('contests.id').onDelete('cascade')
    )
    .addColumn('judge_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('invited_by', 'uuid', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('used_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // One outstanding (unused) invite per judge/contest pair — regenerating
  // an invite should reuse or explicitly replace the old one, not stack up
  // duplicates.
  await db.schema
    .createIndex('judge_invite_tokens_contest_judge_unused_idx')
    .on('judge_invite_tokens')
    .columns(['contest_id', 'judge_id'])
    .where('used_at', 'is', null)
    .execute();

  await db.schema
    .createIndex('judge_invite_tokens_token_idx')
    .on('judge_invite_tokens')
    .column('token')
    .execute();
}

async function down(db) {
  await db.schema.dropTable('judge_invite_tokens').ifExists().execute();
}

module.exports = { up, down };