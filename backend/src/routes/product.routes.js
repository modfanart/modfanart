// backend/src/routes/product.routes.js
const express = require('express');
const router = express.Router();
const {
  createProductHandler,
  getProductByIdHandler,
  getProductsByCategoryHandler,
  getProductsByArtistHandler,
  getProductsByBrandHandler,
  getAllActiveProductsHandler,
  updateProductHandler,
  deleteProductHandler,
} = require('../controllers/product.controller');

// POST /api/products
router.post('/', createProductHandler);

// GET /api/products/:id
router.get('/:id', getProductByIdHandler);

// GET /api/products/category/:category
router.get('/category/:category', getProductsByCategoryHandler);

// GET /api/products/artist/:artistId
router.get('/artist/:artistId', getProductsByArtistHandler);

// GET /api/products/brand/:brand
router.get('/brand/:brand', getProductsByBrandHandler);

// GET /api/products/active
router.get('/active', getAllActiveProductsHandler);

// PATCH /api/products/:id
router.patch('/:id', updateProductHandler);

// DELETE /api/products/:id
router.delete('/:id', deleteProductHandler);
router.get('/gallery', getApprovedGalleryItems);
router.get('/marketplace', getMarketplaceProducts);
router.get('/storefronts', getStorefronts);
module.exports = router;