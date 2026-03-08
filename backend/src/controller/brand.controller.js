// src/controllers/brand.controller.js
const { db, sql } = require('../config');
const Brand = require('../models/brand.model');
const BrandPost = require('../models/brandPost.model');
const BrandPostComment = require('../models/brandPostComment.model');
const BrandVerificationRequest = require('../models/brandVerificationRequest.model');
const BrandManager = require('../models/brandManager.model');

// Assume these helpers exist
const { hasPermission } = require('../middleware/permission.middleware');

// ───────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────

async function ensureBrandAccess(req, allowedManagerRoles = ['owner', 'manager', 'editor']) {
  const brandId = req.params.brandId || req.params.id || req.params.brand_id;
  if (!brandId) {
    throw Object.assign(new Error('Brand ID not found in request'), { status: 400 });
  }

  const access = await BrandManager.hasAccess(brandId, req.user.id, allowedManagerRoles);

  if (!access) {
    throw Object.assign(new Error('You do not have permission to perform this action on this brand'), {
      status: 403,
    });
  }
}

async function ensureBrandOwner(req) {
  await ensureBrandAccess(req, ['owner']);
}

async function ensureBrandManagerOrHigher(req) {
  const allowedRoles = ['brand_manager', 'admin', 'superadmin', 'moderator'];
  if (!allowedRoles.includes(req.user.role_name)) {
    throw Object.assign(new Error('Insufficient global role'), { status: 403 });
  }
}

// ───────────────────────────────────────────────
// 1. Public / Discovery Endpoints
// ───────────────────────────────────────────────

