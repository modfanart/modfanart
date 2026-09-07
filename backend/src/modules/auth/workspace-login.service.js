'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require('../users/models/user.model');
const RefreshToken = require('./models/refreshToken.model');

const { db } = require('../../config');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

class WorkspaceLoginService {
  /**
   * Workspace-specific email/password authentication.
   *
   * IMPORTANT:
   * This service does NOT communicate with Firebase.
   *
   * Flow:
   *
   * Email + Password
   *        ↓
   * Local User Database
   *        ↓
   * bcrypt.compare()
   *        ↓
   * Internal JWT Access Token
   *        ↓
   * Internal Refresh Token
   *        ↓
   * refresh_tokens table
   */
  static async login({ email, password }) {
    // =========================================================
    // 1. Validate input
    // =========================================================

    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.status = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // =========================================================
    // 2. Find local user
    // =========================================================

    const user = await User.findByEmail(normalizedEmail);

    if (!user) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    // =========================================================
    // 3. Check account state
    // =========================================================

    if (user.status === 'suspended') {
      const error = new Error('Account is suspended');
      error.status = 403;
      throw error;
    }

    if (user.status === 'deactivated') {
      const error = new Error('Account is deactivated');
      error.status = 403;
      throw error;
    }

    if (user.status === 'pending_verification') {
      const error = new Error('Email verification is required');
      error.status = 403;
      throw error;
    }

    if (user.status !== 'active') {
      const error = new Error('Account is not available for login');
      error.status = 403;
      throw error;
    }

    // =========================================================
    // 4. Ensure local password exists
    // =========================================================

    if (!user.password_hash) {
      const error = new Error(
        'This account does not have password login enabled'
      );
      error.status = 401;
      throw error;
    }

    // =========================================================
    // 5. Verify password locally
    // =========================================================

    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    // =========================================================
    // 6. Load complete user
    // =========================================================

    const fullUser = await db
      .selectFrom('users as u')
      .leftJoin('roles as r', 'r.id', 'u.role_id')
      .select([
        'u.id',
        'u.username',
        'u.email',
        'u.avatar_url',
        'u.status',
        'u.email_verified',
        'u.role_id',
        'r.name as role',
        'r.permissions as permissions',
      ])
      .where('u.id', '=', user.id)
      .executeTakeFirst();

    if (!fullUser) {
      const error = new Error('User profile could not be loaded');
      error.status = 404;
      throw error;
    }

    // =========================================================
    // 7. Create internal JWT access token
    // =========================================================

    const accessToken = WorkspaceLoginService._signAccessToken(user);

    // =========================================================
    // 8. Create + store refresh token
    // =========================================================

    const rawRefreshToken = await WorkspaceLoginService._issueRefreshToken(
      user.id
    );

    // =========================================================
    // 9. Update login timestamp
    // =========================================================

    await User.updateLastLogin(user.id);

    // =========================================================
    // 10. Return local authentication tokens
    // =========================================================

    return {
      user: fullUser,
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  /**
   * Exchange a valid, unexpired refresh token for a new access
   * token, rotating the refresh token in the process.
   *
   * Flow:
   *
   * Raw refresh token (from client)
   *        ↓
   * sha256 hash
   *        ↓
   * Lookup in refresh_tokens table
   *        ↓
   * Check not expired / not revoked
   *        ↓
   * Issue new access token
   *        ↓
   * Rotate refresh token (revoke old, issue new)
   */
  static async refresh({ refreshToken }) {
    if (!refreshToken) {
      const error = new Error('Refresh token is required');
      error.status = 400;
      throw error;
    }

    // =========================================================
    // 1. Hash the incoming raw token to compare against storage
    // =========================================================

    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // =========================================================
    // 2. Look up the stored token record
    // =========================================================

    const tokenRecord = await RefreshToken.findByHash(tokenHash);

    if (!tokenRecord) {
      const error = new Error('Invalid refresh token');
      error.status = 401;
      throw error;
    }

    if (tokenRecord.revoked_at) {
      const error = new Error('Refresh token has been revoked');
      error.status = 401;
      throw error;
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      const error = new Error('Refresh token has expired');
      error.status = 401;
      throw error;
    }

    // =========================================================
    // 3. Load the user tied to this token
    // =========================================================

    const user = await User.findById(tokenRecord.user_id);

    if (!user || user.status !== 'active') {
      const error = new Error('Account is not available for login');
      error.status = 403;
      throw error;
    }

    // =========================================================
    // 4. Issue a new access token
    // =========================================================

    const accessToken = WorkspaceLoginService._signAccessToken(user);

    // =========================================================
    // 5. Rotate the refresh token
    //
    // Revoke the one that was just used and issue a brand new
    // one. This limits the blast radius if a refresh token is
    // ever stolen — it can only be used once.
    // =========================================================

    await RefreshToken.revoke(tokenRecord.id);

    const newRawRefreshToken = await WorkspaceLoginService._issueRefreshToken(
      user.id
    );

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  // ===============================================================
  // PRIVATE HELPERS
  // ===============================================================

  static _signAccessToken(user) {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        roleId: user.role_id,
        type: 'workspace',
      },
      process.env.WORKSPACE_JWT_ACCESS_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      }
    );
  }

  static async _issueRefreshToken(userId) {
    const rawRefreshToken = crypto.randomBytes(64).toString('hex');

    // Never store raw refresh token in DB
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await RefreshToken.create(userId, refreshTokenHash, expiresAt);

    return rawRefreshToken;
  }
}

module.exports = WorkspaceLoginService;
