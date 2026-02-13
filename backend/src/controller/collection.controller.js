// src/controllers/collection.controller.js
const Collections = require("../models/collection.model")

class CollectionController {
/**
 * Create a new collection
 */
static async  createCollection(req, res) {
  try {
    const data = req.body;
    const collection = await Collections.createCollection(data);
    res.status(201).json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create collection' });
  }
}

/**
 * Get all collections for a user or brand
 */
 static async  getCollections(req, res) {
  try {
    const { owner_type, owner_id } = req.query;
    const collections = await Collections.getCollectionsByOwner(owner_type, owner_id);
    res.json(collections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
}

/**
 * Get a single collection
 */
static async  getCollection(req, res) {
  try {
    const { id } = req.params;
    const collection = await Collections.getCollectionById(id);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
}

/**
 * Update a collection
 */
static async  updateCollection(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await Collections.updateCollection(id, updates);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update collection' });
  }
}

/**
 * Delete a collection (soft delete)
 */
 static async  deleteCollection(req, res) {
  try {
    const { id } = req.params;
    await Collections.deleteCollection(id);
    res.json({ message: 'Collection deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
}

}

module.exports = CollectionController
