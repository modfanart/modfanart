// src/controllers/tagging.controller.js
const Tag = require('../models/tag.model');
const Tagging = require('../models/tagging.model');
const Artwork = require('../models/artwork.model');
const { db } = require('../config');
class TaggingController {
  // POST /artworks/:artworkId/tags
  static async addTag(req, res) {
    try {
      const { artworkId } = req.params;
      const { tagName } = req.body;

      if (!tagName || typeof tagName !== 'string' || tagName.trim().length < 2) {
        return res.status(400).json({ error: 'Valid tag name required (min 2 characters)' });
      }

      const artwork = await Artwork.findById(artworkId);
      if (!artwork) return res.status(404).json({ error: 'Artwork not found' });

      // Ownership or permission check
      if (artwork.creator_id !== req.user.id && !req.user.permissions?.['tags.manage']) {
        return res.status(403).json({ error: 'Not authorized to tag this artwork' });
      }

      let tag = await Tag.findByNameOrSlug(tagName.trim());

      if (!tag) {
        const slug = tagName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        tag = await Tag.create(tagName.trim(), slug, req.user.id);
      } else {
        // Optional: only increment if new usage
        await Tag.incrementUsage(tag.id);
      }

      await Tagging.addTag(tag.id, 'artwork', artworkId, req.user.id);

      res.status(201).json({
        message: 'Tag added',
        tag: {
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          approved: tag.approved,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add tag' });
    }
  }

  // DELETE /artworks/:artworkId/tags/:tagId
  static async removeTag(req, res) {
    try {
      const { artworkId, tagId } = req.params;

      const artwork = await Artwork.findById(artworkId);
      if (!artwork) return res.status(404).json({ error: 'Artwork not found' });

      if (artwork.creator_id !== req.user.id && !req.user.permissions?.['tags.manage']) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await Tagging.removeTag(tagId, 'artwork', artworkId);

      res.json({ message: 'Tag removed' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to remove tag' });
    }
  }

  // GET /artworks/:artworkId/tags
  static async getTags(req, res) {
    try {
      const { artworkId } = req.params;

      const tags = await Tagging.getTagsForEntity('artwork', artworkId);

      res.json({ tags });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch tags' });
    }
  }
}

module.exports = TaggingController;