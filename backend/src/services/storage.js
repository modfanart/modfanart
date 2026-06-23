// backend/src/services/storage.js
const { put, del, list, head } = require('@vercel/blob');
const { logger } = require('../utils/logger');

// Config (you can move this to config/index.js)
const config = {
  blob: {
    maxSizeBytes: 20 * 1024 * 1024, // 20MB default
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      // add more as needed
    ],
  },
};

/**
 * Validates file before upload
 * @param {Buffer} buffer
 * @param {string} contentType
 * @param {number} [maxSizeBytes]
 * @returns {{ valid: boolean, error?: string }}
 */
function validateFile(buffer, contentType, maxSizeBytes) {
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
      error: `File type ${contentType} is not allowed. Allowed types: ${config.blob.allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a file to Vercel Blob Store
 * @param {Buffer} buffer
 * @param {Object} options
 * @param {string} options.filename
 * @param {string} options.contentType
 * @param {number} [options.maxSizeBytes]
 * @param {string} [options.folder='submissions']
 * @returns {Promise<StoredFile>}
 */
async function uploadFile(buffer, options) {
  const { filename, contentType, maxSizeBytes, folder = 'submissions' } = options;

  // Validate file
  const validation = validateFile(buffer, contentType, maxSizeBytes);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate unique pathname
  const pathname = `${folder}/${Date.now()}-${filename}`;

  logger.info(`Uploading file to Vercel Blob: ${pathname}`, {
    context: 'storage',
    size: buffer.length,
    contentType,
  });

  try {
    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType || contentType,
      size: buffer.length,
      uploadedAt: new Date(),
    };
  } catch (error) {
    logger.error('Error uploading file to Vercel Blob', {
      context: 'storage',
      error: error.message,
      pathname,
    });
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Deletes a file from Vercel Blob Store
 * @param {string} pathname
 * @returns {Promise<boolean>} true if deleted, false if not found/error
 */
async function deleteFile(pathname) {
  try {
    logger.info(`Deleting file from Vercel Blob: ${pathname}`, { context: 'storage' });
    await del(pathname);
    return true;
  } catch (error) {
    logger.error('Error deleting file from Vercel Blob', {
      context: 'storage',
      error: error.message,
      pathname,
    });
    return false;
  }
}

/**
 * Lists files in a folder (prefix)
 * @param {string} [folder='submissions']
 * @returns {Promise<StoredFile[]>}
 */
async function listFiles(folder = 'submissions') {
  try {
    const prefix = folder.endsWith('/') ? folder : `${folder}/`;
    const { blobs } = await list({ prefix });

    return blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      contentType: 'application/octet-stream', // fallback (head() can get real type if needed)
      size: blob.size,
      uploadedAt: new Date(blob.uploadedAt),
    }));
  } catch (error) {
    logger.error('Error listing files from Vercel Blob', {
      context: 'storage',
      error: error.message,
      prefix: folder,
    });
    return [];
  }
}

/**
 * Gets full metadata for a single file
 * @param {string} pathname
 * @returns {Promise<StoredFile | null>}
 */
async function getFileMetadata(pathname) {
  try {
    const blob = await head(pathname);
    if (!blob) return null;

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType || 'application/octet-stream',
      size: blob.size,
      uploadedAt: new Date(blob.uploadedAt),
    };
  } catch (error) {
    logger.warn('Failed to get file metadata', { pathname, error: error.message });
    return null;
  }
}

/**
 * Check if file exists (legacy alias)
 * @param {string} pathname
 * @returns {Promise<boolean>}
 */
async function fileExists(pathname) {
  return (await getFileMetadata(pathname)) !== null;
}

module.exports = {
  validateFile,
  uploadFile,
  deleteFile,
  listFiles,
  getFileMetadata,
  fileExists,
};