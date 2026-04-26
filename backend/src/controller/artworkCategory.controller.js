// src/controllers/artworkCategory.controller.js
const Artwork = require('../models/artwork.model');
const Category = require('../models/category.model');
const ArtworkCategory = require('../models/artworkCategory.model');
const { db } = require('../config');
class ArtworkCategoryController {
  // POST /artworks/:artworkId/categories
  static async addCategory(req, res) {
    try {
      const { artworkId } = req.params;
      const { categoryId } = req.body;

      const artwork = await Artwork.findById(artworkId);
      if (!artwork) {
        return res.status(404).json({ error: 'Artwork not found' });
      }

      // Optional: ownership check
      if (
        artwork.creator_id !== req.user.id &&
        !req.user.permissions?.['artworks.manage']
      ) {
        return res
          .status(403)
          .json({ error: 'Not authorized to modify this artwork' });
      }

      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      await ArtworkCategory.assign(artworkId, categoryId);

      res.status(201).json({
        message: 'Category added to artwork',
        categoryId,
        categoryName: category.name,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add category' });
    }
  }

  // DELETE /artworks/:artworkId/categories/:categoryId
  static async removeCategory(req, res) {
    try {
      const { artworkId, categoryId } = req.params;

      const artwork = await Artwork.findById(artworkId);
      if (!artwork) {
        return res.status(404).json({ error: 'Artwork not found' });
      }

      if (
        artwork.creator_id !== req.user.id &&
        !req.user.permissions?.['artworks.manage']
      ) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await ArtworkCategory.remove(artworkId, categoryId);

      res.json({ message: 'Category removed from artwork' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to remove category' });
    }
  }

  // GET /artworks/:artworkId/categories
  static async getCategories(req, res) {
    try {
      const { artworkId } = req.params;

      const categoryIds =
        await ArtworkCategory.getCategoryIdsForArtwork(artworkId);
      if (categoryIds.length === 0) {
        return res.json({ categories: [] });
      }

      const categories = await db
        .selectFrom('categories')
        .select(['id', 'name', 'slug'])
        .where('id', 'in', categoryIds)
        .execute();

      res.json({ categories });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }
}

module.exports = ArtworkCategoryController;
