// 202601060006_moderation_and_misc.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('moderation_queue')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('entity_type', 'text', (col) => col.notNull())
    .addColumn('entity_id', 'uuid', (col) => col.notNull())
    .addColumn('status', 'text', (col) => col.notNull())
    .addColumn('priority', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('assigned_to', 'uuid', (col) => col.references('users.id'))
    .addColumn('reviewed_by', 'uuid', (col) => col.references('users.id'))
    .addColumn('reviewed_at', 'timestamptz')
    .addColumn('decision', 'text')
    .addColumn('notes', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .execute();

  await db.schema
    .createTable('user_violations')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('reported_by', 'uuid', (col) => col.references('users.id'))
    .addColumn('entity_type', 'text')
    .addColumn('entity_id', 'uuid')
    .addColumn('violation_type', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('status', 'text', (col) => col.notNull())
    .addColumn('strike_issued', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('resolved_by', 'uuid', (col) => col.references('users.id'))
    .addColumn('resolved_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .execute();

  await db.schema
    .createTable('favorites')
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('favoritable_type', 'text', (col) => col.notNull())
    .addColumn('favoritable_id', 'uuid', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addPrimaryKeyConstraint('favorites_pk', ['user_id', 'favoritable_type', 'favoritable_id'])
    .execute();

  await db.schema
    .createTable('notifications')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('type', 'text', (col) => col.notNull())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('body', 'text')
    .addColumn('data', 'jsonb')
    .addColumn('read_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .execute();

  await db.schema
    .createTable('audited_events')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('actor_id', 'uuid', (col) => col.references('users.id'))
    .addColumn('action', 'text', (col) => col.notNull())
    .addColumn('entity_type', 'text')
    .addColumn('entity_id', 'uuid')
    .addColumn('old_values', 'jsonb')
    .addColumn('new_values', 'jsonb')
    .addColumn('ip_address', 'text')
    .addColumn('user_agent', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('audited_events').execute();
  await db.schema.dropTable('notifications').execute();
  await db.schema.dropTable('favorites').execute();
  await db.schema.dropTable('user_violations').execute();
  await db.schema.dropTable('moderation_queue').execute();
}