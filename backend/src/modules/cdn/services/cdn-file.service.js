// services/cdn-file.service.js
const path = require("path");
const fs = require("fs").promises;
const Client = require("ssh2-sftp-client");
const { sql } = require("kysely");
const config = {
  host: process.env.CDN_HOST,
  port: 22,
  username: process.env.CDN_USERNAME,
  password: process.env.CDN_PASSWORD,
};

const REMOTE_BASE_PATH = process.env.CDN_REMOTE_PATH || "/opt/cdn/cdn_mod/storage";
const CDN_BASE_URL = process.env.CDN_BASE_URL || "https://media.modfanofficial.com";

class CDNFileService {
  constructor(cdnFileModel) {
    this.cdnFileModel = cdnFileModel;
  }

  async uploadToCDN(localFilePath, remoteFilename) {
    const sftp = new Client();
    try {
      await sftp.connect(config);

      const remoteFullPath = `${REMOTE_BASE_PATH}/${remoteFilename}`;

      await sftp.mkdir(REMOTE_BASE_PATH, true);   // Create directory if not exists
      await sftp.put(localFilePath, remoteFullPath);

      return `${CDN_BASE_URL}/${remoteFilename}`;
    } finally {
      await sftp.end();
    }
  }

  async createFileRecord(file, uploadedBy = null) {
    const remoteFilename = file.filename;
    
    // Upload file to remote CDN via SFTP
    const url = await this.uploadToCDN(file.path, remoteFilename);

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

    const sftp = new Client();
    try {
      await sftp.connect(config);
      const remotePath = `${REMOTE_BASE_PATH}/${file.stored_name}`;
      await sftp.delete(remotePath);
    } catch (err) {
      console.warn("Failed to delete from CDN:", err.message);
    } finally {
      await sftp.end();
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