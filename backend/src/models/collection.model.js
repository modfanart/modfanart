// src/models/collections.model.js
const { db } = require('../config/index.js'); // your Kysely DB instance
const { sql } = require('kysely');

/**
 * Create a new collection
 */
async function createCollection(data) {
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
async function getCollectionsByOwner(owner_type, owner_id) {
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
async function getCollectionById(id) {
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
async function updateCollection(id, updates) {
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
async function deleteCollection(id) {
  return db
    .updateTable('collections')
    .set({
      deleted_at: sql`now()`,
    })
    .where('id', '=', id)
    .executeTakeFirst();
}

// Export all functions (CommonJS style)
module.exports = {
  createCollection,
  getCollectionsByOwner,
  getCollectionById,
  updateCollection,
  deleteCollection,
};
