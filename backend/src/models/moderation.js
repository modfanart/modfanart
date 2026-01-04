// backend/src/models/moderation.js
const { db } = require('../config');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');
const z = require('zod');

// Input validation schema (same as your code)
const ModerationRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  originalIp: z.string().min(1, 'Original IP is required'),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  imageUrl: z.string().url('Valid image URL is required'),
  licenseType: z.string().min(1, 'License type is required'),
  userId: z.string().min(1, 'User ID is required'),
});

// Assume this function exists (copy/adapt from your frontend lib/services/moderation-service)
async function analyzeSubmission(title, description, category, originalIp, tags, imageUrl) {
  // Placeholder - replace with real AI call (Grok or fallback)
  logger.info('Analyzing submission (mock)', { title, category });

  return {
    finalRecommendation: 'approve', // or 'review' / 'reject'
    needsHumanReview: false,
    aiDetection: { score: 0.15 },
    contentAnalysis: { reasoningSummary: 'Content appears safe and original' },
    suggestedTags: tags || [category],
  };
}

// Assume this exists (from your submission model)
async function getUserById(userId) {
  const row = await db
    .selectFrom('users')
    .selectAll()
    .where('id', '=', userId)
    .executeTakeFirst();

  return row ? {
    id: row.id,
    role: row.role,
    // add other fields
  } : null;
}

async function createModeratedSubmission(input) {
  const validation = ModerationRequestSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input: ${JSON.stringify(validation.error.issues)}`);
  }

  const {
    title,
    description,
    category,
    originalIp,
    tags: rawTags,
    imageUrl,
    licenseType,
    userId,
  } = validation.data;

  // Normalize tags
  const tags = Array.isArray(rawTags)
    ? rawTags
    : typeof rawTags === 'string'
      ? rawTags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

  // Get user
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Run AI moderation
  const analysis = await analyzeSubmission(
    title,
    description,
    category,
    originalIp,
    tags,
    imageUrl
  );

  // Determine status
  let status = 'pending';
  if (analysis.finalRecommendation === 'approve') {
    status = 'pending'; // or 'approved' if auto-approve enabled
  } else if (analysis.finalRecommendation === 'reject') {
    status = 'rejected';
  } else {
    status = 'review';
  }

  // Create submission
  const id = uuidv4();
  const now = new Date();

  const submission = {
    id,
    title,
    description,
    category,
    originalIp,
    tags,
    imageUrl,
    licenseType,
    userId,
    status,
    analysis,
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
        user_id: submission.userId,
        analysis: submission.analysis,
        submitted_at: submission.submittedAt,
        updated_at: submission.updatedAt,
      })
      .execute();

    logger.info('Moderated submission created', {
      submissionId: id,
      status: submission.status,
      recommendation: analysis.finalRecommendation,
    });

    return submission;
  } catch (error) {
    logger.error('Failed to create moderated submission', { error: error.message });
    throw error;
  }
}

module.exports = {
  createModeratedSubmission,
};