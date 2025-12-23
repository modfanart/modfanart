import { postgresClient, DB } from "../config"
import { v4 as uuidv4 } from "uuid"
import { CreateUserSchema, UpdateUserSchema, validateModel } from "../../validation/model-validation"
import { logger } from "../../utils/logger"

export type UserRole = "artist" | "brand" | "creator" | "admin"
export type SubscriptionTier = "free" | "premium_artist" | "creator" | "enterprise"
export type SubscriptionStatus = "active" | "inactive" | "past_due" | "canceled"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  profileImageUrl?: string
  bio?: string
  website?: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    facebook?: string
    tiktok?: string
  }
  subscription?: {
    tier: SubscriptionTier
    status: SubscriptionStatus
    renewalDate?: string
    customerId?: string
  }
  settings?: {
    notifications: boolean
    marketingEmails: boolean
    twoFactorEnabled: boolean
  }
}

export async function createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
  // Validate input data
  const validation = validateModel(userData, CreateUserSchema, "createUser")
  if (!validation.success) {
    throw new Error(`Invalid user data: ${JSON.stringify(validation.errors?.errors)}`)
  }

  const id = uuidv4()
  const now = new Date()

  const user: User = {
    id,
    ...userData,
    createdAt: now,
    updatedAt: now,
  }

  try {
    await postgresClient.sql`
      INSERT INTO ${DB.USERS} (
        id, email, name, role, created_at, updated_at, 
        profile_image_url, bio, website, social_links, 
        subscription, settings
      ) VALUES (
        ${user.id}, ${user.email}, ${user.name}, ${user.role}, 
        ${user.createdAt}, ${user.updatedAt}, 
        ${user.profileImageUrl || null}, ${user.bio || null}, 
        ${user.website || null}, ${JSON.stringify(user.socialLinks || {})}, 
        ${JSON.stringify(user.subscription || {})}, 
        ${JSON.stringify(user.settings || { notifications: true, marketingEmails: true, twoFactorEnabled: false })}
      )
    `
    logger.info("User created successfully", {
      context: "user-model",
      data: { userId: user.id, email: user.email },
    })
    return user
  } catch (error) {
    logger.error("Failed to create user", {
      context: "user-model",
      error,
      data: { email: user.email },
    })

    // Check for duplicate email
    if (error.message?.includes("duplicate key") && error.message?.includes("email")) {
      throw new Error(`User with email ${user.email} already exists`)
    }

    throw new Error(`Failed to create user: ${error.message}`)
  }
}

export async function getUserById(id: string): Promise<User | null> {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid user ID")
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.USERS} WHERE id = ${id}
    `

    if (result.rows.length === 0) {
      return null
    }

    return mapRowToUser(result.rows[0])
  } catch (error) {
    logger.error("Failed to get user by ID", {
      context: "user-model",
      error,
      data: { userId: id },
    })
    throw new Error(`Failed to get user: ${error.message}`)
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!email || typeof email !== "string") {
    throw new Error("Invalid email")
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.USERS} WHERE email = ${email}
    `

    if (result.rows.length === 0) {
      return null
    }

    return mapRowToUser(result.rows[0])
  } catch (error) {
    logger.error("Failed to get user by email", {
      context: "user-model",
      error,
      data: { email },
    })
    throw new Error(`Failed to get user: ${error.message}`)
  }
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  // Validate input data
  const validation = validateModel(userData, UpdateUserSchema, "updateUser")
  if (!validation.success) {
    throw new Error(`Invalid user data: ${JSON.stringify(validation.errors?.errors)}`)
  }

  try {
    // Start transaction
    const client = await postgresClient.connect()

    try {
      await client.sql`BEGIN`

      // Get current user data
      const getUserResult = await client.sql`
        SELECT * FROM ${DB.USERS} WHERE id = ${id} FOR UPDATE
      `

      if (getUserResult.rows.length === 0) {
        await client.sql`ROLLBACK`
        return null
      }

      const currentUser = mapRowToUser(getUserResult.rows[0])

      const updatedUser = {
        ...currentUser,
        ...userData,
        updatedAt: new Date(),
      }

      await client.sql`
        UPDATE ${DB.USERS} SET
          name = ${updatedUser.name},
          email = ${updatedUser.email},
          role = ${updatedUser.role},
          updated_at = ${updatedUser.updatedAt},
          profile_image_url = ${updatedUser.profileImageUrl || null},
          bio = ${updatedUser.bio || null},
          website = ${updatedUser.website || null},
          social_links = ${JSON.stringify(updatedUser.socialLinks || {})},
          subscription = ${JSON.stringify(updatedUser.subscription || {})},
          settings = ${JSON.stringify(updatedUser.settings || {})}
        WHERE id = ${id}
      `

      await client.sql`COMMIT`

      logger.info("User updated successfully", {
        context: "user-model",
        data: { userId: id },
      })

      return updatedUser
    } catch (error) {
      await client.sql`ROLLBACK`
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    logger.error("Failed to update user", {
      context: "user-model",
      error,
      data: { userId: id },
    })

    // Check for duplicate email
    if (error.message?.includes("duplicate key") && error.message?.includes("email")) {
      throw new Error(`User with email ${userData.email} already exists`)
    }

    throw new Error(`Failed to update user: ${error.message}`)
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid user ID")
  }

  try {
    const result = await postgresClient.sql`
      DELETE FROM ${DB.USERS} WHERE id = ${id}
    `

    const deleted = result.rowCount > 0

    if (deleted) {
      logger.info("User deleted successfully", {
        context: "user-model",
        data: { userId: id },
      })
    } else {
      logger.warn("User not found for deletion", {
        context: "user-model",
        data: { userId: id },
      })
    }

    return deleted
  } catch (error) {
    logger.error("Failed to delete user", {
      context: "user-model",
      error,
      data: { userId: id },
    })
    throw new Error(`Failed to delete user: ${error.message}`)
  }
}

function mapRowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    profileImageUrl: row.profile_image_url,
    bio: row.bio,
    website: row.website,
    socialLinks: row.social_links,
    subscription: row.subscription,
    settings: row.settings,
  }
}

