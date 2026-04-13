// src/controllers/user.controller.js
const User = require('../models/user.model');
const Role = require('../models/role.model');
const { hashPassword, comparePassword } = require('../utils/password.util');
const { s3Client } = require('../config');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const path = require('path');
const { db } = require('../config');
const { sql } = require('kysely'); // ← Critical fix for sql`NOW()`
const UserStatsService = require('../services/userStats.service');
class UserController {
  /**
   * GET /users/me
   */
static async getUserByUsername(req, res) {
  try {
    const { username } = req.params;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Valid username is required',
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    const user = await req.db
      .selectFrom('users')
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .select([
        'users.id',
        'users.username',
        'users.status',
        'users.profile',
        'users.avatar_url',
        'users.banner_url',
        'users.bio',
        'users.location',
        'users.website',
        'users.last_login_at',
        'users.created_at',
        'users.updated_at',

        'roles.id as role_id',
        'roles.name as role_name',
        'roles.hierarchy_level as role_hierarchy_level',
      ])
      .where('users.username', 'ilike', cleanUsername)
      .where('users.status', '=', 'active')
      .where('users.deleted_at', 'is', null)
      .executeTakeFirst();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User @${username} not found or profile is not available`,
      });
    }

    const isOwnProfile = req.user && req.user.id === user.id;

    // 🔥 ADD THIS: compute stats from existing tables
    const stats = await UserStatsService.getUserStats(user.id);

    const publicUser = {
      id: user.id,
      username: user.username,
      status: user.status,
      role: {
        id: user.role_id,
        name: user.role_name || 'Artist',
        hierarchy_level: user.role_hierarchy_level ?? 0,
      },
      profile: user.profile || {},
      avatar_url: user.avatar_url,
      banner_url: user.banner_url,
      bio: user.bio,
      location: user.location,
      website: user.website,
      created_at: user.created_at,
      updated_at: user.updated_at,

      // 🔥 ADD STATS HERE
      stats,
    };
console.log(publicUser);
    return res.status(200).json({
      success: true,
      user: publicUser,
    });

  } catch (error) {
    console.error('[getUserByUsername] Error:', {
      message: error.message,
      username: req.params.username,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
static async getCurrentUser(req, res) {
    try {
      // 1. Ensure user is authenticated (from auth middleware)
      const userId = req.user?.id || req.user?.userId; // some JWT payloads use userId instead of id

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required - no user context found',
        });
      }

      // 2. Safety check: database must be attached
      if (!req.db) {
        console.error('[getCurrentUser] Database instance not attached to request');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error - database unavailable',
        });
      }

      // 3. Fetch user + role in a single efficient query
      const user = await req.db
        .selectFrom('users')
        .leftJoin('roles', 'users.role_id', 'roles.id')
        .select([
          'users.id',
          'users.username',
          'users.email',
          'users.email_verified',
          'users.status',
          'users.profile',           // JSONB
          'users.avatar_url',
          'users.banner_url',
          'users.bio',
          'users.location',
          'users.website',
          'users.payout_method',     // if you have this column
          'users.stripe_connect_id',
          'users.last_login_at',
          'users.created_at',
          'users.updated_at',
          'users.deleted_at',        // if using soft deletes

          // Role fields
          'roles.id as role_id',
          'roles.name as role_name',
          'roles.hierarchy_level as role_hierarchy_level',
          // add more role fields if needed: permissions, description, etc.
        ])
        .where('users.id', '=', userId)
        // Optional: exclude soft-deleted users
        .where('users.deleted_at', 'is', null)
        .executeTakeFirst();

      // 4. Not found case
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found',
        });
      }

      // 5. Optional: Update last_login_at if you want to track it here
      // (some apps do this on every /me call, others only on login)
      /*
      await req.db
        .updateTable('users')
        .set({ last_login_at: sql`NOW()` })
        .where('id', '=', userId)
        .execute();
      */

      // 6. Format clean, frontend-friendly response
      // Match this shape with your TypeScript User interface
      const response = {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          email_verified: user.email_verified,
          status: user.status,
          role_id: user.role_id,
          role: {
            id: user.role_id,
            name: user.role_name || 'unknown',
            hierarchy_level: user.role_hierarchy_level ?? 0,
          },
          profile: user.profile || {},
          avatar_url: user.avatar_url,
          banner_url: user.banner_url,
          bio: user.bio,
          location: user.location,
          website: user.website,
          payout_method: user.payout_method || null,
          stripe_connect_id: user.stripe_connect_id || null,
          last_login_at: user.last_login_at,
          created_at: user.created_at,
          updated_at: user.updated_at,
          deleted_at: user.deleted_at || null,
        },
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('[getCurrentUser] Error:', {
        message: error.message,
        stack: error.stack,
        userId: req.user?.id,
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * PATCH /users/me
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { bio, location, website, profile } = req.body;

      const updateData = {};

      if (bio !== undefined) updateData.bio = bio;
      if (location !== undefined) updateData.location = location;
      if (website !== undefined) updateData.website = website;

      if (profile && typeof profile === 'object') {
        const currentUser = await User.findById(userId);
        updateData.profile = { ...currentUser.profile, ...profile };
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const updated = await User.update?.(userId, {
        ...updateData,
        updated_at: sql`NOW()`,
      }) || await db.updateTable('users')
        .set({ ...updateData, updated_at: sql`NOW()` })
        .where('id', '=', userId)
        .returning(['bio', 'location', 'website', 'profile'])
        .executeTakeFirst();

      res.json({
        message: 'Profile updated successfully',
        user: {
          bio: updated.bio,
          location: updated.location,
          website: updated.website,
          profile: updated.profile,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  /**
   * PATCH /users/me/password
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password required' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
      }

      const user = await User.findById(req.user.id);
      if (!user?.password_hash) {
        return res.status(400).json({ error: 'No password set (social login?)' });
      }

      const isMatch = await comparePassword(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password incorrect' });
      }

      const newHash = await hashPassword(newPassword);

      await db.updateTable('users')
        .set({
          password_hash: newHash,
          updated_at: sql`NOW()`,
        })
        .where('id', '=', req.user.id)
        .execute();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }

  /**
   * POST /users/me/avatar
   */
  static async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = req.user.id;
      const file = req.file;
      const ext = path.extname(file.originalname).toLowerCase();
      const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

      if (!allowed.includes(ext)) {
        return res.status(400).json({ error: 'Invalid file type. Allowed: jpg, png, gif, webp' });
      }

      const key = `avatars/${userId}/${crypto.randomUUID()}${ext}`;

      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,

      }));

      const avatarUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      await db.updateTable('users')
        .set({
          avatar_url: avatarUrl,
          updated_at: sql`NOW()`,
        })
        .where('id', '=', userId)
        .execute();

      res.json({ message: 'Avatar updated', avatar_url: avatarUrl });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({ error: 'Failed to upload avatar' });
    }
  }

  /**
   * DELETE /users/me/avatar
   */
  static async removeAvatar(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user?.avatar_url) {
        return res.status(400).json({ error: 'No avatar to remove' });
      }

      await db.updateTable('users')
        .set({
          avatar_url: null,
          updated_at: sql`NOW()`,
        })
        .where('id', '=', req.user.id)
        .execute();

      res.json({ message: 'Avatar removed' });
    } catch (error) {
      console.error('Remove avatar error:', error);
      res.status(500).json({ error: 'Failed to remove avatar' });
    }
  }

  /**
   * GET /users
   * Admin only: List all users with search, filter, pagination
   */
  static async getAllUsers(req, res) {
    try {
      // Admin check
      // const adminRole = await Role.findByName('admin');
      // if (!adminRole || req.user.role_id !== adminRole.id) {
      //   return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
      // }

      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 100);
      const offset = (page - 1) * limit;
      const search = req.query.search?.trim();
      const statusFilter = req.query.status;
      const sort = req.query.sort || 'created_at';
      const order = req.query.order?.toUpperCase() === 'ASC' ? 'asc' : 'desc';

      const allowedSortFields = ['created_at', 'username', 'email', 'last_login_at', 'status'];
      const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';

      // Base query
      let query = db
        .selectFrom('users as u')
        .leftJoin('roles as r', 'u.role_id', 'r.id')
        .select([
          'u.id',
          'u.username',
          'u.email',
          'u.email_verified',
          'u.status',
          'u.bio',
          'u.location',
          'u.website',
          'u.avatar_url',
          'u.banner_url',
          'u.last_login_at',
          'u.created_at',
          'u.updated_at',
          'r.name as role_name',
          'r.hierarchy_level as role_hierarchy_level',
          'u.profile',
        ]);

      if (search) {
        query = query.where(eb => eb.or([
          eb('u.username', 'ilike', `%${search}%`),
          eb('u.email', 'ilike', `%${search}%`),
          eb('u.bio', 'ilike', `%${search}%`),
        ]));
      }

      if (statusFilter) {
        query = query.where('u.status', '=', statusFilter);
      }

      // Accurate count (no join duplication)
      let countQuery = db.selectFrom('users').where('deleted_at', 'is', null);
      if (search) {
        countQuery = countQuery.where(eb => eb.or([
          eb('username', 'ilike', `%${search}%`),
          eb('email', 'ilike', `%${search}%`),
          eb('bio', 'ilike', `%${search}%`),
        ]));
      }
      if (statusFilter) {
        countQuery = countQuery.where('status', '=', statusFilter);
      }

      const { total } = await countQuery.select(db.fn.count('id').as('total')).executeTakeFirst();
      const totalUsers = parseInt(total || 0);
      const totalPages = Math.ceil(totalUsers / limit);

      // Final list
      const usersResult = await query
        .orderBy(`u.${sortField}`, order)
        .limit(limit)
        .offset(offset)
        .execute();

      const users = usersResult.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        email_verified: user.email_verified,
        status: user.status,
        bio: user.bio || null,
        location: user.location || null,
        website: user.website || null,
        avatar_url: user.avatar_url || null,
        banner_url: user.banner_url || null,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
        role: {
          name: user.role_name || 'unknown',
          hierarchy_level: user.role_hierarchy_level ?? 0,
        },
        profile: user.profile || {},
      }));

      res.json({
        users,
        pagination: {
          page,
          limit,
          total: totalUsers,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  /**
   * GET /users/:id
   * 
   */
  static async getUserById(req, res) {
    try {
 

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const role = await Role.findById(user.role_id);

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        email_verified: user.email_verified,
        status: user.status,
        role: {
          id: user.role_id,
          name: role?.name || 'unknown',
          hierarchy_level: role?.hierarchy_level || 0,
        },
        profile: user.profile || {},
        avatar_url: user.avatar_url,
        banner_url: user.banner_url,
        bio: user.bio,
        location: user.location,
        website: user.website,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  /**
   * PATCH /users/:id/status
   * Admin only: Update user status (active, suspended, deactivated)
   */
  static async updateUserStatus(req, res) {
    try {
      const adminRole = await Role.findByName('admin');
      if (!adminRole || req.user.role_id !== adminRole.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { status } = req.body;
      const allowedStatuses = ['active', 'suspended', 'deactivated', 'pending_verification'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const updated = await db.updateTable('users')
        .set({
          status,
          updated_at: sql`NOW()`,
        })
        .where('id', '=', req.params.id)
        .where('deleted_at', 'is', null)
        .returning(['id', 'username', 'status'])
        .executeTakeFirst();

      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User status updated',
        user: { id: updated.id, username: updated.username, status: updated.status },
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  }

  /**
 * GET /users/me/brands
 * Returns all brands where the authenticated user is the brand manager
 */
static async getMyBrands(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user is assigned as a brand manager or owner
    const managerRows = await req.db
      .selectFrom('brand_managers')
      .select(['brand_id', 'role'])
      .where('user_id', '=', userId)
      .execute();

    if (managerRows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not managing any brands',
      });
    }

    const brandIds = managerRows.map(m => m.brand_id);

    // Fetch the brands this user manages
    const brands = await req.db
      .selectFrom('brands')
      .select([
        'id',
        'name',
        'slug',
        'description',
        'logo_url',
        'banner_url',
        'created_at',
        'updated_at',
        'status',
      ])
      .where('id', 'in', brandIds)
      .where('deleted_at', 'is', null)
      .execute();

    return res.status(200).json({
      success: true,
      brands,
    });
  } catch (err) {
    console.error('[getMyBrands] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch brands for this manager',
    });
  }
}
}

module.exports = UserController;