// backend/src/models/user.js
const { db } = require('../config');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

// ─────────────────────────────────────────────
//              Validation Schemas
// ─────────────────────────────────────────────
// Copy these from frontend/validation/model-validation.js
// or define them here if you prefer (recommended for backend isolation)

const z = require('zod');

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['user', 'artist', 'brand', 'creator', 'admin']),
  profileImageUrl: z.string().url().optional(),
  bio: z.string().optional(),
  website: z.string().url().optional(),
  socialLinks: z.record(z.string()).optional(),
  subscription: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
  stripeCustomerId: z.string().optional(),
  stripeEmail: z.string().email().optional(),
});

const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'artist', 'brand', 'creator', 'admin']).optional(),
  profileImageUrl: z.string().url().optional().nullable(),
  bio: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  socialLinks: z.record(z.string()).optional().nullable(),
  subscription: z.record(z.any()).optional().nullable(),
  settings: z.record(z.any()).optional().nullable(),
  stripeCustomerId: z.string().optional().nullable(),
  stripeEmail: z.string().email().optional().nullable(),
}).partial();

// ─────────────────────────────────────────────
//              Helpers
// ─────────────────────────────────────────────

function cleanSocialLinks(links) {
  if (!links) return null;
  const cleaned = {};
  for (const [key, value] of Object.entries(links)) {
    if (typeof value === 'string' && value.trim()) {
      cleaned[key] = value.trim();
    }
  }
  return Object.keys(cleaned).length ? cleaned : null;
}

function mapRowToUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    profileImageUrl: row.profile_image_url ?? undefined,
    bio: row.bio ?? undefined,
    website: row.website ?? undefined,
    socialLinks: row.social_links ?? undefined,
    subscription: row.subscription ?? undefined,
    settings: row.settings ?? undefined,
    stripeCustomerId: row.stripe_customer_id ?? undefined,
    stripeEmail: row.stripe_email ?? undefined,
  };
}

// ─────────────────────────────────────────────
//              CRUD Operations
// ─────────────────────────────────────────────

async function createUser(userData) {
  const validation = CreateUserSchema.safeParse(userData);
  if (!validation.success) {
    throw new Error(`Invalid user data: ${JSON.stringify(validation.error.issues)}`);
  }

  const user = {
    id: uuidv4(),
    ...validation.data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await db
      .insertInto('users')
      .values({
        id: user.id,
        email: user.email.toLowerCase().trim(),
        name: user.name,
        role: user.role,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        profile_image_url: user.profileImageUrl ?? null,
        bio: user.bio ?? null,
        website: user.website ?? null,
        social_links: cleanSocialLinks(user.socialLinks),
        subscription: user.subscription ?? {},
        settings: user.settings ?? {
          notifications: true,
          marketingEmails: true,
          twoFactorEnabled: false,
        },
        stripe_customer_id: user.stripeCustomerId ?? null,
        stripe_email: user.stripeEmail ?? null,
      })
      .execute();

    logger.info('User created successfully', {
      context: 'user-model',
      data: { userId: user.id, email: user.email },
    });

    return user;
  } catch (error) {
    if (error.message?.includes('unique constraint') || error.message?.includes('duplicate key')) {
      throw new Error(`User with email ${user.email} already exists`);
    }
    logger.error('Failed to create user', { error });
    throw error;
  }
}

async function getUserById(id) {
  const result = await db
    .selectFrom('users')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  return result ? mapRowToUser(result) : null;
}

async function getUserByEmail(email) {
  const result = await db
    .selectFrom('users')
    .selectAll()
    .where('email', '=', email.toLowerCase().trim())
    .executeTakeFirst();

  return result ? mapRowToUser(result) : null;
}

async function updateUser(id, userData) {
  const validation = UpdateUserSchema.safeParse(userData);
  if (!validation.success) {
    throw new Error(`Invalid update data: ${JSON.stringify(validation.error.issues)}`);
  }

  const existing = await db
    .selectFrom('users')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!existing) return null;

  const updatedAt = new Date();
  const updateValues = { updated_at: updatedAt };

  if ('name' in userData) updateValues.name = userData.name;
  if ('email' in userData) updateValues.email = userData.email?.toLowerCase().trim() ?? null;
  if ('role' in userData) updateValues.role = userData.role;
  if ('profileImageUrl' in userData) updateValues.profile_image_url = userData.profileImageUrl ?? null;
  if ('bio' in userData) updateValues.bio = userData.bio ?? null;
  if ('website' in userData) updateValues.website = userData.website ?? null;
  if ('socialLinks' in userData) updateValues.social_links = cleanSocialLinks(userData.socialLinks) ?? null;
  if ('subscription' in userData) updateValues.subscription = userData.subscription ?? null;
  if ('settings' in userData) updateValues.settings = userData.settings ?? null;
  if ('stripeCustomerId' in userData) updateValues.stripe_customer_id = userData.stripeCustomerId ?? null;
  if ('stripeEmail' in userData) updateValues.stripe_email = userData.stripeEmail ?? null;

  if (Object.keys(updateValues).length > 1) {
    await db.updateTable('users').set(updateValues).where('id', '=', id).execute();
  }

  const updated = {
    ...mapRowToUser(existing),
    ...userData,
    updatedAt,
  };

  logger.info('User updated', { userId: id });
  return updated;
}

async function deleteUser(id) {
  const result = await db.deleteFrom('users').where('id', '=', id).executeTakeFirst();
  const deleted = Number(result.numDeletedRows) > 0;

  if (deleted) {
    logger.info('User deleted', { userId: id });
  }

  return deleted;
}

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
};