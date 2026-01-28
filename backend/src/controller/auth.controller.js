const User = require('../models/user.model');
const Role = require('../models/role.model');
const RefreshToken = require('../models/refreshToken.model');
const AuthToken = require('../models/authToken.model');

const { hashPassword, comparePassword } = require('../utils/password.util');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt.util');

const crypto = require('crypto');
const { sql } = require('kysely');
const { db } = require('../config');
// Helpers (you can move to utils/email.util.js later)
async function sendVerificationEmail(user, token) {
  // TODO: implement real email sending (nodemailer, resend, etc.)
  console.log(`Verification link: http://localhost:3000/auth/verify-email?token=${token}`);
}

async function sendPasswordResetEmail(user, token) {
  console.log(`Reset password link: http://localhost:3000/auth/reset-password?token=${token}`);
}

class AuthController {
  // POST /auth/register
  static async register(req, res) {
    try {
      const { username, email, password, signup_key } = req.body;

      // Basic validation (you should use zod/joi/express-validator)
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // For MVP restricted signup — remove or adjust later
      if (signup_key !== process.env.SIGNUP_KEY) {
        return res.status(403).json({ error: 'Invalid signup key' });
      }

      // Check existing user
      if (await User.findByEmail(email)) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      if (await User.findByUsername(username)) {
        return res.status(409).json({ error: 'Username taken' });
      }

      const passwordHash = await hashPassword(password);

      // Default role — usually 'default_user'
      const defaultRole = await Role.findByName('user');
      if (!defaultRole) {
        throw new Error('Default role not found');
      }

      const user = await User.create({
        username,
        email,
        password_hash: passwordHash,
        role_id: defaultRole.id,
        status: 'pending_verification',
      });

      // Create email verification token
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      await AuthToken.create(
        user.id,
        'email_verification',
        tokenHash,
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
      );

      await sendVerificationEmail(user, token);

      res.status(201).json({
        message: 'User registered. Please check your email to verify.',
        userId: user.id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  // GET /auth/verify-email
  static async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({ error: 'Missing token' });
      }

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const authToken = await AuthToken.findValid(tokenHash, 'email_verification');

      if (!authToken) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      await User.update(authToken.user_id, { email_verified: true, status: 'active' });
      await AuthToken.markAsUsed(authToken.id);

      res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Verification failed' });
    }
  }

  // POST /auth/login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user || !user.password_hash) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ error: `Account is ${user.status}` });
      }

      const passwordMatch = await comparePassword(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await User.updateLastLogin(user.id);

      const accessToken = generateAccessToken({ userId: user.id });
      const refreshToken = generateRefreshToken({ userId: user.id });

      // Store refresh token hash
      const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await RefreshToken.create(user.id, refreshHash, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role_id: user.role_id,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // POST /auth/refresh
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const storedToken = await db
        .selectFrom('refresh_tokens')
        .selectAll()
        .where('token_hash', '=', refreshHash)
        .where('revoked_at', 'is', null)
        .where('expires_at', '>', sql`NOW()`)
        .executeTakeFirst();

      if (!storedToken) {
        return res.status(403).json({ error: 'Invalid or expired refresh token' });
      }

      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);

      if (!user || user.status !== 'active') {
        return res.status(403).json({ error: 'User not found or inactive' });
      }

      const newAccessToken = generateAccessToken({ userId: user.id });

      res.json({ accessToken: newAccessToken });
    } catch (error) {
      console.error(error);
      res.status(403).json({ error: 'Token refresh failed' });
    }
  }

  // POST /auth/forgot-password
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        // Security: don't reveal if email exists
        return res.json({ message: 'If the email exists, a reset link has been sent.' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      await AuthToken.create(
        user.id,
        'password_reset',
        tokenHash,
        new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
      );

      await sendPasswordResetEmail(user, token);

      res.json({ message: 'Password reset link sent to email.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error processing request' });
    }
  }

  // POST /auth/reset-password
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password required' });
      }

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const authToken = await AuthToken.findValid(tokenHash, 'password_reset');

      if (!authToken) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      const passwordHash = await hashPassword(newPassword);

      await User.update(authToken.user_id, {
        password_hash: passwordHash,
      });

      await AuthToken.markAsUsed(authToken.id);

      // Optional: revoke all refresh tokens
      await RefreshToken.revokeAllForUser(authToken.user_id);

      res.json({ message: 'Password reset successful. Please log in.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Password reset failed' });
    }
  }

  // POST /auth/logout
  static async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const token = await db
          .selectFrom('refresh_tokens')
          .select('id')
          .where('token_hash', '=', refreshHash)
          .executeTakeFirst();

        if (token) {
          await RefreshToken.revoke(token.id);
        }
      }

      // Invalidate current access token? → client just deletes it
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }
}

module.exports = AuthController;