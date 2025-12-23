"use server"

import { revalidatePath } from "next/cache"
import { getUserById, updateUser } from "@/lib/db/models/user"
import { uploadFile } from "@/lib/db/storage"
import { getSession } from "@/lib/auth"

interface ProfileUpdateData {
  name: string
  bio?: string | null
  website?: string | null
  socialLinks?: {
    twitter?: string | null
    instagram?: string | null
    facebook?: string | null
    tiktok?: string | null
    [key: string]: string | null | undefined
  }
  profileImageUrl?: string | null
}

export async function updateUserProfile(data: ProfileUpdateData) {
  try {
    // Get the current session
    const session = await getSession()
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the current user
    const user = await getUserById(session.user.id)
    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Update the user data
    const updatedUser = await updateUser(user.id, {
      name: data.name,
      bio: data.bio || null,
      website: data.website || null,
      socialLinks: {
        ...(user.socialLinks || {}),
        ...(data.socialLinks || {}),
      },
      profileImageUrl: data.profileImageUrl !== undefined ? data.profileImageUrl : user.profileImageUrl,
    })

    if (!updatedUser) {
      return { success: false, error: "Failed to update user" }
    }

    // Revalidate the profile page
    revalidatePath("/profile")

    return { success: true, user: updatedUser }
  } catch (error) {
    console.error("Error updating profile:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

export async function uploadProfileImage(file: File) {
  try {
    // Get the current session
    const session = await getSession()
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "Not authenticated" }
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload the file
    const url = await uploadFile(buffer, file.name, file.type, `profile-images/${session.user.id}`)

    // Update the user's profile image URL
    const user = await getUserById(session.user.id)
    if (user) {
      await updateUser(user.id, {
        profileImageUrl: url,
      })
    }

    return { success: true, url }
  } catch (error) {
    console.error("Error uploading profile image:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

