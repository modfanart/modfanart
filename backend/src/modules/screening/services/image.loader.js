// Fetches the bytes of a stored artwork so the adapters can post them to providers.
//
// The worker reads from S3 with credentials rather than following the public CDN URL: the bucket
// may not be public, a CDN edge can serve a stale object, and a signed read is the only way to be
// certain the bytes screened are the bytes stored. Plain HTTPS is kept as a fallback for artworks
// whose URL predates the current CDN base.
const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");

// Provider byte caps. Exceeding them is a permanent failure, not something a retry fixes, so the
// adapters check before spending a call.
const AIORNOT_MAX_BYTES = 50 * 1024 * 1024;
const OPENAI_MAX_BYTES = 20 * 1024 * 1024;

let cachedClient = null;

function s3Client() {
  if (!cachedClient) {
    // Constructed lazily so importing this module has no side effects and env changes in tests
    // are picked up.
    cachedClient = new S3Client({
      region: process.env.AWS_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: !!process.env.S3_ENDPOINT,
    });
  }
  return cachedClient;
}

function cdnBaseUrl() {
  return (
    process.env.CDN_BASE_URL ||
    `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`
  );
}

/** Recovers the S3 key from a stored URL. Mirrors CDNFileService.keyFromUrl. */
function keyFromUrl(url) {
  const base = cdnBaseUrl();
  return url?.startsWith(`${base}/`) ? url.slice(base.length + 1) : null;
}

function contentTypeToExtension(contentType) {
  const map = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/tiff": "tiff",
    "image/heic": "heic",
    "image/heif": "heif",
  };
  return map[contentType] ?? "jpg";
}

/**
 * @param {string} fileUrl
 * @returns {Promise<{buffer: Buffer, contentType: string, bytes: number, filename: string}>}
 */
async function loadImage(fileUrl) {
  if (!fileUrl) {
    throw new Error("Cannot screen an artwork with no file_url");
  }

  const key = keyFromUrl(fileUrl);
  let buffer;
  let contentType;

  if (key && process.env.S3_BUCKET_NAME) {
    const response = await s3Client().send(
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key })
    );
    buffer = Buffer.from(await response.Body.transformToByteArray());
    contentType = response.ContentType || "image/jpeg";
  } else {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch artwork image: ${response.status}`);
    }
    buffer = Buffer.from(await response.arrayBuffer());
    contentType = response.headers.get("content-type") || "image/jpeg";
  }

  return {
    buffer,
    contentType,
    bytes: buffer.byteLength,
    filename: `artwork.${contentTypeToExtension(contentType)}`,
  };
}

/** A data URL, which is how the OpenAI endpoints accept image bytes we hold in memory. */
function toDataUrl(image) {
  return `data:${image.contentType};base64,${image.buffer.toString("base64")}`;
}

module.exports = {
  AIORNOT_MAX_BYTES,
  OPENAI_MAX_BYTES,
  keyFromUrl,
  loadImage,
  toDataUrl,
};
