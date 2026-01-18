// 202601060004_contests.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('contests')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('brand_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull()) // assuming brand is a user
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('rules', 'text')
    .addColumn('prizes', 'jsonb')
    .addColumn('start_date', 'timestamptz', (col) => col.notNull())
    .addColumn('submission_end_date', 'timestamptz', (col) => col.notNull())
    .addColumn('voting_end_date', 'timestamptz')
    .addColumn('judging_end_date', 'timestamptz')
    .addColumn('status', 'text', (col) => col.notNull().check(sql`status IN ('draft', 'published', 'live', 'judging', 'completed', 'archived')`))
    .addColumn('visibility', 'text', (col) => col.notNull().check(sql`visibility IN ('public', 'private', 'unlisted')`))
    .addColumn('max_entries_per_user', 'integer', (col) => col.notNull())
    .addColumn('entry_requirements', 'jsonb')
    .addColumn('judging_criteria', 'jsonb')
    .addColumn('winner_announced', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('deleted_at', 'timestamptz')
    .execute();

  await db.schema
    .createTable('contest_categories')
    .addColumn('contest_id', 'uuid', (col) => col.references('contests.id').onDelete('cascade').notNull())
    .addColumn('category_id', 'uuid', (col) => col.references('categories.id').onDelete('cascade').notNull())
    .addPrimaryKeyConstraint('contest_categories_pk', ['contest_id', 'category_id'])
    .execute();

  await db.schema
    .createTable('contest_entries')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('contest_id', 'uuid', (col) => col.references('contests.id').onDelete('cascade').notNull())
    .addColumn('artwork_id', 'uuid', (col) => col.references('artworks.id').onDelete('cascade').notNull())
    .addColumn('creator_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('submission_notes', 'text')
    .addColumn('status', 'text', (col) => col.notNull().check(sql`status IN ('pending', 'approved', 'rejected', 'disqualified', 'winner')`))
    .addColumn('rank', 'integer')
    .addColumn('score_public', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('score_judge', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('moderation_status', 'text', (col) => col.notNull().defaultTo('pending'))
    .addColumn('moderated_by', 'uuid', (col) => col.references('users.id'))
    .addColumn('moderated_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .execute();

  await db.schema
    .createTable('contest_votes')
    .addColumn('entry_id', 'uuid', (col) => col.references('contest_entries.id').onDelete('cascade').notNull())
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('vote_weight', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addPrimaryKeyConstraint('contest_votes_pk', ['entry_id', 'user_id'])
    .execute();

  await db.schema
    .createTable('contest_judges')
    .addColumn('contest_id', 'uuid', (col) => col.references('contests.id').onDelete('cascade').notNull())
    .addColumn('judge_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('invited_by', 'uuid', (col) => col.references('users.id'))
    .addColumn('accepted', 'boolean', (col) => col.notNull().defaultTo(false))
    .addPrimaryKeyConstraint('contest_judges_pk', ['contest_id', 'judge_id'])
    .execute();

  await db.schema
    .createTable('contest_judge_scores')
    .addColumn('entry_id', 'uuid', (col) => col.references('contest_entries.id').onDelete('cascade').notNull())
    .addColumn('judge_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('score', 'integer', (col) => col.notNull())
    .addColumn('comments', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addPrimaryKeyConstraint('contest_judge_scores_pk', ['entry_id', 'judge_id'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('contest_judge_scores').execute();
  await db.schema.dropTable('contest_judges').execute();
  await db.schema.dropTable('contest_votes').execute();
  await db.schema.dropTable('contest_entries').execute();
  await db.schema.dropTable('contest_categories').execute();
  await db.schema.dropTable('contests').execute();
}