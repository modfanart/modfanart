import { db } from '../config'; // assuming only db is needed (remove DB if unused)
import { v4 as uuidv4 } from 'uuid';
import {
  CreateUserSchema,
  UpdateUserSchema,
  validateModel,
} from '../../validation/model-validation';
import { logger } from '../../utils/logger';

// ─────────────────────────────────────────────
//              User Type Definitions
// ─────────────────────────────────────────────

export type UserRole = 'artist' | 'brand' | 'creator' | 'admin';

export type SubscriptionTier = 'free' | 'premium_artist' | 'creator' | 'enterprise';

export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'canceled';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  profileImageUrl?: string;
  bio?: string;
  website?: string;
  /**
   * Social media profile URLs.
   * Known platforms are typed for better autocompletion and safety.
   * Unknown platforms are still allowed via index signature.
   */
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
    [key: string]: string | undefined; // allow future/unknown platforms
  };
  subscription?: Record<string, any>;
  settings?: Record<string, any>;
}

// Add at top of file or in utils
function cleanSocialLinks(links?: User['socialLinks']): Record<string, string> | null {
  if (!links) return null;

  const cleaned: Record<string, string> = {};
  for (const [key, value] of Object.entries(links)) {
    if (typeof value === 'string' && value.trim() !== '') {
      cleaned[key] = value.trim();
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : null;
}

/**
 * Creates a new user in the database.
 */
export async function createUser(
  userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
): Promise<User> {
  const validation = validateModel(userData, CreateUserSchema, 'createUser');
  if (!validation.success) {
    throw new Error(`Invalid user data: ${JSON.stringify(validation.errors)}`);
  }

  const user: User = {
    id: uuidv4(),
    ...userData,
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
        social_links: cleanSocialLinks(user.socialLinks), // ← fixed here
        subscription: user.subscription ?? {},
        settings: user.settings ?? {
          notifications: true,
          marketingEmails: true,
          twoFactorEnabled: false,
        },
      })
      .execute();

    logger.info('User created successfully', {
      context: 'user-model',
      data: { userId: user.id, email: user.email },
    });

    return user;
  } catch (error: any) {
    if (error.message?.includes('unique constraint') || error.message?.includes('duplicate key')) {
      throw new Error(`User with email ${user.email} already exists`);
    }
    throw error;
  }
}
// ─────────────────────────────────────────────
//              GET USER
// ─────────────────────────────────────────────

/**
 * Retrieves a user by their ID.
 */
export async function getUserById(id: string): Promise<User | null> {
  const result = await db.selectFrom('users').selectAll().where('id', '=', id).executeTakeFirst();

  return result ? mapRowToUser(result) : null;
}

/**
 * Retrieves a user by their email (case-insensitive).
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db
    .selectFrom('users')
    .selectAll()
    .where('email', '=', email.toLowerCase().trim())
    .executeTakeFirst();

  return result ? mapRowToUser(result) : null;
}

// ─────────────────────────────────────────────
//              UPDATE USER
// ─────────────────────────────────────────────

/**
 * Updates an existing user with partial data.
 * Uses transaction + FOR UPDATE lock to prevent race conditions.
 */
export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  const validation = validateModel(userData, UpdateUserSchema, 'updateUser');
  if (!validation.success) {
    throw new Error(`Invalid update data: ${JSON.stringify(validation.errors)}`);
  }

  return await db.transaction().execute(async (trx) => {
    const existing = await trx
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .forUpdate()
      .executeTakeFirst();

    if (!existing) return null;

    const updatedAt = new Date();

    const updateValues: Partial<Record<keyof typeof existing, any>> = {
      updated_at: updatedAt,
    };

    // ── Scalar fields ────────────────────────────────────────
    if ('name' in userData) {
      updateValues.name = userData.name; // string | undefined is fine → DB allows NULL
    }

    if ('email' in userData) {
      updateValues.email = userData.email?.toLowerCase().trim() ?? null;
    }

    if ('role' in userData) {
      updateValues.role = userData.role;
    }

    if ('profileImageUrl' in userData) {
      updateValues.profile_image_url = userData.profileImageUrl ?? null;
    }

    if ('bio' in userData) {
      updateValues.bio = userData.bio ?? null;
    }

    if ('website' in userData) {
      updateValues.website = userData.website ?? null;
    }

    // ── JSONB fields ─────────────────────────────────────────
    // We only set them if explicitly provided (even if value is {})
    if ('socialLinks' in userData) {
      updateValues.social_links = userData.socialLinks ?? null; // null clears the field
    }

    if ('subscription' in userData) {
      updateValues.subscription = userData.subscription ?? null;
    }

    if ('settings' in userData) {
      updateValues.settings = userData.settings ?? null;
    }

    // Only execute update if there is something to update besides updated_at
    if (Object.keys(updateValues).length > 1) {
      // >1 because updated_at is always there
      await trx.updateTable('users').set(updateValues).where('id', '=', id).execute();
    }

    // Return merged object (existing + updates)
    const updatedRow = {
      ...mapRowToUser(existing),
      ...userData,
      updatedAt,
    } as User;

    return updatedRow;
  });
}
// ─────────────────────────────────────────────
//              DELETE USER
// ─────────────────────────────────────────────

/**
 * Deletes a user by ID.
 * @returns true if a row was deleted, false otherwise
 */
export async function deleteUser(id: string): Promise<boolean> {
  const result = await db.deleteFrom('users').where('id', '=', id).executeTakeFirst();

  return Number(result.numDeletedRows) > 0;
}

// ─────────────────────────────────────────────
//              ROW MAPPER
// ─────────────────────────────────────────────

/**
 * Maps raw database row to typed User object.
 * Handles snake_case → camelCase conversion and optional fields.
 */
function mapRowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as UserRole,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    profileImageUrl: row.profile_image_url ?? undefined,
    bio: row.bio ?? undefined,
    website: row.website ?? undefined,
    socialLinks: row.social_links ?? undefined,
    subscription: row.subscription ?? undefined,
    settings: row.settings ?? undefined,
  };
}
