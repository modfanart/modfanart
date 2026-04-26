// backend/src/controllers/audit.controller.js
const {
  createAuditLog,
  getAuditLogById,
  getAuditLogsByUserId,
  searchAuditLogs,
} = require('../models/auditedEvent.model');
const { db } = require('../config');
async function createAuditLogHandler(req, res, next) {
  try {
    const log = await createAuditLog(req.body);
    res.status(201).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
}

async function getAuditLogByIdHandler(req, res, next) {
  try {
    const log = await getAuditLogById(req.params.id);
    if (!log) {
      return res
        .status(404)
        .json({ success: false, error: 'Audit log not found' });
    }
    res.json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
}

async function getAuditLogsByUserIdHandler(req, res, next) {
  try {
    const logs = await getAuditLogsByUserId(
      req.params.userId,
      req.query.limit || 100
    );
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}

async function searchAuditLogsHandler(req, res, next) {
  try {
    const params = {
      action: req.query.action,
      entityType: req.query.entityType,
      entityId: req.query.entityId,
      userId: req.query.userId,
      startDate: req.query.startDate
        ? new Date(req.query.startDate)
        : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
      limit: Number(req.query.limit) || 50,
      offset: Number(req.query.offset) || 0,
    };

    const result = await searchAuditLogs(params);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAuditLogHandler,
  getAuditLogByIdHandler,
  getAuditLogsByUserIdHandler,
  searchAuditLogsHandler,
};
