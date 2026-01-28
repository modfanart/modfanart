// src/routes/brand.routes.js
const express = require('express');
const router = express.Router();

const {
  createBrand,
  getBrand,
  getBrandBySlug,
  getMyBrands,
  updateBrand,
  deleteBrand,
getAllBrands,
  addArtworkToBrand,
  getAllBrandArtworks,
  removeArtworkFromBrand,

  followBrand,
  unfollowBrand,
  getBrandFollowers,
  checkIfFollowing,

  createBrandPost,
  getBrandPosts,
  getBrandPost,
  updateBrandPost,
  deleteBrandPost,
  togglePinBrandPost,
  likeBrandPost,
  unlikeBrandPost,

  createBrandPostComment,
  getBrandPostComments,
  deleteBrandPostComment,
  likeBrandPostComment,

  incrementBrandView,
} = require('../controller/brand.controller');

// ───────────────────────────────────────────────
// Authentication middleware
// Sets req.user or throws 401 Unauthorized
// ───────────────────────────────────────────────

// Optional: rate limiting, validation, etc.
// const rateLimit = require('express-rate-limit');
// const validate = require('../middleware/validate'); // if you use Joi/Zod

// ───────────────────────────────────────────────
// Brand CRUD & Discovery
// ───────────────────────────────────────────────
// Public: Browse / discover all brands
router.get('/', getAllBrands);
// Create new brand (authenticated user becomes owner)
router.post('/', createBrand);

// List all brands owned by the current user
router.get('/my', getMyBrands);

// Get single brand by numeric ID (public + optional relations)
router.get('/:id', getBrand);

// Get single brand by slug (public – good for SEO / vanity URLs)
router.get('/slug/:slug', getBrandBySlug);

// Update brand (owner only)
router.patch('/:id', updateBrand);

// Soft-delete brand (owner only)
router.delete('/:id', deleteBrand);

// ───────────────────────────────────────────────
// Storefront – Brand Artworks
// ───────────────────────────────────────────────

// Add artwork to brand's storefront/collection
router.post('/:brandId/artworks', addArtworkToBrand);

// List artworks in brand's storefront (public, paginated, filters)
router.get('/:brandId/artworks', getAllBrandArtworks);

// Remove artwork from brand
router.delete('/:brandId/artworks/:artworkId', removeArtworkFromBrand);

// ───────────────────────────────────────────────
// Follow & Social Features
// ───────────────────────────────────────────────

// Follow a brand
router.post('/:id/follow', followBrand);

// Unfollow a brand
router.delete('/:id/follow', unfollowBrand);

// Check if current authenticated user follows this brand
router.get('/:id/is-following', checkIfFollowing);

// Get list of followers (public, paginated)
router.get('/:id/followers', getBrandFollowers);

// ───────────────────────────────────────────────
// Brand Posts (like social media feed/timeline)
// ───────────────────────────────────────────────

// Create new post for the brand (owner only)
router.post('/:brandId/posts', createBrandPost);

// List posts for a brand (public, pagination + draft filter)
router.get('/:brandId/posts', getBrandPosts);

// Get single brand post
router.get('/:brandId/posts/:postId', getBrandPost);

// Update post (owner only)
router.patch('/:brandId/posts/:postId', updateBrandPost);

// Soft-delete post (owner only)
router.delete('/:brandId/posts/:postId', deleteBrandPost);

// Pin / unpin post (owner only)
router.patch('/:brandId/posts/:postId/pin', togglePinBrandPost);

// Like a post
router.post('/:brandId/posts/:postId/like', likeBrandPost);

// Unlike a post
router.delete('/:brandId/posts/:postId/like', unlikeBrandPost);

// ───────────────────────────────────────────────
// Brand Post Comments
// ───────────────────────────────────────────────

// Add comment to a post (any logged-in user)
router.post('/:brandId/posts/:postId/comments', createBrandPostComment);

// Get comments for a post (public, paginated)
router.get('/:brandId/posts/:postId/comments', getBrandPostComments);

// Delete own comment (soft delete)
router.delete(
  '/:brandId/posts/:postId/comments/:commentId',

  deleteBrandPostComment
);

// Like a comment
router.post(
  '/:brandId/posts/:postId/comments/:commentId/like',

  likeBrandPostComment
);

// ───────────────────────────────────────────────
// Analytics / Views (usually called client-side)
// ───────────────────────────────────────────────

// Increment brand profile view count
router.post('/:id/view', incrementBrandView);

// ───────────────────────────────────────────────
// Export the router
// ───────────────────────────────────────────────
module.exports = router;