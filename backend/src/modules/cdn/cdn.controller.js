// src/controllers/cdn.controller.js

const CDNFileService = require("../services/cdnFile.service");

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const file = await CDNFileService.createFileRecord({
      file: req.file,
      uploadedBy: req.user?.id || null,
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: file,
    });
  } catch (error) {
    next(error);
  }
};

exports.listFiles = async (req, res, next) => {
  try {
    const files = await CDNFileService.listFiles();

    return res.status(200).json({
      success: true,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};

exports.getFileById = async (req, res, next) => {
  try {
    const file = await CDNFileService.getFileById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const file = await CDNFileService.getFileById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    await CDNFileService.deleteFile(file);

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
