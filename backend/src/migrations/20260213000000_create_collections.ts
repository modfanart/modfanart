// src/migrations/20260213000000_create_collections.ts
import { Kysely, sql } from 'kysely';
import { DB } from '../db/types';

export async function up(db: Kysely<DB>): Promise<void> {
  // ───────────────────────────────
  // Create 'collections' table first
  // ───────────────────────────────
  await db.schema
    .createTable('collections')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('owner_type', 'varchar(255)', (col) => col.notNull()) // enum workaround
    .addColumn('owner_id', 'uuid', (col) => col.notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('slug', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('is_public', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('cover_image_url', 'text')
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', sql`timestamptz`, (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', sql`timestamptz`, (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('deleted_at', sql`timestamptz`)
    .execute();

  // ───────────────────────────────
  // Create 'collection_items' table
  // ───────────────────────────────
  await db.schema
    .createTable('collection_items')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('collection_id', 'uuid', (col) =>
      col.references('collections.id').onDelete('cascade').notNull()
    )
    .addColumn('artwork_id', 'uuid', (col) =>
      col.references('artworks.id').onDelete('cascade').notNull()
    )
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('added_at', sql`timestamptz`, (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint('unique_collection_artwork', ['collection_id', 'artwork_id'])
    .execute();

  // ───────────────────────────────
  // Partial unique index for owner+slug (only if not deleted)
  // ───────────────────────────────
  await db.schema
    .createIndex('idx_collections_owner_slug')
    .on('collections')
    .columns(['owner_type', 'owner_id', 'slug'])
    .unique()
    .where(() => sql`deleted_at IS NULL`)
    .execute();

  // ───────────────────────────────
  // Regular indexes
  // ───────────────────────────────
  await db.schema
    .createIndex('idx_collections_owner')
    .on('collections')
    .columns(['owner_type', 'owner_id'])
    .execute();

  await db.schema
    .createIndex('idx_collection_items_collection')
    .on('collection_items')
    .column('collection_id')
    .execute();

  await db.schema
    .createIndex('idx_collection_items_artwork')
    .on('collection_items')
    .column('artwork_id')
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  // Drop indexes first
  await db.schema.dropIndex('idx_collections_owner_slug').ifExists().execute();
  await db.schema.dropIndex('idx_collections_owner').ifExists().execute();
  await db.schema.dropIndex('idx_collection_items_collection').ifExists().execute();
  await db.schema.dropIndex('idx_collection_items_artwork').ifExists().execute();

  // Drop tables
  await db.schema.dropTable('collection_items').ifExists().execute();
  await db.schema.dropTable('collections').ifExists().execute();
}
