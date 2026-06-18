const CDNFileService = require("./services/cdn-file.service");
const cdnFileModel = require("./models/cdn-file.model"); // adjust path if needed

const cdnService = new CDNFileService(cdnFileModel);

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const file = await cdnService.createFileRecord(
      req.file,
      req.user?.id || null
    );

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
    const files = await cdnService.listFiles();

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
    const file = await cdnService.getFile(req.params.id);

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
    const file = await cdnService.getFile(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    await cdnService.deleteFile(req.params.id);

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};