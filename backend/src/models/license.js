// backend/src/models/license.js
const { db } = require('../config');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

// Zod schemas — copy from frontend/validation/model-validation.js
const z = require('zod');

const LicenseStatusEnum = z.enum(['active', 'expired', 'revoked']);

const LicenseTermsSchema = z.object({
  usageRights: z.array(z.string()),
  territories: z.array(z.string()),
  duration: z.number().int().positive(),
  restrictions: z.array(z.string()).optional(),
  royaltyPercentage: z.number().min(0).max(100).optional(),
  exclusivity: z.boolean().default(false),
});

const CreateLicenseSchema = z.object({
  submissionId: z.string().uuid(),
  userId: z.string().uuid(),
  licenseType: z.string().min(2).max(50),
  status: LicenseStatusEnum.default('active'),
  terms: LicenseTermsSchema,
  expiresAt: z.date().optional(),
  paymentId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
});

// ─────────────────────────────────────────────
//              Helpers
// ─────────────────────────────────────────────

function mapRowToLicense(row) {
  return {
    id: row.id,
    submissionId: row.submission_id,
    userId: row.user_id,
    licenseType: row.license_type,
    status: row.status,
    terms: typeof row.terms === 'string' ? JSON.parse(row.terms) : row.terms,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
    paymentId: row.payment_id ?? undefined,
    metadata: row.metadata && typeof row.metadata === 'string'
      ? JSON.parse(row.metadata)
      : row.metadata ?? undefined,
  };
}

// ─────────────────────────────────────────────
//              CRUD Operations
// ─────────────────────────────────────────────

async function createLicense(licenseData) {
  try {
    const validated = CreateLicenseSchema.parse(licenseData);
    const id = uuidv4();
    const now = new Date();

    const license = {
      id,
      ...validated,
      createdAt: now,
      updatedAt: now,
    };

    return await db.transaction().execute(async (trx) => {
      // 1. Lock & verify submission
      const submission = await trx
        .selectFrom('submissions')
        .select(['id', 'status'])
        .where('id', '=', license.submissionId)
        .forUpdate()
        .executeTakeFirst();

      if (!submission) {
        throw new Error(`Submission ${license.submissionId} not found`);
      }

      if (submission.status !== 'approved') {
        throw new Error(`Cannot license submission with status '${submission.status}'`);
      }

      // 2. Insert license — objects passed directly for JSON columns
      await trx
        .insertInto('licenses')
        .values({
          id: license.id,
          submission_id: license.submissionId,
          user_id: license.userId,
          license_type: license.licenseType,
          status: license.status,
          terms: license.terms,
          created_at: license.createdAt,
          updated_at: license.updatedAt,
          expires_at: license.expiresAt ?? null,
          payment_id: license.paymentId ?? null,
          metadata: license.metadata ?? null,
        })
        .execute();

      // 3. Update submission status
      await trx
        .updateTable('submissions')
        .set({ status: 'licensed', updated_at: now })
        .where('id', '=', license.submissionId)
        .execute();

      logger.info('License created successfully', {
        licenseId: id,
        submissionId: license.submissionId,
      });

      return license;
    });
  } catch (error) {
    logger.error('Failed to create license', {
      error: error.message || error,
      submissionId: licenseData.submissionId,
    });

    if (error instanceof z.ZodError) {
      throw new Error(`Invalid license data: ${JSON.stringify(error.issues)}`);
    }

    throw error;
  }
}

async function getLicenseById(id) {
  const row = await db
    .selectFrom('licenses')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  return row ? mapRowToLicense(row) : null;
}

async function updateLicenseStatus(id, status, reason) {
  return await db.transaction().execute(async (trx) => {
    const row = await trx
      .selectFrom('licenses')
      .selectAll()
      .where('id', '=', id)
      .forUpdate()
      .executeTakeFirst();

    if (!row) return null;

    const currentLicense = mapRowToLicense(row);
    const now = new Date();

    const historyEntry = {
      from: currentLicense.status,
      to: status,
      date: now.toISOString(),
      reason: reason || null,
    };

    const currentHistory = (currentLicense.metadata?.statusHistory || []);

    const updatedMetadata = {
      ...currentLicense.metadata,
      statusHistory: [...currentHistory, historyEntry],
    };

    await trx
      .updateTable('licenses')
      .set({
        status,
        updated_at: now,
        metadata: updatedMetadata,
      })
      .where('id', '=', id)
      .execute();

    if (status === 'revoked') {
      await trx
        .updateTable('submissions')
        .set({ status: 'approved', updated_at: now })
        .where('id', '=', currentLicense.submissionId)
        .execute();

      logger.info('Submission reverted to approved due to license revocation', {
        licenseId: id,
        submissionId: currentLicense.submissionId,
      });
    }

    logger.info('License status updated', {
      licenseId: id,
      from: currentLicense.status,
      to: status,
      reason,
    });

    return {
      ...currentLicense,
      status,
      updatedAt: now,
      metadata: updatedMetadata,
    };
  });
}

module.exports = {
  createLicense,
  getLicenseById,
  updateLicenseStatus,
};