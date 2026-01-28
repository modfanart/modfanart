// migrations/202501190001_extensions_and_core.ts
// Note: I changed the year to 2025→2026 based on current date context

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // 1. Enable PostgreSQL extensions
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`.execute(db);
  await sql`CREATE EXTENSION IF NOT EXISTS "citext"`.execute(db);

  // ────────────────────────────────────────────────
  // BRAND & RELATED TABLES
  // ────────────────────────────────────────────────

  // 8. Brands table
  await db.schema
    .createTable('brands')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('description', 'text')
    .addColumn('logo_url', 'text')
    .addColumn('banner_url', 'text')
    .addColumn('website', 'text')
    .addColumn('social_links', 'jsonb', (col) => col.defaultTo('{}'))
    .addColumn('status', 'text', (col) =>
      col.notNull().defaultTo('pending').check(sql`status IN ('active', 'suspended', 'pending', 'deactivated')`)
    )
    .addColumn('verification_request_id', 'uuid', (col) => col.references('brand_verification_requests.id').onDelete('set null'))
    .addColumn('followers_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('deleted_at', 'timestamptz')
    .execute();

  await db.schema.createIndex('brands_user_id_idx').on('brands').column('user_id').execute();
  await db.schema.createIndex('brands_slug_idx').on('brands').column('slug').execute();

  // 9. Brand → Artworks (storefront)
  await db.schema
    .createTable('brand_artworks')
    .addColumn('brand_id', 'uuid', (col) => col.references('brands.id').onDelete('cascade').notNull())
    .addColumn('artwork_id', 'uuid', (col) => col.references('artworks.id').onDelete('cascade').notNull())
    .addColumn('is_featured', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('added_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addPrimaryKeyConstraint('brand_artworks_pk', ['brand_id', 'artwork_id'])
    .execute();

  // 10. Brand Posts (timeline / pinned content)
  await db.schema
    .createTable('brand_posts')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('brand_id', 'uuid', (col) => col.references('brands.id').onDelete('cascade').notNull())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('content', 'text')
    .addColumn('media_urls', 'jsonb', (col) => col.defaultTo('[]'))
    .addColumn('status', 'text', (col) =>
      col.notNull().defaultTo('draft').check(sql`status IN ('draft', 'published', 'archived')`)
    )
    .addColumn('is_pinned', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('likes_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('comments_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('upvotes_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('deleted_at', 'timestamptz')
    .execute();

  await db.schema.createIndex('brand_posts_brand_id_idx').on('brand_posts').column('brand_id').execute();
  await db.schema.createIndex('brand_posts_status_idx').on('brand_posts').column('status').execute();

  // 11. Likes on brand posts
  await db.schema
    .createTable('brand_post_likes')
    .addColumn('post_id', 'uuid', (col) => col.references('brand_posts.id').onDelete('cascade').notNull())
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addPrimaryKeyConstraint('brand_post_likes_pk', ['post_id', 'user_id'])
    .execute();

  // 12. Comments on brand posts (threaded)
  await db.schema
    .createTable('brand_post_comments')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('post_id', 'uuid', (col) => col.references('brand_posts.id').onDelete('cascade').notNull())
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('parent_id', 'uuid', (col) => col.references('brand_post_comments.id').onDelete('cascade'))
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('likes_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('deleted_at', 'timestamptz')
    .execute();

  // 13. Upvotes on brand posts
  await db.schema
    .createTable('brand_post_upvotes')
    .addColumn('post_id', 'uuid', (col) => col.references('brand_posts.id').onDelete('cascade').notNull())
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('vote_weight', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addPrimaryKeyConstraint('brand_post_upvotes_pk', ['post_id', 'user_id'])
    .execute();

  // 14. Brand followers
  await db.schema
    .createTable('brand_followers')
    .addColumn('brand_id', 'uuid', (col) => col.references('brands.id').onDelete('cascade').notNull())
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('followed_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addPrimaryKeyConstraint('brand_followers_pk', ['brand_id', 'user_id'])
    .execute();

  // 15. Shared trigger function for updated_at
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // 16. Attach triggers
  await sql`
    DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
    CREATE TRIGGER update_brands_updated_at
      BEFORE UPDATE ON brands
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  await sql`
    DROP TRIGGER IF EXISTS update_brand_posts_updated_at ON brand_posts;
    CREATE TRIGGER update_brand_posts_updated_at
      BEFORE UPDATE ON brand_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  await sql`
    DROP TRIGGER IF EXISTS update_brand_post_comments_updated_at ON brand_post_comments;
    CREATE TRIGGER update_brand_post_comments_updated_at
      BEFORE UPDATE ON brand_post_comments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  // 17. Optional: atomic increment function example (can be called via RPC)
  await sql`
    CREATE OR REPLACE FUNCTION increment_brand_post_counter(
      p_post_id uuid,
      p_column text
    )
    RETURNS void AS $$
    BEGIN
      EXECUTE format('UPDATE brand_posts SET %I = %I + 1 WHERE id = $1', p_column, p_column)
      USING p_post_id;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop in reverse creation order + clean up functions/triggers

  await sql`DROP FUNCTION IF EXISTS increment_brand_post_counter(uuid, text)`.execute(db);

  await sql`DROP TRIGGER IF EXISTS update_brand_post_comments_updated_at ON brand_post_comments`.execute(db);
  await sql`DROP TRIGGER IF EXISTS update_brand_posts_updated_at ON brand_posts`.execute(db);
  await sql`DROP TRIGGER IF EXISTS update_brands_updated_at ON brands`.execute(db);
  await sql`DROP FUNCTION IF EXISTS update_updated_at_column()`.execute(db);

  await db.schema.dropTable('brand_followers').ifExists().execute();
  await db.schema.dropTable('brand_post_upvotes').ifExists().execute();
  await db.schema.dropTable('brand_post_comments').ifExists().execute();
  await db.schema.dropTable('brand_post_likes').ifExists().execute();
  await db.schema.dropTable('brand_posts').ifExists().execute();
  await db.schema.dropTable('brand_artworks').ifExists().execute();
  await db.schema.dropTable('brands').ifExists().execute();
}