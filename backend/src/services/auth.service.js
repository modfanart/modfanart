const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../config');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is required in .env');

const SALT_ROUNDS = 12;

// ─────────────────────────────────────────────
//              User Mapper (shared)
// ─────────────────────────────────────────────

function mapRowToUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    profileImageUrl: row.profile_image_url ?? null,
    bio: row.bio ?? null,
    website: row.website ?? null,
    socialLinks: row.social_links ?? null,
    subscription: row.subscription ?? null,
    settings: row.settings ?? null,
    stripeCustomerId: row.stripe_customer_id ?? null,
    stripeEmail: row.stripe_email ?? null,
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    // IMPORTANT: never return password_hash in the public user object
  };
}

// ─────────────────────────────────────────────
//              Google OAuth Flow
// ─────────────────────────────────────────────

async function findOrCreateUserGoogle(profile) {
  if (!profile?.email) {
    throw new Error('Google profile missing email');
  }

  const email = profile.email.toLowerCase().trim();

  let user = await db
    .selectFrom('users')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst();

  if (user) {
    logger.info('Existing user authenticated via Google', {
      email,
      userId: user.id,
    });
    return mapRowToUser(user);
  }

  // Create new user from Google data
  const now = new Date();
  const userId = uuidv4();

  await db
    .insertInto('users')
    .values({
      id: userId,
      email,
      name: profile.name || 'Google User',
      role: 'user',
      profile_image_url: profile.picture || null,
      created_at: now,
      updated_at: now,
      // defaults for other nullable fields are handled by DB or model
    })
    .execute();

  // Fetch the freshly created row to return consistent shape
  user = await db
    .selectFrom('users')
    .selectAll()
    .where('id', '=', userId)
    .executeTakeFirst();

  logger.info('New user created via Google', { userId, email });

  return mapRowToUser(user);
}

// ─────────────────────────────────────────────
//              Email/Password Helpers
// ─────────────────────────────────────────────

async function findUserByEmailForAuth(email) {
  const row = await db
    .selectFrom('users')
    .select(['id', 'email', 'name', 'role', 'password_hash'])
    .where('email', '=', email.toLowerCase().trim())
    .executeTakeFirst();

  return row || null;
}

async function createUserWithPassword({
  email,
  name,
  password,
  role = 'user',
}) {
  const emailClean = email.toLowerCase().trim();

  // Double-check (controller should do this, but defense in depth)
  const exists = await findUserByEmailForAuth(emailClean);
  if (exists) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const now = new Date();
  const userId = uuidv4();

  await db
    .insertInto('users')
    .values({
      id: userId,
      email: emailClean,
      name: name.trim(),
      role,
      password_hash: passwordHash,
      created_at: now,
      updated_at: now,
    })
    .execute();

  const newUserRow = await db
    .selectFrom('users')
    .selectAll()
    .where('id', '=', userId)
    .executeTakeFirst();

  logger.info('New local user created', { userId, email: emailClean });

  return mapRowToUser(newUserRow);
}

async function verifyPassword(userRow, password) {
  if (!userRow.password_hash) {
    throw new Error('This account has no password set (possibly OAuth only)');
  }
  return bcrypt.compare(password, userRow.password_hash);
}

// ─────────────────────────────────────────────
//              JWT
// ─────────────────────────────────────────────

function generateToken(user) {
  const payload = {
    sub: user.id, // more standard than just "id"
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d', // consider shorter + refresh token in production
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (err.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw err;
  }
}

module.exports = {
  // Google OAuth
  findOrCreateUserGoogle,

  // Email/password
  findUserByEmailForAuth,
  createUserWithPassword,
  verifyPassword,

  // JWT
  generateToken,
  verifyToken,

  // Shared mapper (useful in controllers too)
  mapRowToUser,
};
