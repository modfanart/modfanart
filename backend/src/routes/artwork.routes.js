const express = require('express');
const ArtworkCategoryController = require('../controller/artworkCategory.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');
const ArtworkController = require('../controller/artwork.controller');
const router = express.Router({ mergeParams: true });
const { singleUpload } = require('../middleware/upload');

// router.use(authenticateToken); 

// ────────────────────────────────────────────────
// Specific/static routes FIRST
// ────────────────────────────────────────────────

router.get('/me', ArtworkController.getMyArtworks);

// New public route for creator profile
router.get('/by-creator/:creatorId', ArtworkController.getArtworksByCreator);

// Category routes (specific patterns)
router.get('/:artworkId/categories', ArtworkCategoryController.getCategories);
router.post('/:artworkId/categories', hasPermission('artworks.update'), ArtworkCategoryController.addCategory);
router.delete('/:artworkId/categories/:categoryId', hasPermission('artworks.update'), ArtworkCategoryController.removeCategory);

// ────────────────────────────────────────────────
// Generic/dynamic routes LAST
// ────────────────────────────────────────────────

// List all published artworks (no param → public)
router.get('/', ArtworkController.getArtworks);

// Single artwork by ID (dynamic param)
router.get('/:id', ArtworkController.getArtwork);

// Authenticated actions on specific artwork
router.patch('/:id/publish', ArtworkController.publishArtwork);
router.delete('/:id', ArtworkController.deleteArtwork);

// Create new artwork
router.post('/', singleUpload('file'), ArtworkController.createArtwork);

module.exports = router;