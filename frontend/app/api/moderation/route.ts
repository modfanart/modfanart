export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { validateRequest } from '@/lib/validation';
import { analyzeSubmission } from '@/lib/services/moderation-service';
import { createSubmission } from '@/lib/db/models/submission';
import { getUserById } from '@/lib/db/models/user';

/* -------------------------------------------------------------------------- */
/*                                   Schema                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info('Moderation request received', {
    context: 'moderation-api',
    requestId,
  });

  try {
    /* ---------------------------- Parse Body ---------------------------- */
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON body',
          requestId,
        },
        { status: 400 }
      );
    }

    const validation = validateRequest(ModerationRequestSchema, body, 'moderation-request');

    if (!validation.success) {
      return validation.response;
    }

    const { title, description, category, originalIp, tags, imageUrl, licenseType, userId } =
      validation.data;

    /* ----------------------------- User -------------------------------- */
    const user = await getUserById(userId);

    if (!user) {
      logger.warn('User not found', {
        context: 'moderation-api',
        requestId,
        userId,
      });

      return NextResponse.json(
        { success: false, error: 'User not found', requestId },
        { status: 404 }
      );
    }

    /* ------------------------- Normalize Tags --------------------------- */
    const normalizedTags =
      typeof tags === 'string'
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : Array.isArray(tags)
        ? tags
        : [];

    /* ------------------------- AI Moderation ---------------------------- */
    const analysis = await analyzeSubmission(
      title,
      description,
      category,
      originalIp,
      normalizedTags,
      imageUrl
    );

    /* ------------------------- Submission ------------------------------- */
    const submission = await createSubmission({
      title,
      description,
      category,
      originalIp,
      tags: normalizedTags,
      imageUrl,
      licenseType,
      userId,
      analysis,
      status: analysis.finalRecommendation === 'approve' ? 'pending' : 'review',
    });

    const processingTime = Date.now() - startTime;

    logger.info('Moderation completed successfully', {
      context: 'moderation-api',
      requestId,
      submissionId: submission.id,
      recommendation: analysis.finalRecommendation,
      needsHumanReview: analysis.needsHumanReview,
      processingTime,
    });

    return NextResponse.json({
      success: true,
      submission,
      analysis,
      meta: {
        requestId,
        processingTime,
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;

    logger.error('Moderation API failed', {
      context: 'moderation-api',
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      processingTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process submission',
        requestId,
      },
      { status: 500 }
    );
  }
}
