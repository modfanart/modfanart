import { db, DB, s3Client } from '../config';
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import {
  CreateSubmissionSchema,
  UpdateSubmissionSchema,
  validateModel,
} from '../../validation/model-validation';
import { logger } from '../../utils/logger';
import { sanitizeFilename } from '../../validation/file-validation';

export type SubmissionStatus = 'pending' | 'review' | 'approved' | 'rejected' | 'licensed';

export interface AIAnalysis {
  aiDetection: {
    score: number;
    isAiGenerated: boolean;
    confidence: number;
    humanVerified: boolean;
  };
  contentAnalysis: {
    ipCompliance: {
      score: number;
      issues: string[];
      riskLevel: 'low' | 'medium' | 'high';
    };
    contentSafety: {
      score: number;
      issues: string[];
      riskLevel: 'low' | 'medium' | 'high';
    };
    brandGuidelines: {
      adherence: 'low' | 'medium' | 'high';
      issues: string[];
      notes: string;
    };
    overallRiskScore: number;
    recommendation: 'approve' | 'reject' | 'review';
    reasoningSummary: string;
  };
  finalRecommendation: 'approve' | 'reject' | 'review';
  needsHumanReview: boolean;
}

export interface Submission {
  id: string;
  title: string;
  description: string;
  category: string;
  originalIp: string;
  tags: string[];
  status: SubmissionStatus;
  imageUrl: string;
  licenseType: string;
  submittedAt: Date;
  updatedAt: Date;
  userId: string;
  analysis?: AIAnalysis;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

/**
 * CREATE SUBMISSION
 */
export async function createSubmission(
  submissionData: Omit<Submission, 'id' | 'submittedAt' | 'updatedAt'>,
  imageFile?: Buffer
): Promise<Submission> {
  const validation = validateModel(submissionData, CreateSubmissionSchema, 'createSubmission');
  if (!validation.success) {
    throw new Error(`Invalid submission data: ${JSON.stringify(validation.errors)}`);
  }

  const id = uuidv4();
  const now = new Date();
  let imageUrl = submissionData.imageUrl;

  // Upload image to S3 if provided
  if (imageFile) {
    try {
      const sanitizedTitle = sanitizeFilename(submissionData.title);
      const key = `submissions/${id}/${sanitizedTitle}.jpg`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: 'bbdx-mod-fan-art',
          Key: key,
          Body: imageFile,
          ContentType: 'image/jpeg',
          // Optional: add ACL or server-side encryption if needed
        })
      );

      imageUrl = `https://bbdx-mod-fan-art.s3.amazonaws.com/${key}`;
    } catch (error: any) {
      logger.error('Failed to upload image to S3', {
        error: error instanceof Error ? error.message : String(error),
        submissionId: id,
      });
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  const submission: Submission = {
    id,
    ...submissionData,
    imageUrl,
    submittedAt: now,
    updatedAt: now,
  };

  try {
    await db
      .insertInto(DB.SUBMISSIONS) // ← Use constant instead of string
      .values({
        id: submission.id,
        title: submission.title,
        description: submission.description,
        category: submission.category,
        original_ip: submission.originalIp,
        tags: submission.tags, // JSON[] or JSONB → Kysely serializes automatically
        status: submission.status,
        image_url: submission.imageUrl,
        license_type: submission.licenseType,
        submitted_at: submission.submittedAt,
        updated_at: submission.updatedAt,
        user_id: submission.userId,
        analysis: submission.analysis ?? null,
        review_notes: submission.reviewNotes ?? null,
        reviewed_by: submission.reviewedBy ?? null,
        reviewed_at: submission.reviewedAt ?? null,
      })
      .execute();

    logger.info('Submission created successfully', { submissionId: id });
    return submission;
  } catch (error: any) {
    logger.error('Failed to create submission in database', {
      error: error instanceof Error ? error.message : String(error),
      submissionId: id,
    });
    throw new Error(`Database error: ${error.message}`);
  }
}

/**
 * GET BY ID
 */
export async function getSubmissionById(id: string): Promise<Submission | null> {
  const row = await db
    .selectFrom(DB.SUBMISSIONS)
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  return row ? mapRowToSubmission(row) : null;
}

/**
 * GET BY USER ID
 */
