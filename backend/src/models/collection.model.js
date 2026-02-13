// src/models/collections.model.js
import { db } from '../config/index.js'; // your Kysely DB instance
import { sql } from 'kysely';

/**
 * Create a new collection
 * @param {Object} data
 * @param {string} data.owner_type
 * @param {string} data.owner_id
 * @param {string} data.name
 * @param {string} data.slug
 * @param {string} [data.description]
 * @param {boolean} [data.is_public]
 * @param {string} [data.cover_image_url]
 */
export async function createCollection(data) {
  const result = await db
    .insertInto('collections')
    .values({
      owner_type: data.owner_type,
      owner_id: data.owner_id,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      is_public: data.is_public ?? true,
      cover_image_url: data.cover_image_url || null,
      sort_order: 0,
      created_at: sql`now()`,
      updated_at: sql`now()`,
    })
    .returningAll()
    .executeTakeFirst();

  return result;
}

/**
 * Get all collections for a given owner
 */
export async function getCollectionsByOwner(owner_type, owner_id) {
  return db
    .selectFrom('collections')
    .selectAll()
    .where('owner_type', '=', owner_type)
    .where('owner_id', '=', owner_id)
    .where('deleted_at', 'is', null)
    .orderBy('sort_order', 'asc')
    .execute();
}

/**
 * Get a single collection by id
 */
export async function getCollectionById(id) {
  return db
    .selectFrom('collections')
    .selectAll()
    .where('id', '=', id)
    .where('deleted_at', 'is', null)
    .executeTakeFirst();
}

/**
 * Update collection
 */
export async function updateCollection(id, updates) {
  return db
    .updateTable('collections')
    .set({
      ...updates,
      updated_at: sql`now()`,
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

/**
 * Soft delete collection
 */
export async function deleteCollection(id) {
  return db
    .updateTable('collections')
    .set({
      deleted_at: sql`now()`,
    })
    .where('id', '=', id)
    .executeTakeFirst();
}
