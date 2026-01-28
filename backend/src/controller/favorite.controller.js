// src/controllers/favorite.controller.js
const Favorite = require('../models/favorite.model');
const Artwork = require('../models/artwork.model');
const { db } = require('../config');
class FavoriteController {
  // POST /artworks/:artworkId/favorite
  static async toggleFavorite(req, res) {
    try {
      const { artworkId } = req.params;

      const artwork = await Artwork.findById(artworkId);
      if (!artwork) {
        return res.status(404).json({ error: 'Artwork not found' });
      }

      const wasFavorited = await Favorite.isFavorited(req.user.id, 'artwork', artworkId);

      await Favorite.toggle(req.user.id, 'artwork', artworkId);

      // Optional: update counter (you could use trigger or background job)
      if (!wasFavorited) {
        await db
          .updateTable('artworks')
          .set((eb) => ({ favorites_count: eb.ref('favorites_count').plus(1) }))
          .where('id', '=', artworkId)
          .execute();
      } else {
        await db
          .updateTable('artworks')
          .set((eb) => ({ favorites_count: eb.ref('favorites_count').minus(1) }))
          .where('id', '=', artworkId)
          .where('favorites_count', '>', 0)
          .execute();
      }

      res.json({
        message: wasFavorited ? 'Removed from favorites' : 'Added to favorites',
        favorited: !wasFavorited,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to toggle favorite' });
    }
  }

  // GET /users/me/favorites/artworks
  static async getMyFavoriteArtworks(req, res) {
    try {
      const favorites = await Favorite.getFavoritesForUser(req.user.id, 'artwork', 50, 0);

      if (favorites.length === 0) {
        return res.json({ artworks: [] });
      }

      const artworkIds = favorites.map(f => f.favoritable_id);

      const artworks = await db
        .selectFrom('artworks')
        .select(['id', 'title', 'thumbnail_url', 'creator_id', 'favorites_count'])
        .where('id', 'in', artworkIds)
        .where('status', '=', 'published')
        .where('deleted_at', 'is', null)
        .execute();

      res.json({ artworks });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
  }
}

module.exports = FavoriteController;