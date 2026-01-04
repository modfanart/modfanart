// backend/src/controllers/license.controller.js
const { logger } = require('../utils/logger');
const z = require('zod');
const crypto = require('crypto');

// Zod schemas (copied/adapted from your code)
const LicenseTermsSchema = z.object({
  duration: z.string().min(1).max(100),
  territory: z.string().min(1).max(100),
  exclusivity: z.boolean(),
  royaltyRate: z.number().min(0).max(100).optional(),
  restrictions: z.array(z.string().max(500)).optional(),
});

const CreateLicenseSchema = z.object({
  submissionId: z.string().min(1),
  artistId: z.string().min(1),
  brandId: z.string().min(1),
  licenseType: z.enum(['personal', 'commercial', 'full']),
  terms: LicenseTermsSchema.optional(),
});

// ─────────────────────────────────────────────
//              Existing Handlers (from previous)
// ─────────────────────────────────────────────

async function createLicenseHandler(req, res, next) {
  try {
    const license = await require('../models/license').createLicense(req.body);
    res.status(201).json({ success: true, data: license });
  } catch (error) {
    next(error);
  }
}

async function getLicenseByIdHandler(req, res, next) {
  try {
    const license = await require('../models/license').getLicenseById(req.params.id);
    if (!license) return res.status(404).json({ success: false, error: 'License not found' });
    res.json({ success: true, data: license });
  } catch (error) {
    next(error);
  }
}

async function updateLicenseStatusHandler(req, res, next) {
  try {
    const { status, reason } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'Status is required' });

    const license = await require('../models/license').updateLicenseStatus(req.params.id, status, reason);
    if (!license) return res.status(404).json({ success: false, error: 'License not found' });

    res.json({ success: true, data: license });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
//              NEW: Create License Agreement (your endpoint)
// ─────────────────────────────────────────────

async function createLicenseAgreement(req, res, next) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info('License creation request received', {
    context: 'licensing-api',
    requestId,
  });

  try {
    // Rate limiting is applied in the route — we just handle the logic here

    // Parse & validate body
    const parseResult = CreateLicenseSchema.safeParse(req.body);
    if (!parseResult.success) {
      logger.warn('Invalid license payload', {
        context: 'licensing-api',
        requestId,
        errors: parseResult.error.format(),
      });

      return res.status(400).json({
        success: false,
        error: 'Invalid license data',
        details: parseResult.error.format(),
        requestId,
      });
    }

    const { submissionId, artistId, brandId, licenseType, terms } = parseResult.data;

    const user = req.user; // from isAuthenticated middleware
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        requestId,
      });
    }

    const userId = user.id;
    const userRole = user.role;

    // Permission check
    const hasPermission = userRole === 'admin' || (userRole === 'brand' && userId === brandId);

    if (!hasPermission) {
      logger.warn('Permission denied', {
        context: 'licensing-api',
        requestId,
        userId,
        userRole,
        brandId,
      });

      return res.status(403).json({
        success: false,
        error: 'You do not have permission to create this license',
        requestId,
      });
    }

    // Build license agreement object
    const baseTerms = {
      duration: terms?.duration ?? '1 year',
      territory: terms?.territory ?? 'Worldwide',
      exclusivity: terms?.exclusivity ?? false,
      restrictions: terms?.restrictions ?? [
        'No unauthorized redistribution',
        'Attribution required',
      ],
    };

    const licenseAgreement = {
      id: `LICENSE-${Math.floor(Math.random() * 100000)}`,
      submissionId,
      artistId,
      brandId,
      licenseType,
      terms: terms?.royaltyRate !== undefined
        ? { ...baseTerms, royaltyRate: terms.royaltyRate }
        : baseTerms,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info('License agreement created', {
      context: 'licensing-api',
      requestId,
      licenseId: licenseAgreement.id,
      processingTime: Date.now() - startTime,
    });

    res.json({
      success: true,
      licenseAgreement,
      meta: {
        requestId,
        processingTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    logger.error('License creation failed', {
      context: 'licensing-api',
      requestId,
      error: error.message || 'Unknown error',
      processingTime: Date.now() - startTime,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to create license',
      requestId,
    });
  }
}

module.exports = {
  createLicenseHandler,
  getLicenseByIdHandler,
  updateLicenseStatusHandler,
  createLicenseAgreement, // new export
};