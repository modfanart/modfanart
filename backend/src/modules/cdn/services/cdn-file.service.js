// services/cdn-file.service.js
const path = require("path");
const fs = require("fs").promises;
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

// S3_ENDPOINT lets this point at an S3-compatible provider (e.g. Cloudflare
// R2) instead of real AWS. R2 requires path-style addressing (no
// <bucket>.<account>.r2.cloudflarestorage.com virtual-hosted style), so
// forcePathStyle is tied to whether a custom endpoint is set at all.
const s3 = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: !!process.env.S3_ENDPOINT,
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_KEY_PREFIX = process.env.S3_KEY_PREFIX || "artworks";
const CDN_BASE_URL =
  process.env.CDN_BASE_URL || `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

class CDNFileService {
  constructor(cdnFileModel) {
    this.cdnFileModel = cdnFileModel;
  }

  async uploadToCDN(localFilePath, remoteFilename, mimeType) {
    const key = `${S3_KEY_PREFIX}/${remoteFilename}`;
    const body = await fs.readFile(localFilePath);

    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: mimeType,
      })
    );

    return `${CDN_BASE_URL}/${key}`;
  }

  async createFileRecord(file, uploadedBy = null) {
    const remoteFilename = file.filename;

    // Upload file to S3
    const url = await this.uploadToCDN(file.path, remoteFilename, file.mimetype);

    const record = {
      original_name: file.originalname,
      stored_name: remoteFilename,
      mime_type: file.mimetype,
      extension: path.extname(file.originalname).toLowerCase(),
      size: file.size,
      path: file.path,                    // temporary local path
      url: url,
      uploaded_by: uploadedBy,
    };

    const savedRecord = await this.cdnFileModel.create(record);

    // Clean up temporary local file after successful upload
    await this.deleteTempFile(file.path);

    return savedRecord;
  }

  async deleteTempFile(localPath) {
    try {
      await fs.unlink(localPath);
    } catch (err) {
      console.warn(`Failed to delete temp file: ${localPath}`, err.message);
    }
  }

  async deleteFile(id) {
    const file = await this.cdnFileModel.findById(id);
    if (!file) return false;

    try {
      const key = `${S3_KEY_PREFIX}/${file.stored_name}`;
      await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key }));
    } catch (err) {
      console.warn("Failed to delete from CDN:", err.message);
    }

    return this.cdnFileModel.delete(id);
  }

  async getFile(id) {
    return this.cdnFileModel.findById(id);
  }

  async listFiles() {
    return this.cdnFileModel.list();
  }
}

module.exports = CDNFileService;