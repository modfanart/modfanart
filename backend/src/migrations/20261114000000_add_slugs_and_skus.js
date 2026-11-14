// src/migrations/20261114000000_add_slugs_and_skus.js
//
// Stable, human-readable identifiers for public URLs.
//
//   contests.slug         - existed, but was not guaranteed unique at the DB
//                           level (only an app-side check, racy) and could be
//                           blank on older rows. Backfill + unique index.
//   merch_products.slug   - NEW. Product pages were /marketplace/product/<uuid>.
//   merch_variants.sku    - existed (NOT NULL UNIQUE). Normalised to upper case
//                           and a case-insensitive unique index added, so
//                           "tee-blk-m" and "TEE-BLK-M" can't both exist.
//
// Uniqueness ignores soft-deleted rows so a deleted contest/product doesn't
// block its slug forever. Re-running is safe (IF NOT EXISTS everywhere).

const { sql } = require('kysely');

// Same rules as the app's slugify (lib/slug.js): lowercase ascii, hyphens.
const SLUGIFY = (col) => sql`
  trim(both '-' from regexp_replace(
    regexp_replace(lower(coalesce(${sql.ref(col)}, '')), '[^a-z0-9]+', '-', 'g'),
    '-+', '-', 'g'))`;

async function backfillAndDedupe(db, table, sourceCol, fallbackPrefix) {
  // 1. Fill blank slugs from the source column (or prefix + short id).
  await sql`
    UPDATE ${sql.table(table)} t
       SET slug = CASE
         WHEN ${SLUGIFY(sourceCol)} <> '' THEN left(${SLUGIFY(sourceCol)}, 80)
         ELSE ${fallbackPrefix} || '-' || left(t.id::text, 8)
       END
     WHERE t.slug IS NULL OR btrim(t.slug) = ''
  `.execute(db);

  // 2. Normalise existing slugs to the canonical form.
  await sql`
    UPDATE ${sql.table(table)}
       SET slug = left(${SLUGIFY('slug')}, 80)
     WHERE slug <> left(${SLUGIFY('slug')}, 80) AND ${SLUGIFY('slug')} <> ''
  `.execute(db);

  // 3. De-duplicate among live rows: oldest keeps the slug, later ones get
  //    a short id suffix (unique by construction, unlike -2/-3 which can
  //    collide with an existing "name-2").
  await sql`
    WITH ranked AS (
      SELECT id, slug,
             row_number() OVER (PARTITION BY slug ORDER BY created_at, id) AS rn
        FROM ${sql.table(table)}
       WHERE deleted_at IS NULL
    )
    UPDATE ${sql.table(table)} t
       SET slug = r.slug || '-' || left(t.id::text, 6)
      FROM ranked r
     WHERE t.id = r.id AND r.rn > 1
  `.execute(db);
}

async function up(db) {
  // ── contests.slug ────────────────────────────────────────────────
  await sql`ALTER TABLE contests ADD COLUMN IF NOT EXISTS slug text`.execute(db);
  await backfillAndDedupe(db, 'contests', 'title', 'contest');
  await sql`ALTER TABLE contests ALTER COLUMN slug SET NOT NULL`.execute(db);
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS contests_slug_live_key
      ON contests (slug) WHERE deleted_at IS NULL
  `.execute(db);

  // ── merch_products.slug ──────────────────────────────────────────
  await sql`ALTER TABLE merch_products ADD COLUMN IF NOT EXISTS slug text`.execute(db);
  await backfillAndDedupe(db, 'merch_products', 'title', 'product');
  await sql`ALTER TABLE merch_products ALTER COLUMN slug SET NOT NULL`.execute(db);
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS merch_products_slug_live_key
      ON merch_products (slug) WHERE deleted_at IS NULL
  `.execute(db);

  // ── merch_variants.sku ───────────────────────────────────────────
  await sql`UPDATE merch_variants SET sku = upper(btrim(sku)) WHERE sku <> upper(btrim(sku))`.execute(db);
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS merch_variants_sku_upper_key
      ON merch_variants (upper(sku))
  `.execute(db);
}

async function down(db) {
  await sql`DROP INDEX IF EXISTS merch_variants_sku_upper_key`.execute(db);
  await sql`DROP INDEX IF EXISTS merch_products_slug_live_key`.execute(db);
  await sql`ALTER TABLE merch_products DROP COLUMN IF EXISTS slug`.execute(db);
  await sql`DROP INDEX IF EXISTS contests_slug_live_key`.execute(db);
  // contests.slug pre-dates this migration; leave the column in place.
}

module.exports = { up, down };
