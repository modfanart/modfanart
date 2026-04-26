const express = require('express');
const router = express.Router();

const brandController = require('../controller/brand.controller');
const {
  ensureBrandAccessMiddleware,
  ensureBrandOwnerMiddleware,
} = require('../middleware/brand.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

// ───────────────────────────────────────────────
// Public Routes (no authentication required)
// ───────────────────────────────────────────────
router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrand);
router.get('/slug/:slug', brandController.getBrandBySlug);

router.get('/:brandId/artworks', brandController.getAllBrandArtworks);
router.get('/:brandId/posts', brandController.getBrandPosts);
router.get('/:brandId/posts/:postId', brandController.getBrandPost);
router.get(
  '/:brandId/posts/:postId/comments',
  brandController.getBrandPostComments
);

router.post('/:id/view', brandController.incrementBrandView);
router.get(
  '/:brandId/managers',
  authenticateToken,
  ensureBrandAccessMiddleware(), // allows owner, manager, editor
  brandController.getBrandManagers
);

// Assign a new manager to the brand (owner or admin only)
router.post(
  '/:brandId/managers',
  authenticateToken,
  ensureBrandOwnerMiddleware(), // stricter: only owner or higher
  brandController.assignBrandManager
);
// ───────────────────────────────────────────────
// Authenticated Routes (login required)
// ───────────────────────────────────────────────

// Brand verification request
router.post(
  '/verification-requests',
  // authenticateToken, // optional
  brandController.submitBrandVerificationRequest
);

// Follow / unfollow
router.post('/:id/follow', authenticateToken, brandController.followBrand);
router.delete('/:id/follow', authenticateToken, brandController.unfollowBrand);
router.get(
  '/:id/is-following',
  authenticateToken,
  brandController.checkIfFollowing
);

// Likes & Comments
router.post(
  '/:brandId/posts/:postId/like',
  authenticateToken,
  brandController.likeBrandPost
);
router.delete(
  '/:brandId/posts/:postId/like',
  authenticateToken,
  brandController.unlikeBrandPost
);

router.post(
  '/:brandId/posts/:postId/comments',
  authenticateToken,
  brandController.createBrandPostComment
);

router.post(
  '/:brandId/posts/:postId/comments/:commentId/like',
  authenticateToken,
  brandController.likeBrandPostComment
);

// ───────────────────────────────────────────────
// Brand Management Routes (require brand-level access)
// ───────────────────────────────────────────────

// List brands user manages (any role + admins)
router.get('/my', authenticateToken, brandController.getMyBrands);

// Update brand (owner, manager, editor)
router.patch(
  '/:id',
  authenticateToken,
  ensureBrandAccessMiddleware(),
  brandController.updateBrand
);

// Delete brand (owner only)
router.delete(
  '/:id',
  authenticateToken,
  ensureBrandOwnerMiddleware(),
  brandController.deleteBrand
);

// Manage artworks (owner, manager, editor)
router.post(
  '/:brandId/artworks',
  authenticateToken,
  ensureBrandAccessMiddleware(),
  brandController.addArtworkToBrand
);
router.delete(
  '/:brandId/artworks/:artworkId',
  authenticateToken,
  ensureBrandAccessMiddleware(),
  brandController.removeArtworkFromBrand
);

// Create / update posts (owner, manager, editor)
router.post(
  '/:brandId/posts',
  authenticateToken,
  ensureBrandAccessMiddleware(),
  brandController.createBrandPost
);
router.patch(
  '/:brandId/posts/:postId',
  authenticateToken,
  ensureBrandAccessMiddleware(),
  brandController.updateBrandPost
);

// Delete / pin posts (owner, manager)
router.delete(
  '/:brandId/posts/:postId',
  authenticateToken,
  ensureBrandAccessMiddleware(['owner', 'manager']),
  brandController.deleteBrandPost
);
router.patch(
  '/:brandId/posts/:postId/pin',
  authenticateToken,
  ensureBrandAccessMiddleware(['owner', 'manager']),
  brandController.togglePinBrandPost
);

// Delete own comment (any authenticated user)
router.delete(
  '/:brandId/posts/:postId/comments/:commentId',
  authenticateToken,
  brandController.deleteBrandPostComment
);

// ───────────────────────────────────────────────
// Admin / Internal Team Only Routes
// ───────────────────────────────────────────────
router.get(
  '/verification-requests',
  authenticateToken,
  authorize(['admin', 'superadmin', 'moderator']),
  brandController.getBrandVerificationRequests
);

router.patch(
  '/verification-requests/:requestId/approve',
  authenticateToken,
  authorize(['admin', 'superadmin', 'moderator']),
  brandController.approveBrandVerificationRequest
);

// Optional reject route
// router.patch(
//   '/verification-requests/:requestId/reject',
//   authenticateToken,
//   authorize(['admin', 'superadmin', 'moderator']),
//   brandController.rejectBrandVerificationRequest
// );

// Direct brand creation (admin)
router.post('/', authenticateToken, brandController.adminCreateBrand);

// ───────────────────────────────────────────────
// Export
// ───────────────────────────────────────────────
module.exports = router;
