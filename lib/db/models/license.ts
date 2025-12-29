import { db, DB } from '../config';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { z } from 'zod';

export type LicenseStatus = 'active' | 'expired' | 'revoked';

const LicenseTermsSchema = z.object({
  usageRights: z.array(z.string()),
  territories: z.array(z.string()),
  duration: z.number().int().positive(),
  restrictions: z.array(z.string()).optional(),
  royaltyPercentage: z.number().min(0).max(100).optional(),
  exclusivity: z.boolean().default(false),
});

export type LicenseTerms = z.infer<typeof LicenseTermsSchema>;

const CreateLicenseSchema = z.object({
  submissionId: z.string().uuid(),
  userId: z.string().uuid(),
  licenseType: z.string().min(2).max(50),
  status: z.enum(['active', 'expired', 'revoked']).default('active'),
  terms: LicenseTermsSchema,
  expiresAt: z.date().optional(),
  paymentId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export interface License {
  id: string;
  submissionId: string;
  userId: string;
  licenseType: string;
  status: LicenseStatus;
  terms: LicenseTerms;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date | undefined; // ← explicitly allow undefined
  paymentId?: string | undefined;
  metadata?: Record<string, any> | undefined;
}

/**
 * CREATE LICENSE
 */
export async function createLicense(
  licenseData: Omit<License, 'id' | 'createdAt' | 'updatedAt'>
): Promise<License> {
  try {
    const validatedData = CreateLicenseSchema.parse(licenseData);
    const id = uuidv4();
    const now = new Date();

    const license: License = {
      id,
      ...validatedData,
      createdAt: now,
      updatedAt: now,
    };

    return await db.transaction().execute(async (trx) => {
      // 1. Verify and lock submission
      const submission = await trx
        .selectFrom('submissions')
        .select(['id', 'status'])
        .where('id', '=', license.submissionId)
        .forUpdate()
        .executeTakeFirstOrThrow();

      if (submission.status !== 'approved') {
        throw new Error(`Cannot license submission with status '${submission.status}'`);
      }

      // 2. Insert license — pass objects directly for JSON columns
      await trx
        .insertInto('licenses')
        .values({
          id: license.id,
          submission_id: license.submissionId,
          user_id: license.userId,
          license_type: license.licenseType,
          status: license.status,
          terms: license.terms, // ← object, not JSON.stringify
          created_at: license.createdAt,
          updated_at: license.updatedAt,
          expires_at: license.expiresAt ?? null,
          payment_id: license.paymentId ?? null,
          metadata: license.metadata ?? null, // ← object or null
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
  } catch (error: any) {
    logger.error('Failed to create license', {
      error: error instanceof Error ? error : String(error),
      submissionId: licenseData.submissionId,
    });

    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e) => `${e.path.join('.')} : ${e.message}`).join('; ');
      throw new Error(`Invalid license data: ${messages}`);
    }

    throw error;
  }
}

/**
 * GET BY ID
 */
export async function getLicenseById(id: string): Promise<License | null> {
  const row = await db.selectFrom('licenses').selectAll().where('id', '=', id).executeTakeFirst();

  return row ? mapRowToLicense(row) : null;
}

/**
 * UPDATE LICENSE STATUS
 */
export async function updateLicenseStatus(
  id: string,
  status: LicenseStatus,
  reason?: string
): Promise<License | null> {
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

    // Build status history entry
    const historyEntry = {
      from: currentLicense.status,
      to: status,
      date: now.toISOString(),
      reason: reason ?? null,
    };

    const currentHistory = (currentLicense.metadata?.['statusHistory'] as any[]) ?? [];
    const updatedMetadata: Record<string, any> = {
      ...(currentLicense.metadata ?? {}),
      statusHistory: [...currentHistory, historyEntry],
    };

    // Update — pass object directly for metadata
    await trx
      .updateTable('licenses')
      .set({
        status,
        updated_at: now,
        metadata: updatedMetadata, // ← object, not stringified
      })
      .where('id', '=', id)
      .execute();

    // If revoked, revert submission
    if (status === 'revoked') {
      await trx
        .updateTable('submissions')
        .set({ status: 'approved', updated_at: now })
        .where('id', '=', currentLicense.submissionId)
        .execute();
    }

    logger.info('License status updated', {
      licenseId: id,
      newStatus: status,
    });

    return {
      ...currentLicense,
      status,
      updatedAt: now,
      metadata: updatedMetadata,
    };
  });
}

/**
 * MAPPER: DB row → License
 */
function mapRowToLicense(row: any): License {
  return {
    id: row.id,
    submissionId: row.submission_id,
    userId: row.user_id,
    licenseType: row.license_type,
    status: row.status as LicenseStatus,
    terms: typeof row.terms === 'string' ? JSON.parse(row.terms) : row.terms,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
    paymentId: row.payment_id ?? undefined,
    metadata:
      row.metadata && typeof row.metadata === 'string'
        ? JSON.parse(row.metadata)
        : row.metadata ?? undefined,
  };
}
