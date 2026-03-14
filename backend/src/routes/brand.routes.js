// src/routes/brand.routes.js
const express = require('express');
const router = express.Router();

const brandController = require('../controller/brand.controller');
const { ensureBrandAccess, ensureBrandOwner } = require('../middleware/brand.middleware');
// ───────────────────────────────────────────────
// Middleware Imports
// ───────────────────────────────────────────────
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');           // global role check
const { hasPermission } = require('../middleware/permission.middleware'); // optional granular

// ───────────────────────────────────────────────
// Public Routes (no authentication required)
// ───────────────────────────────────────────────

router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrand);
router.get('/slug/:slug', brandController.getBrandBySlug);

router.get('/:brandId/artworks', brandController.getAllBrandArtworks);
router.get('/:brandId/posts', brandController.getBrandPosts);
router.get('/:brandId/posts/:postId', brandController.getBrandPost);
router.get('/:brandId/posts/:postId/comments', brandController.getBrandPostComments);

router.post('/:id/view', brandController.incrementBrandView);

// ───────────────────────────────────────────────
// Authenticated Routes (login required)
// ───────────────────────────────────────────────

// Submit verification request (can be open to guests or require login)
router.post(
  '/verification-requests',
  // authenticateToken,   // ← uncomment if you want only logged-in users
  brandController.submitBrandVerificationRequest
);

// Social / Follow
router.post('/:id/follow', authenticateToken, brandController.followBrand);
router.delete('/:id/follow', authenticateToken, brandController.unfollowBrand);
router.get('/:id/is-following', authenticateToken, brandController.checkIfFollowing);

// Likes & Comments (any authenticated user)
router.post('/:brandId/posts/:postId/like', authenticateToken, brandController.likeBrandPost);
router.delete('/:brandId/posts/:postId/like', authenticateToken, brandController.unlikeBrandPost);

router.post('/:brandId/posts/:postId/comments', authenticateToken, brandController.createBrandPostComment);

router.post(
  '/:brandId/posts/:postId/comments/:commentId/like',
  authenticateToken,
  brandController.likeBrandPostComment
);

// ───────────────────────────────────────────────
// Brand Management Routes (require brand-level access)
// ───────────────────────────────────────────────

// List brands I manage (any role: owner/manager/editor + admins)
router.get(
  '/my',
  authenticateToken,
  brandController.getMyBrands
);

// Update brand (owner, manager, editor)
router.patch(
  '/:id',
  authenticateToken,
  ensureBrandAccess(),           // ← new: checks brand_managers table
  // authorize(['brand_manager', 'admin', 'superadmin', 'moderator']), // optional global bypass
  // hasPermission('brands.update'),           // optional if using granular perms
  brandController.updateBrand
);

// Delete brand (only owner)
router.delete(
  '/:id',
  authenticateToken,
  brandController.ensureBrandOwner,             // ← stricter: owner only
  // authorize(['brand_manager', 'admin', 'superadmin', 'moderator']),
  // hasPermission('brands.delete'),
  brandController.deleteBrand
);

// Manage storefront artworks (owner, manager, editor)
router.post(
  '/:brandId/artworks',
  authenticateToken,
  ensureBrandAccess(),
  // hasPermission('brands.artworks.manage'),
  brandController.addArtworkToBrand
);

router.delete(
  '/:brandId/artworks/:artworkId',
  authenticateToken,
  ensureBrandAccess(),
  // hasPermission('brands.artworks.manage'),
  brandController.removeArtworkFromBrand
);

// Create / update post (owner, manager, editor)
router.post(
  '/:brandId/posts',
  authenticateToken,
  ensureBrandAccess(),           // allows editor too
  // hasPermission('brands.posts.create'),
  brandController.createBrandPost
);

router.patch(
  '/:brandId/posts/:postId',
  authenticateToken,
  ensureBrandAccess(),
  // hasPermission('brands.posts.update'),
  brandController.updateBrandPost
);

// Delete / pin post (owner, manager only – editors usually cannot delete/pin)
router.delete(
  '/:brandId/posts/:postId',
  authenticateToken,
  ensureBrandAccess(['owner', 'manager']),
  // hasPermission('brands.posts.delete'),
  brandController.deleteBrandPost
);

router.patch(
  '/:brandId/posts/:postId/pin',
  authenticateToken,
  ensureBrandAccess(['owner', 'manager']),
  // hasPermission('brands.posts.pin'),
  brandController.togglePinBrandPost
);

// Delete own comment (any authenticated user – no brand check needed)
router.delete(
  '/:brandId/posts/:postId/comments/:commentId',
  authenticateToken,
  brandController.deleteBrandPostComment
);

// ───────────────────────────────────────────────
// Admin / Internal Team Only Routes
// ───────────────────────────────────────────────

// Review verification requests
router.get(
  '/verification-requests',
  authenticateToken,
  authorize(['admin', 'superadmin', 'moderator']),
  // hasPermission('brands.verification.review'),
  brandController.getBrandVerificationRequests
);

// Approve request → creates brand + owner relation
router.patch(
  '/verification-requests/:requestId/approve',
  authenticateToken,
  authorize(['admin', 'superadmin', 'moderator']),
  // hasPermission('brands.verification.approve'),
  brandController.approveBrandVerificationRequest
);

// Optional: reject (implement controller method if needed)
// router.patch(
//   '/verification-requests/:requestId/reject',
//   authenticateToken,
//   authorize(['admin', 'superadmin', 'moderator']),
//   hasPermission('brands.verification.reject'),
//   brandController.rejectBrandVerificationRequest // ← add to controller if needed
// );

// Direct brand creation (bypass verification flow)
router.post(
  '/',
  authenticateToken,
  // hasPermission('brands.create'),
  brandController.adminCreateBrand
);

// ───────────────────────────────────────────────
// Export
// ───────────────────────────────────────────────
module.exports = router;