// backend/src/services/auth.service.js
const jwt = require('jsonwebtoken');
const { db } = require('../config');
const { logger } = require('../utils/logger');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is required in .env');

// Find or create user from Google profile
async function findOrCreateUser(profile) {
  if (!profile.email) throw new Error('No email from Google');

  const email = profile.email.toLowerCase().trim();

  // Try to find existing user
  const existing = await db
    .selectFrom('users')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst();

  if (existing) {
    logger.info('User found via Google login', { email });
    return mapRowToUser(existing);
  }

  // Create new user
  const userId = require('uuid').v4();
  const now = new Date();

  const newUser = {
    id: userId,
    email,
    name: profile.name || 'Google User',
    role: 'user',
    profileImageUrl: profile.picture || null,
    createdAt: now,
    updatedAt: now,
  };

  await db
    .insertInto('users')
    .values({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      profile_image_url: newUser.profileImageUrl,
      created_at: newUser.createdAt,
      updated_at: newUser.updatedAt,
    })
    .execute();

  logger.info('New user created via Google', { userId, email });
  return newUser;
}

function mapRowToUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    profileImageUrl: row.profile_image_url,
    // add other fields if needed
  };
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}

module.exports = {
  findOrCreateUser,
  generateToken,
  verifyToken,
};