const express = require('express');
const ArtworkCategoryController = require('../controller/artworkCategory.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');
const ArtworkController = require('../controller/artwork.controller');
const router = express.Router({ mergeParams: true }); // to get :artworkId from parent
const {singleUpload} = require('../middleware/upload'); // your multer middleware
// router.use(authenticateToken);
router.get('/', ArtworkController.getArtworks);
router.get('/:id', ArtworkController.getArtwork);
// Authenticated
router.post('/',  singleUpload('file'),  ArtworkController.createArtwork);
router.get('/me',  ArtworkController.getMyArtworks);
router.patch('/:id/publish',  ArtworkController.publishArtwork);
router.delete('/:id',  ArtworkController.deleteArtwork);
router.post('/:artworkId/categories', hasPermission('artworks.update'), ArtworkCategoryController.addCategory);
router.delete('/:artworkId/categories/:categoryId', hasPermission('artworks.update'), ArtworkCategoryController.removeCategory);
router.get('/:artworkId/categories', ArtworkCategoryController.getCategories); // public ok

module.exports = router;