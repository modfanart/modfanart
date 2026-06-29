// controllers/cdn.controller.js
const CDNFileService = require("./services/cdn-file.service");
const cdnFileModel = require("./models/cdn-file.model");

const cdnService = new CDNFileService(cdnFileModel);

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "File is required" });
    }

    const fileRecord = await cdnService.createFileRecord(req.file, req.user?.id);

    require("fs").promises.unlink(req.file.path).catch(() => {});

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        id: fileRecord.id,
        url: fileRecord.url,
        original_name: fileRecord.original_name,
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.listFiles = async (req, res, next) => {
  try {
    const files = await cdnService.listFiles();
    res.status(200).json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
};

exports.getFileById = async (req, res, next) => {
  try {
    const file = await cdnService.getFile(req.params.id);
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    res.status(200).json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const deleted = await cdnService.deleteFile(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    res.status(200).json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    next(error);
  }
};