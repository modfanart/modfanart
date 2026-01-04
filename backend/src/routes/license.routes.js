// backend/src/routes/license.routes.js
const express = require('express');
const router = express.Router();
const {
  createLicenseHandler,
  getLicenseByIdHandler,
  updateLicenseStatusHandler,
  createLicenseAgreement, // new
} = require('../controllers/license.controller');
const { isAuthenticated, requireRole } = require('../middleware/auth');

// Existing routes
router.post('/', createLicenseHandler);
router.get('/:id', getLicenseByIdHandler);
router.patch('/:id/status', updateLicenseStatusHandler);

// NEW: POST /api/licenses/agreement (your endpoint)
router.post('/agreement', isAuthenticated, requireRole('brand'), createLicenseAgreement);

module.exports = router;