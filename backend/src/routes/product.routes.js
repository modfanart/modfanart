// backend/src/routes/product.routes.js
const express = require('express');
const router = express.Router();

const {
  createProductHandler,
  getProductByIdHandler,
  getProductsHandler,              // ← new main listing endpoint
  getProductsByCategoryHandler,    // legacy compatibility
  getProductsByArtistHandler,      // legacy
  getProductsByBrandHandler,       // legacy (updated param name)
  updateProductHandler,
  deleteProductHandler,
  getApprovedGalleryItems,
  getMarketplaceProducts,
  getStorefronts,
} = require('../controller/product.controller');

// ─────────────────────────────────────────────
//  Core Product CRUD & Main Listing
// ─────────────────────────────────────────────

// POST    /api/products
router.post('/', createProductHandler);

// GET     /api/products                ← recommended main endpoint
//         Supports ?category=... &artistId=... &brandId=... &status=... &search=...
//         &minPrice=... &maxPrice=... &isNew=true &sortBy=price &sortDir=asc &page=2 &limit=20
router.get('/', getProductsHandler);

// GET     /api/products/:id
router.get('/:id', getProductByIdHandler);

// PATCH   /api/products/:id
router.patch('/:id', updateProductHandler);

// DELETE  /api/products/:id
router.delete('/:id', deleteProductHandler);

// ─────────────────────────────────────────────
//  Legacy / Convenience Routes (keep for compatibility)
// ─────────────────────────────────────────────

// GET     /api/products/category/:category
router.get('/category/:category', getProductsByCategoryHandler);

// GET     /api/products/artist/:artistId
router.get('/artist/:artistId', getProductsByArtistHandler);

// GET     /api/products/brand/:brandId     ← fixed param name to :brandId
router.get('/brand/:brandId', getProductsByBrandHandler);

// ─────────────────────────────────────────────
//  Marketplace & Discovery Endpoints
// ─────────────────────────────────────────────

// GET     /api/products/gallery
router.get('/gallery', getApprovedGalleryItems);

// GET     /api/products/marketplace
//         Supports same query params as /products (category, artistId, brandId, etc.)
router.get('/marketplace', getMarketplaceProducts);

// GET     /api/products/storefronts?featured=true
router.get('/storefronts', getStorefronts);

module.exports = router;