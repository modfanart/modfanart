// services/cdn-file.service.js
const path = require("path");
const fs = require("fs").promises;
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({ region: process.env.AWS_REGION });

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_KEY_PREFIX = process.env.S3_KEY_PREFIX || "artworks";
const CDN_BASE_URL =
  process.env.CDN_BASE_URL || `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

class CDNFileService {
  constructor(cdnFileModel) {
    this.cdnFileModel = cdnFileModel;
  }

  async uploadToCDN(localFilePath, remoteFilename, mimeType, keyPrefix = S3_KEY_PREFIX) {
    const key = `${keyPrefix}/${remoteFilename}`;
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

  async createFileRecord(file, uploadedBy = null, keyPrefix = S3_KEY_PREFIX) {
    const remoteFilename = file.filename;

    // Upload file to S3
    const url = await this.uploadToCDN(file.path, remoteFilename, file.mimetype, keyPrefix);

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

  // Objects can live under different prefixes (artworks, avatars), so recover the
  // key from the stored URL instead of assuming the default prefix.
  keyFromUrl(url) {
    return url?.startsWith(`${CDN_BASE_URL}/`)
      ? url.slice(CDN_BASE_URL.length + 1)
      : null;
  }

  async deleteFile(id) {
    const file = await this.cdnFileModel.findById(id);
    if (!file) return false;

    try {
      const key = this.keyFromUrl(file.url) || `${S3_KEY_PREFIX}/${file.stored_name}`;
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