export async function getSubmissionsByUserId(userId: string): Promise<Submission[]> {
  const rows = await db
    .selectFrom(DB.SUBMISSIONS)
    .selectAll()
    .where('user_id', '=', userId)
    .orderBy('submitted_at', 'desc')
    .execute();

  return rows.map(mapRowToSubmission);
}

/**
 * GET SUBMISSIONS BY STATUS
 */
export async function getSubmissionsByStatus(status: SubmissionStatus): Promise<Submission[]> {
  const rows = await db
    .selectFrom(DB.SUBMISSIONS)
    .selectAll()
    .where('status', '=', status)
    .orderBy('submitted_at', 'desc')
    .execute();

  return rows.map(mapRowToSubmission);
}

/**
 * UPDATE SUBMISSION
 */
export async function updateSubmission(
  id: string,
  submissionData: Partial<Omit<Submission, 'id' | 'submittedAt' | 'userId'>>
): Promise<Submission | null> {
  const validation = validateModel(submissionData, UpdateSubmissionSchema, 'updateSubmission');
  if (!validation.success) {
    throw new Error(`Invalid update data: ${JSON.stringify(validation.errors)}`);
  }

  return await db.transaction().execute(async (trx) => {
    const existing = await trx
      .selectFrom(DB.SUBMISSIONS)
      .selectAll()
      .where('id', '=', id)
      .forUpdate()
      .executeTakeFirst();

    if (!existing) return null;

    const updatedAt = new Date();

    const updatePayload: Partial<typeof existing> = {
      updated_at: updatedAt,
    };

    // Only set fields that are provided
    if (submissionData.title !== undefined) updatePayload.title = submissionData.title;
    if (submissionData.description !== undefined)
      updatePayload.description = submissionData.description;
    if (submissionData.category !== undefined) updatePayload.category = submissionData.category;
    if (submissionData.originalIp !== undefined)
      updatePayload.original_ip = submissionData.originalIp;
    if (submissionData.imageUrl !== undefined) updatePayload.image_url = submissionData.imageUrl;
    if (submissionData.licenseType !== undefined)
      updatePayload.license_type = submissionData.licenseType;
    if (submissionData.status !== undefined) updatePayload.status = submissionData.status;
    if (submissionData.tags !== undefined) updatePayload.tags = submissionData.tags;
    if (submissionData.analysis !== undefined)
      updatePayload.analysis = submissionData.analysis ?? null;
    if (submissionData.reviewNotes !== undefined)
      updatePayload.review_notes = submissionData.reviewNotes ?? null;
    if (submissionData.reviewedBy !== undefined)
      updatePayload.reviewed_by = submissionData.reviewedBy ?? null;
    if (submissionData.reviewedAt !== undefined)
      updatePayload.reviewed_at = submissionData.reviewedAt ?? null;

    await trx.updateTable(DB.SUBMISSIONS).set(updatePayload).where('id', '=', id).execute();

    const updated: Submission = {
      ...mapRowToSubmission(existing),
      ...submissionData,
      updatedAt,
      // Preserve existing reviewedAt if not updated
      reviewedAt: submissionData.reviewedAt ?? mapRowToSubmission(existing).reviewedAt,
    };

    logger.info('Submission updated successfully', { submissionId: id });
    return updated;
  });
}

/**
 * DELETE SUBMISSION
 */
export async function deleteSubmission(id: string): Promise<boolean> {
  const result = await db.deleteFrom(DB.SUBMISSIONS).where('id', '=', id).executeTakeFirst();

  const deleted = Number(result.numDeletedRows) > 0;

  if (deleted) {
    logger.info('Submission deleted', { submissionId: id });
  }

  return deleted;
}

/**
 * MAPPER: DB row → Submission (safe JSON handling)
 */
function mapRowToSubmission(row: any): Submission {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    originalIp: row.original_ip,
    tags: Array.isArray(row.tags) ? row.tags : [], // Ensure it's always an array
    status: row.status as SubmissionStatus,
    imageUrl: row.image_url,
    licenseType: row.license_type,
    submittedAt: new Date(row.submitted_at),
    updatedAt: new Date(row.updated_at),
    userId: row.user_id,
    analysis: row.analysis ?? undefined,
    reviewNotes: row.review_notes ?? undefined,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
  };
}
