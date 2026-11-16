// src/common/utils/slug.util.js
//
// One slug/SKU implementation for the whole API (mirrors the SQL used by
// migration 20261114000000_add_slugs_and_skus so backfilled and new values
// look the same).

const { sql } = require('kysely');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function slugify(input, maxLen = 80) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLen)
    .replace(/-$/, '');
}

/**
 * A slug for `table` that no live (non-deleted) row uses yet.
 * Appends -2, -3, … on collision. `excludeId` lets an update keep its own slug.
 */
async function uniqueSlug(db, table, base, { excludeId = null, fallback = 'item' } = {}) {
  const root = slugify(base) || `${fallback}-${Date.now().toString(36)}`;
  for (let n = 1; n < 500; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    let q = db
      .selectFrom(table)
      .select('id')
      .where('slug', '=', candidate)
      .where('deleted_at', 'is', null);
    if (excludeId) q = q.where('id', '!=', excludeId);
    if (!(await q.executeTakeFirst())) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

/** Normalise a seller-supplied SKU: upper case, A-Z 0-9 and dashes. */
function normaliseSku(input) {
  return String(input || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

const PRODUCT_TYPE_CODES = {
  tshirt: 'TEE', 't-shirt': 'TEE', hoodie: 'HOOD', sweatshirt: 'SWT', mug: 'MUG',
  poster: 'PST', print: 'PRT', sticker: 'STK', tote: 'TOTE', cap: 'CAP', hat: 'CAP',
  phone_case: 'CASE', notebook: 'NTBK', pin: 'PIN', canvas: 'CNV',
};

/**
 * Generate a readable, unique variant SKU, e.g. TEE-LIBRARY-TEE-BLK-M.
 * Shape: <TYPE>-<PRODUCT>-<COLOR>-<SIZE>[-n]
 */
async function generateSku(db, { baseProductType, productSlug, color, size }) {
  const type =
    PRODUCT_TYPE_CODES[String(baseProductType || '').toLowerCase()] ||
    normaliseSku(baseProductType).slice(0, 4) ||
    'ITEM';
  const product = normaliseSku(productSlug).slice(0, 20);
  const colorCode = normaliseSku(color).slice(0, 3);
  const sizeCode = normaliseSku(size).slice(0, 4);
  const root = [type, product, colorCode, sizeCode].filter(Boolean).join('-');

  for (let n = 1; n < 500; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    const hit = await db
      .selectFrom('merch_variants')
      .select('id')
      .where(sql`upper(sku)`, '=', candidate)
      .executeTakeFirst();
    if (!hit) return candidate;
  }
  return `${root}-${Date.now().toString(36).toUpperCase()}`;
}

module.exports = { slugify, uniqueSlug, normaliseSku, generateSku, UUID_RE };
