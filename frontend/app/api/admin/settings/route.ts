export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

/* -------------------------------------------------------------------------- */
/*                                   Schemas                                  */
/* -------------------------------------------------------------------------- */

const featureFlagsSchema = z.object({
  enableGrokIntegration: z.boolean(),
  enableAiModeration: z.boolean(),
  enableAutoApproval: z.boolean(),
  enableAnalytics: z.boolean(),
  enableBetaFeatures: z.boolean(),
});

const moderationThresholdsSchema = z.object({
  aiScore: z.number().min(0).max(1),
  ipCompliance: z.number().min(1).max(10),
  contentSafety: z.number().min(1).max(10),
  autoApprove: z.number().min(1).max(10),
  autoReject: z.number().min(1).max(10),
});

const reviewQueueSchema = z.object({
  maxItems: z.number().min(10).max(1000),
  assignmentTimeout: z.number().min(5).max(120),
});

const moderationSettingsSchema = z.object({
  thresholds: moderationThresholdsSchema,
  reviewQueue: reviewQueueSchema,
});

const limitsSchema = z.object({
  maxSubmissionSize: z
    .number()
    .min(1024 * 1024)
    .max(20 * 1024 * 1024),
  maxSubmissionsPerUser: z.number().min(1).max(100),
  maxSubmissionsPerDay: z.number().min(100).max(10000),
  maxApiRequestsPerMinute: z.number().min(10).max(1000),
});

/* -------------------------------------------------------------------------- */
/*                              Default Settings                              */
/* -------------------------------------------------------------------------- */

const defaultSettings = {
  featureFlags: {
    enableGrokIntegration: false,
    enableAiModeration: true,
    enableAutoApproval: false,
    enableAnalytics: true,
    enableBetaFeatures: false,
  },
  moderationSettings: {
    thresholds: {
      aiScore: 0.7,
      ipCompliance: 7,
      contentSafety: 7,
      autoApprove: 3,
      autoReject: 8,
    },
    reviewQueue: {
      maxItems: 100,
      assignmentTimeout: 30,
    },
  },
  limits: {
    maxSubmissionSize: 5 * 1024 * 1024,
    maxSubmissionsPerUser: 10,
    maxSubmissionsPerDay: 1000,
    maxApiRequestsPerMinute: 60,
  },
};

/* -------------------------------------------------------------------------- */
/*                                   GET                                      */
/* -------------------------------------------------------------------------- */

export async function GET(request: NextRequest) {
  try {
    /* -------------------------- Rate limiting -------------------------- */
    const { rateLimit } = await import('@/lib/middleware/rate-limit');

    const limiter = rateLimit({
      windowMs: 60 * 1000,
      limit: 500,
    });

    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    /* --------------------------- Edge Config ---------------------------- */
    if (!process.env.EDGE_CONFIG) {
      logger.warn('EDGE_CONFIG not set — using default settings', {
        context: 'admin-settings',
      });

      return NextResponse.json(defaultSettings);
    }

    const { createClient } = await import('@vercel/edge-config');
    const edgeConfigClient = createClient(process.env.EDGE_CONFIG);

    const [featureFlags, moderationSettings, limits] = await Promise.all([
      edgeConfigClient.get('featureFlags').catch(() => null),
      edgeConfigClient.get('moderationSettings').catch(() => null),
      edgeConfigClient.get('limits').catch(() => null),
    ]);

    return NextResponse.json({
      featureFlags: featureFlags ?? defaultSettings.featureFlags,
      moderationSettings: moderationSettings ?? defaultSettings.moderationSettings,
      limits: limits ?? defaultSettings.limits,
    });
  } catch (error) {
    logger.error('Failed to fetch admin settings', error, {
      context: 'admin-settings',
    });

    return NextResponse.json({ error: 'Failed to retrieve settings' }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/*                                   POST                                     */
/* -------------------------------------------------------------------------- */
/**
 * NOTE:
 * Edge Config is READ-ONLY at runtime.
 * This endpoint exists only to prevent misuse and guide admins correctly.
 */

export async function POST(request: NextRequest) {
  try {
    const { rateLimit } = await import('@/lib/middleware/rate-limit');

    const limiter = rateLimit({
      windowMs: 60 * 1000,
      limit: 100,
    });

    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    return NextResponse.json(
      {
        error:
          'Runtime updates are not supported. Update settings via the Vercel Dashboard or CLI.',
      },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Failed to process settings update', error, {
      context: 'admin-settings',
    });

    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
