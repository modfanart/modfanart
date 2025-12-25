import { db, DB } from '../config';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateUserSchema,
  UpdateUserSchema,
  validateModel,
} from '../../validation/model-validation';
import { logger } from '../../utils/logger';

// Standard User Types
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
  socialLinks?: Record<string, any>;
  subscription?: Record<string, any>;
  settings?: Record<string, any>;
}

/**
 * CREATE USER
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
      .insertInto('users') // Use the table name as defined in your Kysely Database type
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
        social_links: user.socialLinks ?? {},
        subscription: user.subscription ?? {},
        settings: user.settings ?? {
          notifications: true,
          marketingEmails: true,
          twoFactorEnabled: false,
        },
      })
      .execute();

    logger.info('User created successfully', { context: 'user-model', data: { userId: user.id } });
    return user;
  } catch (error: any) {
    if (error.message?.includes('unique constraint') || error.message?.includes('duplicate key')) {
      throw new Error(`User with email ${user.email} already exists`);
    }
    throw error;
  }
}

/**
 * GET USER BY ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const result = await db.selectFrom('users').selectAll().where('id', '=', id).executeTakeFirst();

  return result ? mapRowToUser(result) : null;
}

/**
 * GET USER BY EMAIL
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db
    .selectFrom('users')
    .selectAll()
    .where('email', '=', email.toLowerCase().trim())
    .executeTakeFirst();

  return result ? mapRowToUser(result) : null;
}

/**
 * UPDATE USER
 */
export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  const validation = validateModel(userData, UpdateUserSchema, 'updateUser');
  if (!validation.success) throw new Error('Invalid user data');

  return await db.transaction().execute(async (trx) => {
    // 1. Get current user and lock the row (FOR UPDATE)
    const existing = await trx
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .forUpdate()
      .executeTakeFirst();

    if (!existing) return null;

    const updatedAt = new Date();

    // 2. Perform Update
    await trx
      .updateTable('users')
      .set({
        ...userData,
        email: userData.email?.toLowerCase().trim(),
        updated_at: updatedAt,
        // Stringify JSON fields if passing new objects
        social_links: userData.socialLinks ? JSON.stringify(userData.socialLinks) : undefined,
        subscription: userData.subscription ? JSON.stringify(userData.subscription) : undefined,
        settings: userData.settings ? JSON.stringify(userData.settings) : undefined,
      } as any)
      .where('id', '=', id)
      .execute();

    return { ...mapRowToUser(existing), ...userData, updatedAt } as User;
  });
}

/**
 * DELETE USER
 */
export async function deleteUser(id: string): Promise<boolean> {
  const result = await db.deleteFrom('users').where('id', '=', id).executeTakeFirst();

  return Number(result.numDeletedRows) > 0;
}

/**
 * MAPPER
 */
function mapRowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as UserRole,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    profileImageUrl: row.profile_image_url || undefined,
    bio: row.bio || undefined,
    website: row.website || undefined,
    socialLinks:
      typeof row.social_links === 'string' ? JSON.parse(row.social_links) : row.social_links,
    subscription:
      typeof row.subscription === 'string' ? JSON.parse(row.subscription) : row.subscription,
    settings: typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings,
  };
}
