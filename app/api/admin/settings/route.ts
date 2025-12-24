import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@vercel/edge-config';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/middleware/rate-limit';

// Zod schemas
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

const settingsSchema = z.object({
  featureFlags: featureFlagsSchema,
  moderationSettings: moderationSettingsSchema,
  limits: limitsSchema,
});

// Default settings (fallback when Edge Config is not available)
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
    maxSubmissionSize: 5 * 1024 * 1024, // 5MB
    maxSubmissionsPerUser: 10,
    maxSubmissionsPerDay: 1000,
    maxApiRequestsPerMinute: 60,
  },
};

// Rate limiter middleware (assumed to return NextResponse on limit exceeded, null otherwise)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // Adjust based on your implementation (unique tokens or requests)
});

// Edge Config client (read-only at runtime)
const edgeConfigClient = process.env.EDGE_CONFIG ? createClient(process.env.EDGE_CONFIG) : null;

if (!edgeConfigClient) {
  logger.warn('EDGE_CONFIG not set — settings will be read-only and use defaults', {
    context: 'admin-settings',
  });
}

// GET: Retrieve all settings
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // If no Edge Config, return defaults
    if (!edgeConfigClient) {
      return NextResponse.json(defaultSettings);
    }

    // Fetch settings in parallel
    const [featureFlags, moderationSettings, limits] = await Promise.all([
      edgeConfigClient.get('featureFlags').catch(() => null),
      edgeConfigClient.get('moderationSettings').catch(() => null),
      edgeConfigClient.get('limits').catch(() => null),
    ]);

    const response = {
      featureFlags:
        (featureFlags as typeof defaultSettings.featureFlags) ?? defaultSettings.featureFlags,
      moderationSettings:
        (moderationSettings as typeof defaultSettings.moderationSettings) ??
        defaultSettings.moderationSettings,
      limits: (limits as typeof defaultSettings.limits) ?? defaultSettings.limits,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error retrieving settings', error, { context: 'admin-settings' });
    return NextResponse.json({ error: 'Failed to retrieve settings' }, { status: 500 });
  }
}

// POST: Update settings (NOT possible with Edge Config at runtime)
export async function POST(request: NextRequest) {
  try {
    // Apply stricter rate limiting for writes
    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Critical: Add proper admin authentication here in production!
    // Example: check session, API key, or admin role

    // Edge Config is read-only at runtime — cannot update via code
    return NextResponse.json(
      {
        error:
          'Runtime updates to Edge Config are not supported. Please update settings via the Vercel Dashboard or Vercel CLI.',
      },
      { status: 400 }
    );

    // If you switch to a writable store (e.g., Vercel KV, Postgres), replace the above with:
    /*
    const body = await request.json();
    const validationResult = settingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid settings data',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const settings = validationResult.data;

    // Example with Vercel KV:
    // await kv.set('featureFlags', settings.featureFlags);
    // await kv.set('moderationSettings', settings.moderationSettings);
    // await kv.set('limits', settings.limits);

    logger.info('Admin settings updated successfully', {
      context: 'admin-settings',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
    });
    */
  } catch (error) {
    logger.error('Error processing settings update', error, { context: 'admin-settings' });
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
