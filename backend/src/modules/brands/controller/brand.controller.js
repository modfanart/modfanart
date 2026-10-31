// src/controllers/brand.controller.js
const { db } = require('../../../config');
const { sql } = require('kysely');
const Brand = require('../models/brand.model');
const BrandPost = require('../models/brandPost.model');
const BrandPostComment = require('../models/brandPostComment.model');
const BrandVerificationRequest = require('../models/brandVerificationRequest.model');
const BrandManager = require('../models/brandManager.model');

// Assume these helpers exist
const {
  hasPermission,
} = require('../../../common/middleware/permission.middleware');
const {
  ensureBrandAccessMiddleware,
  ensureBrandOwnerMiddleware,
} = require('../../../common/middleware/brand.middleware');
// ─────────────────────────────────────── ────────
// Helpers
// ───────────────────────────────────────────────

async function ensureBrandManagerOrHigher(req) {
  const allowedRoles = ['BRAND_MANAGER', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'];
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

      sortBy = 'followers_count',
      sortOrder = 'desc',
      minFollowers,
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
        'status',
      ])
      .where('deleted_at', 'is', null);

    if (search) {
      const term = `%${search.trim()}%`;
      query = query.where((eb) =>
        eb.or([eb('name', 'ilike', term), eb('slug', 'ilike', term)])
      );
    }

    if (minFollowers && !isNaN(Number(minFollowers))) {
      query = query.where('followers_count', '>=', Number(minFollowers));
    }

    const validSortFields = ['followers_count', 'created_at', 'name'];
    const sortField = validSortFields.includes(sortBy)
      ? sortBy
      : 'followers_count';
    const direction = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    query = query
      .orderBy(sortField, direction)
      .limit(Number(limit))
      .offset(Number(offset));

    const brands = await query.execute();

    // Total count for pagination
    let totalQuery = db
      .selectFrom('brands')
      .select(({ fn }) => fn.countAll().as('total'))
      .where('deleted_at', 'is', null);

    if (search) {
      const term = `%${search.trim()}%`;
      totalQuery = totalQuery.where((eb) =>
        eb.or([eb('name', 'ilike', term), eb('slug', 'ilike', term)])
      );
    }
    if (minFollowers && !isNaN(Number(minFollowers))) {
      totalQuery = totalQuery.where(
        'followers_count',
        '>=',
        Number(minFollowers)
      );
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
      team_size,
      how_heard,
      documents = [],
      accepted_terms,
    } = req.body;

    if (!company_name?.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    if (!contact_email?.trim()) {
      return res.status(400).json({ error: 'Contact email is required' });
    }

    // Two callers: the public contact-sales form (anonymous lead, no account yet) and a
    // signed-in brand account asking to be verified. Only the latter is tied to a user, and
    // it is what approval later attaches the brand to.
    if (req.user) {
      if (!req.user.email_verified) {
        return res.status(403).json({
          error: 'Please verify your email address before requesting brand verification.',
          code: 'EMAIL_NOT_VERIFIED',
        });
      }

      if (accepted_terms !== true) {
        return res.status(400).json({
          error: 'You must confirm you represent this brand and accept the Terms of Service',
          code: 'TERMS_NOT_ACCEPTED',
        });
      }

      const open = await db
        .selectFrom('brand_verification_requests')
        .select(['id'])
        .where('user_id', '=', req.user.id)
        .where('status', 'in', ['pending', 'interview_scheduled'])
        .executeTakeFirst();

      if (open) {
        return res.status(409).json({
          error: 'You already have a brand verification request under review.',
          code: 'REQUEST_ALREADY_OPEN',
        });
      }
    }

    const requestData = {
      user_id: req.user?.id || null,
      company_name: company_name.trim(),
      website: website ? website.trim() : null,
      contact_email: contact_email.trim(),
      contact_phone: contact_phone ? contact_phone.trim() : null,
      description: description ? description.trim() : null,
      documents: documents || [],
      team_size: team_size || null,
      how_heard: how_heard || 'search',
      status: 'pending',
    };

    const request = await BrandVerificationRequest.create(requestData);

    return res.status(201).json({
      success: true,
      message:
        'Verification request received. Our team will review and get back to you.',
      requestId: request.id,
    });
  } catch (err) {
    console.error('submitBrandVerificationRequest error:', err);
    return res.status(400).json({
      error: err.message || 'Failed to submit verification request',
    });
  }
}

