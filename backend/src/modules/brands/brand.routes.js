const express = require("express");
const router = express.Router();

const brandController = require("./controller/brand.controller");

const {
  ensureBrandAccessMiddleware,
  ensureBrandOwnerMiddleware,
} = require("../../common/middleware/brand.middleware");

const {
  authenticateToken,
  authorize,
} = require("../../common/middleware/auth.middleware");

// ───────────────────────────────────────────────
// PUBLIC / STATIC ROUTES (MUST COME FIRST)
// ───────────────────────────────────────────────

router.get("/", brandController.getAllBrands);

router.get("/my", authenticateToken, brandController.getMyBrands);

router.get("/slug/:slug", brandController.getBrandBySlug);

// verification requests (brand-side)
router.post(
  "/verification-requests",
  brandController.submitBrandVerificationRequest
);

// admin / internal verification routes
router.get(
  "/verification-requests",
  authenticateToken,
  authorize(['BRAND_MANAGER', "ADMIN", "SUPER_ADMIN", "DEVELOPER" ]),
  brandController.getBrandVerificationRequests
);

router.patch(
  "/verification-requests/:requestId/approve",
  authenticateToken,
  authorize(['BRAND_MANAGER', "ADMIN", "SUPER_ADMIN", "DEVELOPER" ]),
  brandController.approveBrandVerificationRequest
);

// ───────────────────────────────────────────────
// IMPORTANT: PARAM ROUTES (KEEP BELOW STATIC ROUTES)
// ───────────────────────────────────────────────

router.get("/:id", brandController.getBrand);

router.post("/:id/view", brandController.incrementBrandView);

router.post("/:id/follow", authenticateToken, brandController.followBrand);

router.delete("/:id/follow", authenticateToken, brandController.unfollowBrand);

router.get(
  "/:id/is-following",
  authenticateToken,
  brandController.checkIfFollowing
);

// ───────────────────────────────────────────────
// BRAND CONTENT
// ───────────────────────────────────────────────

router.get("/:brandId/artworks", brandController.getAllBrandArtworks);

router.post(
  "/:brandId/artworks",
  authenticateToken,
  ensureBrandAccessMiddleware(),
  brandController.addArtworkToBrand
);

router.delete(
  "/:brandId/artworks/:artworkId",
  authenticateToken,
  ensureBrandAccessMiddleware(),
  brandController.removeArtworkFromBrand
);

// ───────────────────────────────────────────────
// POSTS
// ───────────────────────────────────────────────

router.get("/:brandId/posts", brandController.getBrandPosts);

router.get("/:brandId/posts/:postId", brandController.getBrandPost);

router.post(
  "/:brandId/posts",
  authenticateToken,
  ensureBrandAccessMiddleware(),
  brandController.createBrandPost
);

router.patch(
  "/:brandId/posts/:postId",
  authenticateToken,
  ensureBrandAccessMiddleware(),
  brandController.updateBrandPost
);

router.delete(
  "/:brandId/posts/:postId",
  authenticateToken,
  ensureBrandAccessMiddleware(['BRAND_MANAGER', "ADMIN", "SUPER_ADMIN", "DEVELOPER" ]),
  brandController.deleteBrandPost
);

router.patch(
  "/:brandId/posts/:postId/pin",
  authenticateToken,
  ensureBrandAccessMiddleware(['BRAND_MANAGER', "ADMIN", "SUPER_ADMIN", "DEVELOPER" ]),
  brandController.togglePinBrandPost
);

// likes
router.post(
  "/:brandId/posts/:postId/like",
  authenticateToken,
  brandController.likeBrandPost
);

router.delete(
  "/:brandId/posts/:postId/like",
  authenticateToken,
  brandController.unlikeBrandPost
);

// comments
router.get(
  "/:brandId/posts/:postId/comments",
  brandController.getBrandPostComments
);

router.post(
  "/:brandId/posts/:postId/comments",
  authenticateToken,
  brandController.createBrandPostComment
);

router.post(
  "/:brandId/posts/:postId/comments/:commentId/like",
  authenticateToken,
  brandController.likeBrandPostComment
);

router.delete(
  "/:brandId/posts/:postId/comments/:commentId",
  authenticateToken,
  brandController.deleteBrandPostComment
);

// ───────────────────────────────────────────────
// BRAND MANAGEMENT
// ───────────────────────────────────────────────

router.get(
  "/:brandId/managers",
  authenticateToken,
  ensureBrandAccessMiddleware(),
  brandController.getBrandManagers
);

router.post(
  "/:brandId/managers",
  authenticateToken,
  ensureBrandOwnerMiddleware(),
  brandController.assignBrandManager
);

// update brand
router.patch(
  "/:id",
  authenticateToken,
  ensureBrandAccessMiddleware(),
  brandController.updateBrand
);

// delete brand
router.delete(
  "/:id",
  authenticateToken,
  ensureBrandOwnerMiddleware(),
  brandController.deleteBrand
);

// ───────────────────────────────────────────────
// ADMIN CREATION
// ───────────────────────────────────────────────

router.post("/", authenticateToken, brandController.adminCreateBrand);

// ───────────────────────────────────────────────
// EXPORT
// ───────────────────────────────────────────────

module.exports = router;