async function getAllBrands(req, res) {
  try {
    const {
      limit = 20,
      offset = 0,
      search,
      status = 'active',
      sortBy = 'followers_count',
      sortOrder = 'desc',
      minFollowers,
    } = req.query;

    let query = db
      .selectFrom('brands')
      .select([
        'id', 'name', 'slug', 'description', 'logo_url', 'banner_url',
        'followers_count', 'created_at', 'updated_at', 'status'
      ])
      .where('deleted_at', 'is', null);

    if (status) query = query.where('status', '=', status);

    if (search) {
      const term = `%${search.trim()}%`;
      query = query.where((eb) =>
        eb.or([
          eb('name', 'ilike', term),
          eb('slug', 'ilike', term),
        ])
      );
    }

    if (minFollowers && !isNaN(Number(minFollowers))) {
      query = query.where('followers_count', '>=', Number(minFollowers));
    }

    const validSortFields = ['followers_count', 'created_at', 'name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'followers_count';
    const direction = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    query = query.orderBy(sortField, direction)
      .limit(Number(limit))
      .offset(Number(offset));

    const brands = await query.execute();

    // Total count for pagination
    let totalQuery = db
      .selectFrom('brands')
      .select(({ fn }) => fn.countAll().as('total'))
      .where('deleted_at', 'is', null);

    if (status) totalQuery = totalQuery.where('status', '=', status);
    if (search) {
      const term = `%${search.trim()}%`;
      totalQuery = totalQuery.where((eb) =>
        eb.or([
          eb('name', 'ilike', term),
          eb('slug', 'ilike', term),
        ])
      );
    }
    if (minFollowers && !isNaN(Number(minFollowers))) {
      totalQuery = totalQuery.where('followers_count', '>=', Number(minFollowers));
    }

    const [{ total }] = await totalQuery.execute();

    return res.json({
      brands,
      pagination: {
        total: Number(total),
        limit: Number(limit),
        offset: Number(offset),
        hasMore: brands.length === Number(limit),
      },
    });
  } catch (err) {
    console.error('getAllBrands error:', err);
    return res.status(500).json({ error: 'Failed to fetch brands' });
  }
}

async function getBrand(req, res) {
  try {
    const brand = await Brand.findById(req.params.id, {
      withArtworks: true,
      withPosts: req.query.withPosts === 'true',
      includeDeleted: false,
    });

    if (!brand) return res.status(404).json({ error: 'Brand not found' });

    return res.json(brand);
  } catch (err) {
    console.error('getBrand error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getBrandBySlug(req, res) {
  try {
    const brand = await Brand.findBySlug(req.params.slug, {
      withArtworks: true,
      withPosts: req.query.withPosts === 'true',
    });

    if (!brand) return res.status(404).json({ error: 'Brand not found' });

    return res.json(brand);
  } catch (err) {
    console.error('getBrandBySlug error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ───────────────────────────────────────────────
// 2. Brand Verification & Onboarding
// ───────────────────────────────────────────────

async function submitBrandVerificationRequest(req, res) {
  try {
    const {
      company_name,
      website,
      contact_email,
      contact_phone,
      description,
      documents = [],
    } = req.body;

    if (!company_name || !contact_email) {
      return res.status(400).json({ error: 'company_name and contact_email are required' });
    }

    const requestData = {
      user_id: req.user?.id || null,
      company_name,
      website: website || null,
      contact_email,
      contact_phone: contact_phone || null,
      description: description || null,
      documents,
      status: 'pending',
    };

    const request = await BrandVerificationRequest.create(requestData);

    sendInternalNotification('new_brand_verification', {
      requestId: request.id,
      company: company_name,
      email: contact_email,
    }).catch(console.error);

    return res.status(201).json({
      message: 'Verification request received. Our team will review and get back to you.',
      requestId: request.id,
    });
  } catch (err) {
    console.error('submitBrandVerificationRequest error:', err);
    return res.status(400).json({ error: err.message || 'Failed to submit request' });
  }
}

async function getBrandVerificationRequests(req, res) {
  try {
    // Protected by middleware: admin/moderator only
    const { status, limit = 20, offset = 0 } = req.query;

    let query = db
      .selectFrom('brand_verification_requests')
      .selectAll()
      .orderBy('created_at', 'desc')
      .limit(Number(limit))
      .offset(Number(offset));

    if (status) query = query.where('status', '=', status);

    const requests = await query.execute();

    return res.json(requests);
  } catch (err) {
    console.error('getBrandVerificationRequests error:', err);
    return res.status(500).json({ error: 'Failed to fetch verification requests' });
  }
}

async function approveBrandVerificationRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { manager_username, manager_email, temp_password, notes } = req.body;

    const request = await BrandVerificationRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Request already ${request.status}` });
    }

    // 1. Create brand manager user account
    const manager = await User.create({
      username: manager_username || generateBrandManagerUsername(request.company_name),
      email: manager_email || request.contact_email,
      password_hash: await hashPassword(temp_password || generateTempPassword()),
      role_id: await getRoleIdByName('brand_manager'),
      profile: { company_name: request.company_name },
      status: 'pending_verification',
    });

    // 2. Create the brand
    const brand = await Brand.create({
      user_id: manager.id, // legacy field – keep for backward compatibility if needed
      name: request.company_name,
      slug: await generateUniqueSlug(request.company_name),
      description: request.description,
      website: request.website,
      status: 'active',
      verification_request_id: request.id,
    });

    // 3. Create brand manager relation (owner)
    await BrandManager.create({
      brand_id: brand.id,
      user_id: manager.id,
      role: 'owner',
    });

    // 4. Mark request approved
    await BrandVerificationRequest.update(requestId, {
      status: 'approved',
      reviewed_by: req.user.id,
      reviewed_at: new Date().toISOString(),
      notes: notes ? `${request.notes || ''}\n${notes}` : request.notes,
    });

    // 5. Notify
    sendBrandOnboardingEmail({
      to: request.contact_email,
      brandName: brand.name,
      managerEmail: manager.email,
      resetLink: generatePasswordResetLink(manager.id),
    }).catch(console.error);

    return res.json({
      success: true,
      brandId: brand.id,
      managerUserId: manager.id,
      message: 'Brand and manager account created successfully',
    });
  } catch (err) {
    console.error('approveBrandVerificationRequest error:', err);
    return res.status(400).json({ error: err.message || 'Approval failed' });
  }
}

// ───────────────────────────────────────────────
// 3. Brand Management
// ───────────────────────────────────────────────

async function getMyBrands(req, res) {
  try {
    const managed = await BrandManager.findByUser(req.user.id);

    if (managed.length === 0) {
      return res.json([]);
    }

    const brandIds = managed.map((m) => m.brand_id);

    const brands = await db
      .selectFrom('brands')
      .selectAll()
      .where('id', 'in', brandIds)
      .where('deleted_at', 'is', null)
      .orderBy('created_at', 'desc')
      .execute();

    const brandsWithRole = brands.map((brand) => {
      const relation = managed.find((m) => m.brand_id === brand.id);
      return {
        ...brand,
        my_role: relation?.role || null,
      };
    });

    return res.json(brandsWithRole);
  } catch (err) {
    console.error('getMyBrands error:', err);
    return res.status(500).json({ error: 'Failed to fetch your brands' });
  }
}

async function updateBrand(req, res) {
  try {

    const updated = await Brand.update(req.params.id, req.body, req.user.id);
    if (!updated) return res.status(404).json({ error: 'Brand not found' });

    return res.json(updated);
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json({ error: err.message || 'Failed to update brand' });
  }
}

async function deleteBrand(req, res) {
  try {
    await ensureBrandOwner(req); // only owner can delete

    await Brand.softDelete(req.params.id, req.user.id);
    return res.status(204).send();
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json({ error: err.message || 'Failed to delete brand' });
  }
}

// ───────────────────────────────────────────────
// 4. Artworks (Storefront)
// ───────────────────────────────────────────────

async function addArtworkToBrand(req, res) {
  try {
    await ensureBrandAccess(req); // owner, manager, editor

    const { artworkId, is_featured = false, sort_order = 0 } = req.body;

    const relation = await Brand.addArtwork(req.params.brandId, artworkId, {
      is_featured: !!is_featured,
      sort_order: Number(sort_order),
    }, req.user.id);

    return res.status(201).json(relation);
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to add artwork' });
  }
}

async function getAllBrandArtworks(req, res) {
  try {
    const { brandId } = req.params;
    const { featuredOnly = false, limit = 50, offset = 0 } = req.query;

    let query = db
      .selectFrom('brand_artworks')
      .innerJoin('artworks', 'artworks.id', 'brand_artworks.artwork_id')
      .select([
        'artworks.id', 'artworks.title', 'artworks.slug', 'artworks.description',
        'artworks.preview_url', 'artworks.status',
        'brand_artworks.is_featured', 'brand_artworks.sort_order', 'brand_artworks.added_at',
      ])
      .where('brand_artworks.brand_id', '=', brandId)
      .orderBy('brand_artworks.sort_order', 'asc')
      .limit(Number(limit))
      .offset(Number(offset));

    if (featuredOnly === 'true' || featuredOnly === true) {
      query = query.where('brand_artworks.is_featured', '=', true);
    }

    const artworks = await query.execute();
    return res.json(artworks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch brand artworks' });
  }
}

async function removeArtworkFromBrand(req, res) {
  try {
    await ensureBrandAccess(req); // owner, manager, editor

    await Brand.removeArtwork(req.params.brandId, req.params.artworkId, req.user.id);
    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to remove artwork' });
  }
}

// ───────────────────────────────────────────────
// 5. Social / Follow
// ───────────────────────────────────────────────

async function followBrand(req, res) {
  try {
    await Brand.toggleFollow(req.params.id, req.user.id, true);
    return res.json({ success: true, action: 'followed' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function unfollowBrand(req, res) {
  try {
    await Brand.toggleFollow(req.params.id, req.user.id, false);
    return res.json({ success: true, action: 'unfollowed' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getBrandFollowers(req, res) {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const followers = await db
      .selectFrom('brand_followers')
      .innerJoin('users', 'users.id', 'brand_followers.user_id')
      .select([
        'users.id', 'users.username', 'users.display_name', 'users.avatar_url',
        'brand_followers.followed_at',
      ])
      .where('brand_followers.brand_id', '=', id)
      .orderBy('brand_followers.followed_at', 'desc')
      .limit(Number(limit))
      .offset(Number(offset))
      .execute();

    return res.json(followers);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch followers' });
  }
}

async function checkIfFollowing(req, res) {
  try {
    const exists = await db
      .selectFrom('brand_followers')
      .select('brand_id')
      .where('brand_id', '=', req.params.id)
      .where('user_id', '=', req.user.id)
      .executeTakeFirst();

    return res.json({ isFollowing: !!exists });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

// ───────────────────────────────────────────────
// 6. Brand Posts
// ───────────────────────────────────────────────

async function createBrandPost(req, res) {
  try {
    await ensureBrandAccess(req, ['owner', 'manager', 'editor']);

    const post = await BrandPost.create(req.params.brandId, req.body, req.user.id);
    return res.status(201).json(post);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getBrandPosts(req, res) {
  try {
    const posts = await BrandPost.findByBrand(req.params.brandId, {
      limit: Number(req.query.limit) || 12,
      offset: Number(req.query.offset) || 0,
      onlyPublished: req.query.drafts !== 'true',
    });
    return res.json(posts);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

async function getBrandPost(req, res) {
  try {
    const post = await BrandPost.findById(req.params.postId, { brandId: req.params.brandId });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    return res.json(post);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateBrandPost(req, res) {
  try {
    await ensureBrandAccess(req, ['owner', 'manager', 'editor']);

    const updated = await BrandPost.update(
      req.params.postId,
      req.params.brandId,
      req.body,
      req.user.id
    );
    if (!updated) return res.status(404).json({ error: 'Post not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function deleteBrandPost(req, res) {
  try {
    await ensureBrandAccess(req, ['owner', 'manager']); // editors cannot delete

    await BrandPost.softDelete(req.params.postId, req.params.brandId);
    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function togglePinBrandPost(req, res) {
  try {
    await ensureBrandAccess(req, ['owner', 'manager']);

    await BrandPost.togglePin(
      req.params.postId,
      req.params.brandId,
      req.body.pin !== false
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function likeBrandPost(req, res) {
  try {
    await BrandPost.incrementLike(req.params.postId);
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function unlikeBrandPost(req, res) {
  try {
    await BrandPost.decrementLike(req.params.postId);
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ───────────────────────────────────────────────
// 7. Brand Post Comments
// ───────────────────────────────────────────────

async function createBrandPostComment(req, res) {
  try {
    const comment = await BrandPostComment.create(
      req.params.postId,
      req.user.id,
      req.body
    );
    return res.status(201).json(comment);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getBrandPostComments(req, res) {
  try {
    const comments = await BrandPostComment.findByPost(req.params.postId, {
      limit: Number(req.query.limit) || 20,
      offset: Number(req.query.offset) || 0,
    });
    return res.json(comments);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

async function deleteBrandPostComment(req, res) {
  try {
    const deleted = await BrandPostComment.softDelete(req.params.commentId, req.user.id);
    if (!deleted) return res.status(403).json({ error: 'Not found or not authorized' });
    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function likeBrandPostComment(req, res) {
  try {
    await BrandPostComment.incrementLike(req.params.commentId);
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ───────────────────────────────────────────────
// 8. Views
// ───────────────────────────────────────────────

async function incrementBrandView(req, res) {
  try {
    await db
      .updateTable('brands')
      .set({
        views_count: sql`views_count + 1`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', req.params.id)
      .where('deleted_at', 'is', null)
      .execute();

    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to increment view' });
  }
}

// ───────────────────────────────────────────────
// 9. Admin Direct Creation
// ───────────────────────────────────────────────

async function adminCreateBrand(req, res) {
  try {
    // Protected by middleware: admin/superadmin only
    const { ownerUserId, ...brandData } = req.body;

    if (!ownerUserId) {
      return res.status(400).json({ error: 'ownerUserId (brand manager user) required' });
    }

    const brand = await Brand.create({
      ...brandData,
      user_id: ownerUserId,
      status: brandData.status || 'active',
    });

    // Create manager relation
    await BrandManager.create({
      brand_id: brand.id,
      user_id: ownerUserId,
      role: 'owner',
    });

    return res.status(201).json(brand);
  } catch (err) {
    console.error('adminCreateBrand error:', err);
    return res.status(400).json({ error: err.message || 'Failed to create brand' });
  }
}

// ───────────────────────────────────────────────
// Exports
// ───────────────────────────────────────────────
module.exports = {
  getAllBrands,
  getBrand,
  getBrandBySlug,

  submitBrandVerificationRequest,
  getBrandVerificationRequests,
  approveBrandVerificationRequest,

  getMyBrands,
  updateBrand,
  deleteBrand,

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

  adminCreateBrand,

  // Helpers (useful for tests or other controllers)
  ensureBrandAccess,
  ensureBrandOwner,
  ensureBrandManagerOrHigher,
};