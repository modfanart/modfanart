import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getEdgeConfig, setEdgeConfig } from '@/lib/edge-config';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/middleware/rate-limit';

// Define the settings schema
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

// Rate limiter for this endpoint
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10,
});

// GET handler to retrieve settings
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const { success } = await limiter.check(request, 5);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Get settings from Edge Config
    const featureFlags = (await getEdgeConfig('featureFlags')) || defaultSettings.featureFlags;
    const moderationSettings =
      (await getEdgeConfig('moderationSettings')) || defaultSettings.moderationSettings;
    const limits = (await getEdgeConfig('limits')) || defaultSettings.limits;

    return NextResponse.json({
      featureFlags,
      moderationSettings,
      limits,
    });
  } catch (error) {
    logger.error('Error retrieving settings', error, {
      context: 'admin-settings',
    });

    return NextResponse.json({ error: 'Failed to retrieve settings' }, { status: 500 });
  }
}

// POST handler to update settings
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const { success } = await limiter.check(request, 3);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    const validationResult = settingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid settings data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const settings = validationResult.data;

    // Update Edge Config
    await setEdgeConfig('featureFlags', settings.featureFlags);
    await setEdgeConfig('moderationSettings', settings.moderationSettings);
    await setEdgeConfig('limits', settings.limits);

    logger.info('Settings updated', {
      context: 'admin-settings',
      data: {
        featureFlags: settings.featureFlags,
        moderationThresholds: settings.moderationSettings.thresholds,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    logger.error('Error updating settings', error, {
      context: 'admin-settings',
    });

    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
