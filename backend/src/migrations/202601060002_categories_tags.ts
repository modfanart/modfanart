// 202601060002_categories_tags.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('categories')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('parent_id', 'uuid', (col) => col.references('categories.id').onDelete('set null'))
    .addColumn('description', 'text')
    .addColumn('icon_url', 'text')
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .execute();

  await db.schema
    .createTable('tags')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('approved', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('usage_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_by', 'uuid', (col) => col.references('users.id'))
    .addColumn('approved_by', 'uuid', (col) => col.references('users.id'))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .execute();

  await db.schema
    .createTable('taggings')
    .addColumn('tag_id', 'uuid', (col) => col.references('tags.id').onDelete('cascade').notNull())
    .addColumn('taggable_type', 'text', (col) => col.notNull())
    .addColumn('taggable_id', 'uuid', (col) => col.notNull())
    .addColumn('created_by', 'uuid', (col) => col.references('users.id'))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addPrimaryKeyConstraint('taggings_pk', ['tag_id', 'taggable_type', 'taggable_id'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('taggings').execute();
  await db.schema.dropTable('tags').execute();
  await db.schema.dropTable('categories').execute();
}