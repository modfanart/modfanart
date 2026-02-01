// src/routes/brand.routes.js
const express = require('express');
const router = express.Router();

const brandController = require('../controller/brand.controller');

// ───────────────────────────────────────────────
// Middleware Imports
// ───────────────────────────────────────────────
const { authenticateToken } = require('../middleware/auth.middleware');  // sets req.user or 401
const { authorize } = require('../middleware/auth.middleware');          // role_id based
const { hasPermission } = require('../middleware/permission.middleware'); // granular "resource.action"
const { ensureBrandOwnership } = require('../controller/brand.controller'); // assume you create this

// Optional: rate limiting on mutation endpoints
// const rateLimit = require('express-rate-limit');
// const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

// ───────────────────────────────────────────────
// Public Routes (no authentication required)
// ───────────────────────────────────────────────

// Discover brands (search, filter, paginate)
router.get('/', brandController.getAllBrands);

// Get brand by ID
router.get('/:id', brandController.getBrand);

// Get brand by slug (SEO friendly)
router.get('/slug/:slug', brandController.getBrandBySlug);

// View brand storefront artworks
router.get('/:brandId/artworks', brandController.getAllBrandArtworks);

// View brand posts feed
router.get('/:brandId/posts', brandController.getBrandPosts);

// View single post
router.get('/:brandId/posts/:postId', brandController.getBrandPost);

// View post comments
router.get('/:brandId/posts/:postId/comments', brandController.getBrandPostComments);

// Record view (usually called from client – no auth)
router.post('/:id/view', brandController.incrementBrandView);

// ───────────────────────────────────────────────
// Authenticated Routes (login required)
// ───────────────────────────────────────────────

// Submit brand verification/onboarding request
// (main entry for flow 1 & 3 – can be anonymous or logged-in)
router.post(
  '/verification-requests',
  // authenticateToken,   ← uncomment if you want only logged-in users to submit
  brandController.submitBrandVerificationRequest
);

// Follow / unfollow brand
router.post('/:id/follow', authenticateToken, brandController.followBrand);
router.delete('/:id/follow', authenticateToken, brandController.unfollowBrand);

// Check follow status
router.get('/:id/is-following', authenticateToken, brandController.checkIfFollowing);

// Like / unlike post
router.post('/:brandId/posts/:postId/like', authenticateToken, brandController.likeBrandPost);
router.delete('/:brandId/posts/:postId/like', authenticateToken, brandController.unlikeBrandPost);

// Comment on post
router.post('/:brandId/posts/:postId/comments', authenticateToken, brandController.createBrandPostComment);

// Like comment
router.post(
  '/:brandId/posts/:postId/comments/:commentId/like',
  authenticateToken,
  brandController.likeBrandPostComment
);

// ───────────────────────────────────────────────
// Brand Manager + Admin Routes
// ───────────────────────────────────────────────

// List my managed brands
router.get(
  '/my',
  authenticateToken,
  authorize(['brand_manager', 'admin', 'superadmin', 'moderator']), // role_ids or names – adjust as needed
  brandController.getMyBrands
);

// Update brand
router.patch(
  '/:id',
  authenticateToken,
  ensureBrandOwnership,
  authorize(['brand_manager', 'admin', 'superadmin', 'moderator']),
  hasPermission('brands.update'),
  brandController.updateBrand
);

// Delete brand (soft)
router.delete(
  '/:id',
  authenticateToken,
  ensureBrandOwnership,
  authorize(['brand_manager', 'admin', 'superadmin', 'moderator']),
  hasPermission('brands.delete'),
  brandController.deleteBrand
);

// Manage storefront artworks
router.post(
  '/:brandId/artworks',
  authenticateToken,
  ensureBrandOwnership,
  authorize(['brand_manager', 'admin', 'superadmin', 'moderator']),
  hasPermission('brands.artworks.manage'),
  brandController.addArtworkToBrand
);

router.delete(
  '/:brandId/artworks/:artworkId',
  authenticateToken,
  ensureBrandOwnership,
  authorize(['brand_manager', 'admin', 'superadmin', 'moderator']),
  hasPermission('brands.artworks.manage'),
  brandController.removeArtworkFromBrand
);

// Manage brand posts
router.post(
  '/:brandId/posts',
  authenticateToken,
  ensureBrandOwnership,
  authorize(['brand_manager', 'admin', 'superadmin', 'moderator']),
  hasPermission('brands.posts.create'),
  brandController.createBrandPost
);

router.patch(
  '/:brandId/posts/:postId',
  authenticateToken,
  ensureBrandOwnership,
  authorize(['brand_manager', 'admin', 'superadmin', 'moderator']),
  hasPermission('brands.posts.update'),
  brandController.updateBrandPost
);

router.delete(
  '/:brandId/posts/:postId',
  authenticateToken,
  ensureBrandOwnership,
  authorize(['brand_manager', 'admin', 'superadmin', 'moderator']),
  hasPermission('brands.posts.delete'),
  brandController.deleteBrandPost
);

router.patch(
  '/:brandId/posts/:postId/pin',
  authenticateToken,
  ensureBrandOwnership,
  authorize(['brand_manager', 'admin', 'superadmin', 'moderator']),
  hasPermission('brands.posts.pin'),
  brandController.togglePinBrandPost
);

// Delete own comment (any authenticated user)
router.delete(
  '/:brandId/posts/:postId/comments/:commentId',
  authenticateToken,
  brandController.deleteBrandPostComment
);

// ───────────────────────────────────────────────
// Internal Team / Admin Only Routes
// ───────────────────────────────────────────────

// List all verification requests (review dashboard)
router.get(
  '/verification-requests',
  authenticateToken,
  authorize(['admin', 'superadmin', 'moderator']),
  hasPermission('brands.verification.review'),
  brandController.getBrandVerificationRequests
);

// Approve verification request → create brand + brand_manager user
router.patch(
  '/verification-requests/:requestId/approve',
  authenticateToken,
  authorize(['admin', 'superadmin', 'moderator']),
  hasPermission('brands.verification.approve'),
  brandController.approveBrandVerificationRequest
);

// Optional: reject request
// router.patch(
//   '/verification-requests/:requestId/reject',
//   authenticateToken,
//   authorize(['admin', 'superadmin', 'moderator']),
//   hasPermission('brands.verification.reject'),
//   brandController.rejectBrandVerificationRequest
// );

// Direct brand creation (bypass verification – internal use only)
router.post(
  '/',
  authenticateToken,
  authorize(['admin', 'superadmin']),
  hasPermission('brands.create'),
  brandController.adminCreateBrand
);

// ───────────────────────────────────────────────
// Export
// ───────────────────────────────────────────────
module.exports = router;