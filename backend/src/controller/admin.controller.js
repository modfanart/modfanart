// backend/src/controllers/admin.controller.js
const { db } = require('../config'); // your Kysely instance
const { logger } = require('../utils/logger');

/**
 * All routes under /admin/* should already be protected by:
 * - auth middleware → req.user exists
 * - admin middleware → checks role === 'admin' / 'super_admin' or hierarchy_level >= 100
 */

// ────────────────────────────────────────────────
// 1. Platform Overview / Stats
// ────────────────────────────────────────────────

/**
 * GET /admin/stats
 * Quick dashboard numbers
 */
async function getPlatformStats(req, res) {
  try {
    const [
      usersCount,
      activeBrandsCount,
      contestsCount,
      pendingModerationCount,
      openReportsCount,
      activeJudgesCount,
    ] = await Promise.all([
      db.selectFrom('users').select(db.fn.countAll().as('count')).executeTakeFirst(),
      db.selectFrom('brands').where('status', '=', 'active').select(db.fn.countAll().as('count')).executeTakeFirst(),
      db.selectFrom('contests').select(db.fn.countAll().as('count')).executeTakeFirst(),
      db.selectFrom('moderation_queue').where('status', '=', 'pending').select(db.fn.countAll().as('count')).executeTakeFirst(),
      db.selectFrom('user_violations').where('status', '=', 'open').select(db.fn.countAll().as('count')).executeTakeFirst(),
      db
        .selectFrom('users')
        .innerJoin('roles', 'users.role_id', 'roles.id')
        .where('roles.name', '=', 'judge')
        .select(db.fn.countAll().as('count'))
        .executeTakeFirst(),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: Number(usersCount?.count ?? 0),
        activeBrands: Number(activeBrandsCount?.count ?? 0),
        totalContests: Number(contestsCount?.count ?? 0),
        pendingApprovals: Number(pendingModerationCount?.count ?? 0),
        reportedItems: Number(openReportsCount?.count ?? 0),
        activeJudges: Number(activeJudgesCount?.count ?? 0),
      },
    });
  } catch (err) {
    logger.error('getPlatformStats failed', { error: err.message, stack: err.stack });
    res.status(500).json({ success: false, error: 'Failed to load platform statistics' });
  }
}

// ────────────────────────────────────────────────
// 2. Users Management
// ────────────────────────────────────────────────

/**
 * GET /admin/users
 * Paginated list of users with filters
 */
async function getUsers(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      role,
      sort = 'created_at',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, Number(page));
    const perPage = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * perPage;

    let query = db
      .selectFrom('users as u')
      .leftJoin('roles as r', 'u.role_id', 'r.id')
      .select([
        'u.id',
        'u.username',
        'u.email',
        'u.status',
        'u.avatar_url',
        'u.last_login_at',
        'u.created_at',
        'r.name as role_name',
        db.fn.count('u.id').over().as('total_count'),
      ]);

    if (search?.trim()) {
      query = query.where((eb) =>
        eb.or([
          eb('u.username', 'ilike', `%${search.trim()}%`),
          eb('u.email', 'ilike', `%${search.trim()}%`),
        ])
      );
    }

    if (status) query = query.where('u.status', '=', status);
    if (role) query = query.where('r.name', '=', role);

    const allowedSortFields = ['created_at', 'username', 'last_login_at', 'status'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortDirection = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const users = await query
      .orderBy(`u.${sortField}`, sortDirection)
      .limit(perPage)
      .offset(offset)
      .execute();

    const total = users.length > 0 ? Number(users[0].total_count) : 0;
    const totalPages = Math.ceil(total / perPage);

    res.json({
      success: true,
      data: users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        status: u.status,
        avatar_url: u.avatar_url,
        last_login_at: u.last_login_at,
        created_at: u.created_at,
        role: u.role_name || 'user',
      })),
      pagination: {
        page: pageNum,
        limit: perPage,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    logger.error('getUsers failed', { error: err.message });
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
}

/**
 * PATCH /admin/users/:id/status
 */
async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['active', 'suspended', 'pending_verification', 'deactivated'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    if (id === req.user.id) {
      return res.status(403).json({ success: false, error: 'Cannot change your own status this way' });
    }

    const updated = await db
      .updateTable('users')
      .set({
        status,
        updated_at: db.fn('now'),
      })
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .returning(['id', 'username', 'email', 'status'])
      .executeTakeFirst();

    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('updateUserStatus failed', { error: err.message });
    res.status(500).json({ success: false, error: 'Failed to update user status' });
  }
}

