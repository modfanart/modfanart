import { put, del, list, head } from '@vercel/blob';
import { config } from '../config';
import { logger } from '../logger';

// Types
export type UploadOptions = {
  filename: string;
  contentType: string;
  maxSizeBytes?: number;
  folder?: string;
};

export type StoredFile = {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
};

/**
 * Validates file before upload
 */
export function validateFile(
  buffer: Buffer,
  contentType: string,
  maxSizeBytes?: number
): { valid: boolean; error?: string } {
  const actualMaxSize = maxSizeBytes || config.blob.maxSizeBytes;
  if (buffer.length > actualMaxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${actualMaxSize / 1024 / 1024}MB`,
    };
  }

  if (!config.blob.allowedTypes.includes(contentType)) {
    return {
      valid: false,
      error: `File type ${contentType} is not allowed. Allowed types: ${config.blob.allowedTypes.join(
        ', '
      )}`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a file to the Blob Store
 */
export async function uploadFile(buffer: Buffer, options: UploadOptions): Promise<StoredFile> {
  try {
    const { filename, contentType, maxSizeBytes, folder = 'submissions' } = options;

    // Validate file
    const validation = validateFile(buffer, contentType, maxSizeBytes);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generate unique pathname
    const pathname = `${folder}/${Date.now()}-${filename}`;

    logger.info(`Uploading file to Blob Store: ${pathname}`, {
      context: 'storage',
      size: buffer.length,
      contentType,
    });

    // Upload
    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType,
    });

    // Use current time as uploadedAt (very close approximation)
    // Size is known from buffer
    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType ?? contentType,
      size: buffer.length,
      uploadedAt: new Date(), // Immediate timestamp – accurate enough for most use cases
    };
  } catch (error) {
    logger.error('Error uploading file to Blob Store', { context: 'storage', error });
    throw new Error(`Failed to upload file: ${(error as Error).message}`);
  }
}

/**
 * Deletes a file from the Blob Store
 */
export async function deleteFile(pathname: string): Promise<boolean> {
  try {
    logger.info(`Deleting file from Blob Store: ${pathname}`, { context: 'storage' });
    await del(pathname);
    return true;
  } catch (error) {
    logger.error('Error deleting file from Blob Store', { context: 'storage', error });
    return false;
  }
}

/**
 * Lists files in a folder
 */
export async function listFiles(folder: string = 'submissions'): Promise<StoredFile[]> {
  try {
    const prefix = folder.endsWith('/') ? folder : `${folder}/`;
    const { blobs } = await list({ prefix });

    return blobs.map((blob) => ({
      url: blob.url,
      pathname: blob.pathname,
      contentType: 'application/octet-stream', // fallback since not provided by list()
      size: blob.size,
      uploadedAt: new Date(blob.uploadedAt), // uploadedAt is a Date object here
    }));
  } catch (error) {
    logger.error('Error listing files from Blob Store', { context: 'storage', error });
    return [];
  }
}

/**
 * Gets full metadata for a single file (including accurate uploadedAt and contentType)
 */
export async function getFileMetadata(pathname: string): Promise<StoredFile | null> {
  try {
    const blob = await head(pathname);

    // head() returns null if not found
    if (!blob) return null;

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType ?? 'application/octet-stream',
      size: blob.size,
      uploadedAt: new Date(blob.uploadedAt),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Legacy alias for backward compatibility
 */
export const fileExists = async (pathname: string): Promise<boolean> => {
  return (await getFileMetadata(pathname)) !== null;
};
