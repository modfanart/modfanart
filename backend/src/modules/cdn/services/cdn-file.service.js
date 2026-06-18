const path = require("path");

const CDN_BASE_URL =
  process.env.CDN_BASE_URL || "https://media.modfanofficial.com/storage";

class CDNFileService {
  constructor(cdnFileModel) {
    this.cdnFileModel = cdnFileModel;
  }

  async createFileRecord(file, uploadedBy = null) {
    const record = {
      original_name: file.originalname,
      stored_name: file.filename,

      mime_type: file.mimetype,
      extension: path.extname(file.originalname),

      size: file.size,

      path: file.path,

      url: `${CDN_BASE_URL}/${file.filename}`,

      uploaded_by: uploadedBy,
    };

    return this.cdnFileModel.create(record);
  }

  async getFile(id) {
    return this.cdnFileModel.findById(id);
  }

  async listFiles() {
    return this.cdnFileModel.list();
  }

  async deleteFile(id) {
    return this.cdnFileModel.delete(id);
  }
}

module.exports = CDNFileService;
