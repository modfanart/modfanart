// backend/src/routes/audit.routes.js
const express = require('express');
const router = express.Router();
const {
  createAuditLogHandler,
  getAuditLogByIdHandler,
  getAuditLogsByUserIdHandler,
  searchAuditLogsHandler,
} = require('../controller/audit.controller');

// POST /api/audit
router.post('/', createAuditLogHandler);

// GET /api/audit/:id
router.get('/:id', getAuditLogByIdHandler);

// GET /api/audit/user/:userId
router.get('/user/:userId', getAuditLogsByUserIdHandler);

// GET /api/audit/search
router.get('/search', searchAuditLogsHandler);

module.exports = router;