/**
 * GET /brands/verification-requests/mine
 * The signed-in user's most recent brand verification request, or null. Drives the
 * /brand-manager landing page for brand accounts that have no brand attached yet.
 */
async function getMyBrandVerificationRequest(req, res) {
  try {
    const request = await db
      .selectFrom('brand_verification_requests')
      .select([
        'id',
        'company_name',
        'website',
        'contact_email',
        'status',
        'reviewed_at',
        'created_at',
      ])
      .where('user_id', '=', req.user.id)
      .orderBy('created_at', 'desc')
      .executeTakeFirst();

    return res.json({ request: request || null });
  } catch (err) {
    console.error('getMyBrandVerificationRequest error:', err);
    return res.status(500).json({ error: 'Failed to fetch verification request' });
  }
}

async function getBrandVerificationRequests(req, res) {
  try {
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
    return res
      .status(500)
      .json({ error: 'Failed to fetch verification requests' });
  }
}

function slugify(name) {
  return (
    String(name)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'brand'
  );
}

async function uniqueBrandSlug(trx, name) {
  const base = slugify(name);
  let slug = base;

  for (let attempt = 2; ; attempt += 1) {
    const taken = await trx
      .selectFrom('brands')
      .select(['id'])
      .where('slug', '=', slug)
      .executeTakeFirst();
    if (!taken) return slug;
    slug = `${base}-${attempt}`;
  }
}

/**
 * PATCH /brands/verification-requests/:requestId/approve
 *
 * Creates the brand and makes the applicant its owner, so their "Dashboard" link resolves
 * to /brand-manager/<slug>. The applicant is the signed-in account that filed the request;
 * for older or anonymous (contact-sales) requests, the account registered with the
 * request's contact email. If neither exists there is nobody to hand the brand to, so the
 * request stays pending and the reviewer is told to have the applicant sign up first.
 */
