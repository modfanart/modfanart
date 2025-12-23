import { put, del, list, head } from "@vercel/blob"
import { config } from "../config"
import { logger } from "../logger"

// Types
export type UploadOptions = {
  filename: string
  contentType: string
  maxSizeBytes?: number
  folder?: string
}

export type StoredFile = {
  url: string
  pathname: string
  contentType: string
  size: number
  uploadedAt: Date
}

/**
 * Validates file before upload
 */
export function validateFile(
  buffer: Buffer,
  contentType: string,
  maxSizeBytes?: number,
): { valid: boolean; error?: string } {
  // Check file size
  const actualMaxSize = maxSizeBytes || config.blob.maxSizeBytes
  if (buffer.length > actualMaxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${actualMaxSize / 1024 / 1024}MB`,
    }
  }

  // Check file type
  if (!config.blob.allowedTypes.includes(contentType)) {
    return {
      valid: false,
      error: `File type ${contentType} is not allowed. Allowed types: ${config.blob.allowedTypes.join(", ")}`,
    }
  }

  return { valid: true }
}

/**
 * Uploads a file to the Blob Store
 */
export async function uploadFile(buffer: Buffer, options: UploadOptions): Promise<StoredFile> {
  try {
    const { filename, contentType, maxSizeBytes, folder = "submissions" } = options

    // Validate file
    const validation = validateFile(buffer, contentType, maxSizeBytes)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Generate path with folder structure
    const pathname = `${folder}/${Date.now()}-${filename}`

    logger.info(`Uploading file to Blob Store: ${pathname}`, {
      context: "storage",
      size: buffer.length,
      contentType,
    })

    // Upload to Blob Store
    const blob = await put(pathname, buffer, {
      contentType,
      access: "public",
    })

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: buffer.length,
      uploadedAt: new Date(),
    }
  } catch (error) {
    logger.error("Error uploading file to Blob Store", error, { context: "storage" })
    throw new Error(`Failed to upload file: ${(error as Error).message}`)
  }
}

/**
 * Deletes a file from the Blob Store
 */
export async function deleteFile(pathname: string): Promise<boolean> {
  try {
    logger.info(`Deleting file from Blob Store: ${pathname}`, { context: "storage" })
    await del(pathname)
    return true
  } catch (error) {
    logger.error("Error deleting file from Blob Store", error, { context: "storage" })
    return false
  }
}

/**
 * Lists files in a folder
 */
export async function listFiles(folder: string): Promise<StoredFile[]> {
  try {
    const { blobs } = await list({ prefix: folder })

    return blobs.map((blob) => ({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType || "application/octet-stream",
      size: blob.size,
      uploadedAt: new Date(blob.uploadedAt),
    }))
  } catch (error) {
    logger.error("Error listing files from Blob Store", error, { context: "storage" })
    return []
  }
}

/**
 * Checks if a file exists
 */
export async function fileExists(pathname: string): Promise<boolean> {
  try {
    const result = await head(pathname)
    return !!result
  } catch (error) {
    return false
  }
}

