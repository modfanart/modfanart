// 202601060003_artworks.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('artworks')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('creator_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('file_url', 'text', (col) => col.notNull())
    .addColumn('thumbnail_url', 'text')
    .addColumn('source_file_url', 'text')
    .addColumn('status', 'text', (col) => col.notNull().check(sql`status IN ('draft', 'published', 'archived', 'moderation_pending', 'rejected')`))
    .addColumn('moderation_status', 'text', (col) => col.notNull().defaultTo('pending'))
    .addColumn('moderation_notes', 'text')
    .addColumn('moderated_by', 'uuid', (col) => col.references('users.id'))
    .addColumn('moderated_at', 'timestamptz')
    .addColumn('views_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('favorites_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('deleted_at', 'timestamptz')
    .execute();

  await db.schema.createIndex('artworks_creator_id_idx').on('artworks').column('creator_id').execute();

  await db.schema
    .createTable('artwork_pricing_tiers')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('artwork_id', 'uuid', (col) => col.references('artworks.id').onDelete('cascade').notNull())
    .addColumn('license_type', 'text', (col) => col.notNull().check(sql`license_type IN ('personal', 'commercial', 'exclusive')`))
    .addColumn('price_inr_cents', 'integer', (col) => col.notNull())
    .addColumn('price_usd_cents', 'integer', (col) => col.notNull())
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .execute();

  await db.schema
    .createTable('artwork_categories')
    .addColumn('artwork_id', 'uuid', (col) => col.references('artworks.id').onDelete('cascade').notNull())
    .addColumn('category_id', 'uuid', (col) => col.references('categories.id').onDelete('cascade').notNull())
    .addPrimaryKeyConstraint('artwork_categories_pk', ['artwork_id', 'category_id'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('artwork_categories').execute();
  await db.schema.dropTable('artwork_pricing_tiers').execute();
  await db.schema.dropTable('artworks').execute();
}