/**
 * DELETE /admin/users/:id (soft delete)
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(403).json({ success: false, error: 'Cannot delete yourself' });
    }

    const user = await db
      .selectFrom('users')
      .select(['role_id'])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Optional: prevent deleting other admins
    // const adminRole = await db.selectFrom('roles').where('name', '=', 'admin').select('id').executeTakeFirst();
    // if (user.role_id === adminRole?.id) { ... }

    await db
      .updateTable('users')
      .set({ deleted_at: db.fn('now'), updated_at: db.fn('now') })
      .where('id', '=', id)
      .execute();

    res.json({ success: true, message: 'User has been soft-deleted' });
  } catch (err) {
    logger.error('deleteUser failed', { error: err.message });
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
}

// ────────────────────────────────────────────────
// 3. Brands & Verification
// ────────────────────────────────────────────────

/**
 * GET /admin/brands/pending-verification
 */
async function getPendingBrandVerifications(req, res) {
  try {
    const limit = Math.min(20, Number(req.query.limit ?? 10));

    const brands = await db
      .selectFrom('brands as b')
      .innerJoin('brand_verification_requests as vr', 'b.verification_request_id', 'vr.id')
      .select([
        'b.id',
        'b.name',
        'b.slug',
        'b.logo_url',
        'b.website',
        'vr.company_name',
        'vr.status as verification_status',
        'vr.created_at',
      ])
      .where('vr.status', '=', 'pending')
      .orderBy('vr.created_at', 'desc')
      .limit(limit)
      .execute();

    res.json({ success: true, data: brands });
  } catch (err) {
    logger.error('getPendingBrandVerifications failed', err);
    res.status(500).json({ success: false, error: 'Failed to load pending verifications' });
  }
}

/**
 * PATCH /admin/brands/:brandId/verify
 * { action: 'approve' | 'reject', notes?: string }
 */
async function verifyBrand(req, res) {
  try {
    const { brandId } = req.params;
    const { action, notes } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    const request = await db
      .selectFrom('brand_verification_requests')
      .select(['id', 'status'])
      .where('brand_id', '=', brandId) // assuming you added brand_id column
      .executeTakeFirst();

    if (!request || request.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'No pending verification request found' });
    }

    const newRequestStatus = action === 'approve' ? 'approved' : 'rejected';
    const newBrandStatus = action === 'approve' ? 'active' : 'rejected';

    await db
      .updateTable('brand_verification_requests')
      .set({
        status: newRequestStatus,
        reviewed_by: req.user.id,
        reviewed_at: db.fn('now'),
        notes: notes || null,
      })
      .where('id', '=', request.id)
      .execute();

    await db
      .updateTable('brands')
      .set({
        status: newBrandStatus,
        updated_at: db.fn('now'),
      })
      .where('id', '=', brandId)
      .execute();

    res.json({ success: true, message: `Brand verification ${action}d` });
  } catch (err) {
    logger.error('verifyBrand failed', err);
    res.status(500).json({ success: false, error: 'Failed to process verification' });
  }
}

// ────────────────────────────────────────────────
// 4. Moderation Queue (unified)
// ────────────────────────────────────────────────

/**
 * GET /admin/moderation/queue
 * Pending items across entity types
 */
async function getModerationQueue(req, res) {
  try {
    const { entity_type, limit = 20, page = 1 } = req.query;

    const items = await db
      .selectFrom('moderation_queue')
      .selectAll()
      .$if(entity_type, (qb) => qb.where('entity_type', '=', entity_type))
      .where('status', '=', 'pending')
      .orderBy('priority', 'desc')
      .orderBy('created_at', 'asc')
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit))
      .execute();

    res.json({ success: true, data: items });
  } catch (err) {
    logger.error('getModerationQueue failed', err);
    res.status(500).json({ success: false, error: 'Failed to load moderation queue' });
  }
}

// ────────────────────────────────────────────────
// Export
// ────────────────────────────────────────────────

module.exports = {
  getPlatformStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  getPendingBrandVerifications,
  verifyBrand,
  getModerationQueue,

  // Add more later:
  // getPendingContests,
  // approveContest,
  // getReports,
  // banUserPermanently,
  // impersonateUser,
  // etc.
};