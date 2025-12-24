import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@vercel/edge-config';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/middleware/rate-limit';

// Zod schemas (same as before — excellent!)
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

// Default settings
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

// Rate limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Allow more for admin
});

// Initialize Edge Config client
const edgeConfigClient = process.env.EDGE_CONFIG ? createClient(process.env.EDGE_CONFIG) : null;

if (!edgeConfigClient) {
  logger.warn('EDGE_CONFIG not set — settings will not persist', { context: 'admin-settings' });
}

// GET: Retrieve all settings
export async function GET(request: NextRequest) {
  try {
    // Rate limit
    const { success } = await limiter.check(request, 10); // 10 requests per minute
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    if (!edgeConfigClient) {
      return NextResponse.json(defaultSettings);
    }

    // Fetch all keys at once for efficiency
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

// POST: Update settings
export async function POST(request: NextRequest) {
  try {
    // Rate limit (stricter for writes)
    const { success } = await limiter.check(request, 5);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // TODO: Add proper authentication (e.g., session check, admin role)
    // This is a critical admin endpoint!

    if (!edgeConfigClient) {
      return NextResponse.json(
        { error: 'Edge Config not available — cannot save settings' },
        { status: 500 }
      );
    }

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

    // Update Edge Config — use .update() for partial updates
    await Promise.all([
      edgeConfigClient.update('featureFlags', settings.featureFlags),
      edgeConfigClient.update('moderationSettings', settings.moderationSettings),
      edgeConfigClient.update('limits', settings.limits),
    ]);

    logger.info('Admin settings updated successfully', {
      context: 'admin-settings',
      updatedBy: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
    });
  } catch (error) {
    logger.error('Error saving settings', error, { context: 'admin-settings' });
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