async function approveBrandVerificationRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { notes } = req.body || {};

    const request = await BrandVerificationRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (!['pending', 'interview_scheduled'].includes(request.status)) {
      return res
        .status(400)
        .json({ error: `Request is already ${request.status}` });
    }

    let applicant = request.user_id
      ? await db
          .selectFrom('users')
          .select(['id', 'email', 'role_id'])
          .where('id', '=', request.user_id)
          .where('deleted_at', 'is', null)
          .executeTakeFirst()
      : null;

    if (!applicant && request.contact_email) {
      applicant = await db
        .selectFrom('users')
        .select(['id', 'email', 'role_id'])
        .where(sql`lower(email)`, '=', request.contact_email.trim().toLowerCase())
        .where('deleted_at', 'is', null)
        .executeTakeFirst();
    }

    if (!applicant) {
      return res.status(422).json({
        error: `No account is linked to this request. Ask the applicant to sign up as a brand with ${request.contact_email}, then approve again.`,
        code: 'APPLICANT_HAS_NO_ACCOUNT',
      });
    }

    const brandManagerRole = await db
      .selectFrom('roles')
      .select(['id'])
      .where('name', '=', 'BRAND_MANAGER')
      .executeTakeFirst();

    const brand = await db.transaction().execute(async (trx) => {
      const created = await trx
        .insertInto('brands')
        .values({
          user_id: applicant.id,
          name: request.company_name,
          slug: await uniqueBrandSlug(trx, request.company_name),
          description: request.description || null,
          website: request.website || null,
          status: 'active',
          verification_request_id: request.id,
          followers_count: 0,
          created_at: sql`NOW()`,
          updated_at: sql`NOW()`,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      await trx
        .insertInto('brand_managers')
        .values({
          brand_id: created.id,
          user_id: applicant.id,
          role: 'owner',
          created_at: sql`NOW()`,
        })
        .execute();

      // A lead who signed up as a fan or artist becomes a brand manager on approval;
      // admins keep their role.
      const currentRole = await trx
        .selectFrom('roles')
        .select(['name'])
        .where('id', '=', applicant.role_id)
        .executeTakeFirst();
      const isAdmin = ['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(
        currentRole?.name
      );

      if (brandManagerRole && !isAdmin) {
        await trx
          .updateTable('users')
          .set({ role_id: brandManagerRole.id, updated_at: sql`NOW()` })
          .where('id', '=', applicant.id)
          .execute();
      }

      await trx
        .updateTable('brand_verification_requests')
        .set({
          status: 'approved',
          user_id: applicant.id,
          reviewed_by: req.user.id,
          reviewed_at: sql`NOW()`,
          notes: notes ? `${request.notes || ''}\n${notes}`.trim() : request.notes,
          updated_at: sql`NOW()`,
        })
        .where('id', '=', request.id)
        .execute();

      return created;
    });

    return res.json({
      success: true,
      brandId: brand.id,
      brandSlug: brand.slug,
      managerUserId: applicant.id,
      message: 'Brand approved and attached to the applicant\'s account',
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

    const owned = await db
      .selectFrom('brands')
      .select(['id'])
      .where('user_id', '=', req.user.id)
      .where('deleted_at', 'is', null)
      .execute();

    const brandIds = [
      ...new Set([
        ...managed.map((m) => m.brand_id),
        ...owned.map((b) => b.id),
      ]),
    ];

    if (brandIds.length === 0) {
      return res.json([]);
    }

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
        my_role:
          relation?.role || (brand.user_id === req.user.id ? 'owner' : null),
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
    return res
      .status(status)
      .json({ error: err.message || 'Failed to update brand' });
  }
}

async function deleteBrand(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    await ensureBrandOwnerMiddleware(req); // ensure only owner can delete

    await Brand.softDelete(req.params.id, req.user.id);

    return res.status(204).send();
  } catch (err) {
    console.error('deleteBrand error:', err);

    const status = err.status || 400;
    const message = err.message || 'Failed to delete brand';
    return res.status(status).json({ error: message });
  }
}

// ───────────────────────────────────────────────
// 4. Artworks (Storefront)
// ───────────────────────────────────────────────

async function addArtworkToBrand(req, res) {
  try {
    await ensureBrandAccessMiddleware(req); // owner, manager, editor

    const { artworkId, is_featured = false, sort_order = 0 } = req.body;

    const relation = await Brand.addArtwork(
      req.params.brandId,
      artworkId,
      {
        is_featured: !!is_featured,
        sort_order: Number(sort_order),
      },
      req.user.id
    );

    return res.status(201).json(relation);
  } catch (err) {
    return res
      .status(400)
      .json({ error: err.message || 'Failed to add artwork' });
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
    await ensureBrandAccessMiddleware(req); // owner, manager, editor

    await Brand.removeArtwork(
      req.params.brandId,
      req.params.artworkId,
      req.user.id
    );
    return res.status(204).send();
  } catch (err) {
    return res
      .status(400)
      .json({ error: err.message || 'Failed to remove artwork' });
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
// 6. Brand Posts
// ───────────────────────────────────────────────

async function createBrandPost(req, res) {
  try {
    await ensureBrandAccessMiddleware(req, ['owner', 'manager', 'editor']);

    const post = await BrandPost.create(
      req.params.brandId,
      req.body,
      req.user.id
    );
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
    const post = await BrandPost.findById(req.params.postId, {
      brandId: req.params.brandId,
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    return res.json(post);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateBrandPost(req, res) {
  try {
    await ensureBrandAccessMiddleware(req, ['owner', 'manager', 'editor']);

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
    await ensureBrandAccessMiddleware(req, ['owner', 'manager']); // editors cannot delete

    await BrandPost.softDelete(req.params.postId, req.params.brandId);
    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function togglePinBrandPost(req, res) {
  try {
    await ensureBrandAccessMiddleware(req, ['owner', 'manager']);

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
    const deleted = await BrandPostComment.softDelete(
      req.params.commentId,
      req.user.id
    );
    if (!deleted)
      return res.status(403).json({ error: 'Not found or not authorized' });
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
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('adminCreateBrand error: empty request body');
      return res.status(400).json({ error: 'Request body is required' });
    }

    const {
      name,
      slug,
      description,
      website,
      status,
      logo_url,
      banner_url,
      social_links,
      user_id,
    } = req.body;

    if (!name) {
      console.error('adminCreateBrand error: missing brand name');
      return res.status(400).json({ error: 'Brand name is required' });
    }

    if (!user_id) {
      console.error('adminCreateBrand error: missing user_id');
      return res.status(400).json({ error: 'Admin user_id is required' });
    }

    // Prepare data for Brand.create (without user_id, pass it as first argument)
    const brandData = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description: description || null,
      logo_url: logo_url || null,
      banner_url: banner_url || null,
      website: website || null,
      social_links: social_links || null,
      status: status || 'pending',
    };

    // Pass the admin ID as first argument
    const brand = await Brand.create(user_id, brandData);

    return res.status(201).json(brand);
  } catch (err) {
    console.error('adminCreateBrand error:', err);
    return res
      .status(400)
      .json({ error: err.message || 'Failed to create brand' });
  }
}
// In brand.controller.js
async function getBrandManagers(req, res) {
  try {
    const managers = await BrandManager.findByBrand(req.params.brandId);
    return res.json(managers);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch managers' });
  }
}

async function assignBrandManager(req, res) {
  try {
    const { brandId } = req.params;
    const { userId, role = 'manager' } = req.body;

    // --------------------------------------------------
    // 1. Ensure requester has permission
    // --------------------------------------------------
    await ensureBrandOwnerMiddleware(req);

    // --------------------------------------------------
    // 2. Check if user already manages any brand
    // --------------------------------------------------
    const existing = await BrandManager.findByUser(userId);

    if (existing.length > 0) {
      const existingManager = existing[0];

      // If your BrandManager record has populated brand details
      const managedBrandName =
        existingManager.brand?.name || existingManager.brand_name || null;

      return res.status(400).json({
        success: false,
        error: 'USER_ALREADY_MANAGES_BRAND',
        message: managedBrandName
          ? `This user already manages the brand "${managedBrandName}". A user can only manage one brand.`
          : 'This user already manages another brand. A user can only manage one brand.',
        brandId: existingManager.brand_id,
      });
    }

    // --------------------------------------------------
    // 3. Create manager assignment
    // --------------------------------------------------
    const manager = await BrandManager.create({
      brand_id: brandId,
      user_id: userId,
      role,
    });

    return res.status(201).json({
      success: true,
      message: 'Brand manager assigned successfully',
      manager,
    });
  } catch (err) {
    return res.status(err.status || 400).json({
      success: false,
      error: err.message || 'Failed to assign manager',
    });
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
  getMyBrandVerificationRequest,
  getBrandVerificationRequests,
  approveBrandVerificationRequest,

  getMyBrands,
  updateBrand,
  deleteBrand,
  getBrandManagers,
  assignBrandManager,
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
  ensureBrandAccessMiddleware,
  ensureBrandOwnerMiddleware,
  ensureBrandManagerOrHigher,
};
