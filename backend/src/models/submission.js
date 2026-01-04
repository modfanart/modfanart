// backend/src/models/submission.js
const { db, s3Client } = require('../config');
const { v4: uuidv4 } = require('uuid');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { logger } = require('../utils/logger');

// Zod schemas — copy from frontend/validation/model-validation.js
const z = require('zod');

const SubmissionStatusEnum = z.enum(['pending', 'review', 'approved', 'rejected', 'licensed']);

const CreateSubmissionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  originalIp: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
  status: SubmissionStatusEnum.default('pending'),
  imageUrl: z.string().url().optional(),
  licenseType: z.string().min(1),
  userId: z.string().uuid(),
  analysis: z.any().optional(),
  reviewNotes: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.date().optional(),
});

const UpdateSubmissionSchema = CreateSubmissionSchema.partial();

// ─────────────────────────────────────────────
//              Helpers
// ─────────────────────────────────────────────

function mapRowToSubmission(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    originalIp: row.original_ip,
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: row.status,
    imageUrl: row.image_url,
    licenseType: row.license_type,
    submittedAt: new Date(row.submitted_at),
    updatedAt: new Date(row.updated_at),
    userId: row.user_id,
    analysis: row.analysis || undefined,
    reviewNotes: row.review_notes || undefined,
    reviewedBy: row.reviewed_by || undefined,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
  };
}

// ─────────────────────────────────────────────
//              CRUD Operations
// ─────────────────────────────────────────────

async function createSubmission(submissionData, imageFile) {
  const validation = CreateSubmissionSchema.safeParse(submissionData);
  if (!validation.success) {
    throw new Error(`Invalid submission data: ${JSON.stringify(validation.error.issues)}`);
  }

  const id = uuidv4();
  const now = new Date();
  let imageUrl = submissionData.imageUrl;

  // Upload image to S3 if provided
  if (imageFile) {
    try {
      const sanitizedTitle = submissionData.title.replace(/[^a-zA-Z0-9]/g, '-');
      const key = `submissions/${id}/${sanitizedTitle}.jpg`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: 'bbdx-mod-fan-art',
          Key: key,
          Body: imageFile,
          ContentType: 'image/jpeg',
        })
      );

      imageUrl = `https://bbdx-mod-fan-art.s3.amazonaws.com/${key}`;
    } catch (error) {
      logger.error('S3 upload failed', { error: error.message, submissionId: id });
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  const submission = {
    id,
    ...validation.data,
    imageUrl,
    submittedAt: now,
    updatedAt: now,
  };

  try {
    await db
      .insertInto('submissions')
      .values({
        id: submission.id,
        title: submission.title,
        description: submission.description,
        category: submission.category,
        original_ip: submission.originalIp,
        tags: submission.tags,
        status: submission.status,
        image_url: submission.imageUrl,
        license_type: submission.licenseType,
        submitted_at: submission.submittedAt,
        updated_at: submission.updatedAt,
        user_id: submission.userId,
        analysis: submission.analysis || null,
        review_notes: submission.reviewNotes || null,
        reviewed_by: submission.reviewedBy || null,
        reviewed_at: submission.reviewedAt || null,
      })
      .execute();

    logger.info('Submission created', { submissionId: id });
    return submission;
  } catch (error) {
    logger.error('Failed to create submission', { error: error.message, submissionId: id });
    throw error;
  }
}

async function getSubmissionById(id) {
  const row = await db
    .selectFrom('submissions')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  return row ? mapRowToSubmission(row) : null;
}

async function getSubmissionsByUserId(userId) {
  const rows = await db
    .selectFrom('submissions')
    .selectAll()
    .where('user_id', '=', userId)
    .orderBy('submitted_at', 'desc')
    .execute();

  return rows.map(mapRowToSubmission);
}

async function getSubmissionsByStatus(status) {
  const rows = await db
    .selectFrom('submissions')
    .selectAll()
    .where('status', '=', status)
    .orderBy('submitted_at', 'desc')
    .execute();

  return rows.map(mapRowToSubmission);
}

async function updateSubmission(id, submissionData) {
  const validation = UpdateSubmissionSchema.safeParse(submissionData);
  if (!validation.success) {
    throw new Error(`Invalid update data: ${JSON.stringify(validation.error.issues)}`);
  }

  const existing = await db
    .selectFrom('submissions')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!existing) return null;

  const updatedAt = new Date();
  const updatePayload = { updated_at: updatedAt };

  if ('title' in submissionData) updatePayload.title = submissionData.title;
  if ('description' in submissionData) updatePayload.description = submissionData.description;
  if ('category' in submissionData) updatePayload.category = submissionData.category;
  if ('originalIp' in submissionData) updatePayload.original_ip = submissionData.originalIp;
  if ('imageUrl' in submissionData) updatePayload.image_url = submissionData.imageUrl;
  if ('licenseType' in submissionData) updatePayload.license_type = submissionData.licenseType;
  if ('status' in submissionData) updatePayload.status = submissionData.status;
  if ('tags' in submissionData) updatePayload.tags = submissionData.tags;
  if ('analysis' in submissionData) updatePayload.analysis = submissionData.analysis ?? null;
  if ('reviewNotes' in submissionData) updatePayload.review_notes = submissionData.reviewNotes ?? null;
  if ('reviewedBy' in submissionData) updatePayload.reviewed_by = submissionData.reviewedBy ?? null;
  if ('reviewedAt' in submissionData) updatePayload.reviewed_at = submissionData.reviewedAt ?? null;

  await db.updateTable('submissions').set(updatePayload).where('id', '=', id).execute();

  const updated = {
    ...mapRowToSubmission(existing),
    ...submissionData,
    updatedAt,
  };

  logger.info('Submission updated', { submissionId: id });
  return updated;
}

async function deleteSubmission(id) {
  const result = await db.deleteFrom('submissions').where('id', '=', id).executeTakeFirst();
  const deleted = Number(result.numDeletedRows) > 0;

  if (deleted) {
    logger.info('Submission deleted', { submissionId: id });
  }

  return deleted;
}

module.exports = {
  createSubmission,
  getSubmissionById,
  getSubmissionsByUserId,
  getSubmissionsByStatus,
  updateSubmission,
  deleteSubmission,
};