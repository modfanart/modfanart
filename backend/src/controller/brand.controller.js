// src/controllers/brand.controller.js
const Brand = require('../models/brand.model');
const BrandPost = require('../models/brandPost.model');
const BrandPostComment = require('../models/brandPostComment.model');

const { db } = require('../config');
const { sql } = require('kysely');

// ───────────────────────────────────────────────
// Helper
// ───────────────────────────────────────────────
async function ensureBrandOwnership(brandId, userId) {
  const brand = await Brand.findById(brandId, { onlyOwner: true, ownerId: userId });
  if (!brand) {
    throw new Error('Brand not found or you do not have permission');
  }
  return brand;
}

// ───────────────────────────────────────────────
// Brand Core
// ───────────────────────────────────────────────
// ───────────────────────────────────────────────
// Public: List all brands (discovery / search / browse)
// ───────────────────────────────────────────────

async function getAllBrands(req, res) {
  try {
    const {
      limit = 20,
      offset = 0,
      search,           // optional: search by name or slug
      status = 'active', // default to active brands
      sortBy = 'followers_count', // or 'created_at', 'name'
      sortOrder = 'desc',
      minFollowers,     // optional filter
    } = req.query;

    let query = db
      .selectFrom('brands')
      .select([
        'id',
        'name',
        'slug',
        'description',
        'logo_url',
        'banner_url',
        'followers_count',
        'created_at',
        'updated_at',
      ])
      .where('deleted_at', 'is', null);

    // Filter by status (e.g. only 'active')
    if (status) {
      query = query.where('status', '=', status);
    }

    // Optional text search on name or slug
    if (search) {
      const searchTerm = `%${search.trim()}%`;
      query = query.where((eb) =>
        eb.or([
          eb('name', 'ilike', searchTerm),
          eb('slug', 'ilike', searchTerm),
        ])
      );
    }

    // Optional minimum followers filter
    if (minFollowers && !isNaN(Number(minFollowers))) {
      query = query.where('followers_count', '>=', Number(minFollowers));
    }

    // Sorting
    const validSortFields = ['followers_count', 'created_at', 'name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'followers_count';
    const direction = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    query = query.orderBy(sortField, direction);

    // Pagination
    query = query.limit(Number(limit)).offset(Number(offset));

    const brands = await query.execute();

    // Optional: get total count for client-side pagination UI
    const totalQuery = db
      .selectFrom('brands')
      .select(({ fn }) => fn.countAll().as('total'))
      .where('deleted_at', 'is', null);

    if (status) totalQuery.where('status', '=', status);
    if (search) {
      const searchTerm = `%${search.trim()}%`;
      totalQuery.where((eb) =>
        eb.or([
          eb('name', 'ilike', searchTerm),
          eb('slug', 'ilike', searchTerm),
        ])
      );
    }
    if (minFollowers && !isNaN(Number(minFollowers))) {
      totalQuery.where('followers_count', '>=', Number(minFollowers));
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
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch brands' });
  }
}
async function createBrand(req, res) {
  try {
    const brand = await Brand.create(req.user.id, req.body);
    return res.status(201).json(brand);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || 'Failed to create brand' });
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
    console.error(err);
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
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getMyBrands(req, res) {
  try {
    const brands = await db
      .selectFrom('brands')
      .selectAll()
      .where('user_id', '=', req.user.id)
      .where('deleted_at', 'is', null)
      .orderBy('created_at', 'desc')
      .execute();

    return res.json(brands);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch your brands' });
  }
}

async function updateBrand(req, res) {
  try {
    await ensureBrandOwnership(req.params.id, req.user.id);
    const updated = await Brand.update(req.params.id, req.body, req.user.id);

    if (!updated) return res.status(404).json({ error: 'Brand not found' });

    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to update brand' });
  }
}

async function deleteBrand(req, res) {
  try {
    await ensureBrandOwnership(req.params.id, req.user.id);
    await Brand.softDelete(req.params.id, req.user.id);
    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to delete brand' });
  }
}

// ───────────────────────────────────────────────
// Storefront – Brand Artworks
// ───────────────────────────────────────────────

async function addArtworkToBrand(req, res) {
  try {
    await ensureBrandOwnership(req.params.brandId, req.user.id);

    const relation = await Brand.addArtwork(
      req.params.brandId,
      req.body.artworkId,
      {
        is_featured: !!req.body.is_featured,
        sort_order: Number(req.body.sort_order) || 0,
      },
      req.user.id
    );

    return res.status(201).json(relation);
  } catch (err) {
    return res.status(400).json({ error: err.message });
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
        'artworks.id',
        'artworks.title',
        'artworks.slug',
        'artworks.description',
        'artworks.preview_url',
        'artworks.status',
        'brand_artworks.is_featured',
        'brand_artworks.sort_order',
        'brand_artworks.added_at',
      ])
      .where('brand_artworks.brand_id', '=', brandId)
      .orderBy('brand_artworks.sort_order', 'asc')
      .limit(Number(limit))
      .offset(Number(offset));

    if (featuredOnly === 'true') {
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
    await ensureBrandOwnership(req.params.brandId, req.user.id);
    await Brand.removeArtwork(req.params.brandId, req.params.artworkId, req.user.id);
    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to remove artwork' });
  }
}

// ───────────────────────────────────────────────
// Follow / Social
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
        'users.id',
        'users.username',
        'users.display_name',
        'users.avatar_url',
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
// Brand Posts
// ───────────────────────────────────────────────

async function createBrandPost(req, res) {
  try {
    await ensureBrandOwnership(req.params.brandId, req.user.id);
    const post = await BrandPost.create(req.params.brandId, req.body);
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
    await ensureBrandOwnership(req.params.brandId, req.user.id);
    const updated = await BrandPost.update(req.params.postId, req.params.brandId, req.body, req.user.id);
    if (!updated) return res.status(404).json({ error: 'Post not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function deleteBrandPost(req, res) {
  try {
    await ensureBrandOwnership(req.params.brandId, req.user.id);
    await BrandPost.softDelete(req.params.postId, req.params.brandId);
    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function togglePinBrandPost(req, res) {
  try {
    await ensureBrandOwnership(req.params.brandId, req.user.id);
    await BrandPost.togglePin(req.params.postId, req.params.brandId, req.body.pin !== false);
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
// Brand Post Comments
// ───────────────────────────────────────────────

async function createBrandPostComment(req, res) {
  try {
    const comment = await BrandPostComment.create(req.params.postId, req.user.id, req.body);
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
// Views
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
// Export functions (named exports)
// ───────────────────────────────────────────────
module.exports = {
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
};