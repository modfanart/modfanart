const express = require('express');
const FavoriteController = require('../controller/favorite.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

// router.use(authenticateToken);

router.post('/:artworkId/favorite', FavoriteController.toggleFavorite);
router.get('/me/favorites/artworks', FavoriteController.getMyFavoriteArtworks);

module.exports = router;