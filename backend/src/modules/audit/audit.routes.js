// src/modules/audit/audit.routes.js  ->  /api/audit
const express = require('express');
const { authenticateToken } = require('../../common/middleware/auth.middleware');
const { requirePermission } = require('../../common/middleware/require-admin');
const ctrl = require('./controller/audit.controller');

const router = express.Router();

router.use(authenticateToken, requirePermission('audit.view'));

// Static paths first: '/:id' would otherwise swallow them.
router.get('/', ctrl.search);
router.get('/facets', ctrl.facets);
router.get('/daily', ctrl.daily);
router.get('/export', ctrl.exportCsv);
router.get('/:id', ctrl.getById);

module.exports = router;
