import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/middleware/rate-limit';
import { requireAuth } from '@/lib/middleware/auth';
import { createSanitizedStringSchema, sanitizeAndValidate } from '@/lib/utils/sanitize';

const LicenseTermsSchema = z.object({
  duration: createSanitizedStringSchema({ min: 1, max: 100, errorMessage: 'Duration is required' }),
  territory: createSanitizedStringSchema({
    min: 1,
    max: 100,
    errorMessage: 'Territory is required',
  }),
  exclusivity: z.boolean(),
  royaltyRate: z.number().min(0).max(100).optional(),
  restrictions: z.array(createSanitizedStringSchema({ max: 500 })).optional(),
});

const CreateLicenseSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
  artistId: z.string().min(1, 'Artist ID is required'),
  brandId: z.string().min(1, 'Brand ID is required'),
  licenseType: z.enum(['personal', 'commercial', 'full'], {
    message: 'License type must be personal, commercial, or full',
  }),
  terms: LicenseTermsSchema.optional(),
});

// Fixed: restrictions is required (non-optional), royaltyRate allows undefined explicitly
export interface LicenseAgreement {
  id: string;
  submissionId: string;
  artistId: string;
  brandId: string;
  licenseType: 'personal' | 'commercial' | 'full';
  terms: {
    duration: string;
    territory: string;
    exclusivity: boolean;
    royaltyRate?: number | undefined; // Explicitly allow undefined
    restrictions: string[]; // Required array — provide default
  };
  status: 'draft' | 'pending' | 'active' | 'expired';
  createdAt: string;
  updatedAt: string;
}

const licensingRateLimitOptions = {
  limit: 30,
  windowMs: 60 * 1000,
};

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info(`License creation request received`, {
    context: 'licensing-api',
    requestId,
    timestamp: new Date().toISOString(),
  });

  try {
    const rateLimitResult = await rateLimit(licensingRateLimitOptions)(req);
    if (rateLimitResult) return rateLimitResult;

    const authResult = await requireAuth(req);
    if (authResult) return authResult;

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body', requestId },
        { status: 400 }
      );
    }

    const validation = sanitizeAndValidate(body, CreateLicenseSchema, 'licensing-api');
    if (!validation.success) {
      logger.warn('Invalid license data', {
        context: 'licensing-api',
        requestId,
        errors: validation.errors,
        bodySnippet: JSON.stringify(body).slice(0, 200) + '...',
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid license data',
          details: validation.errors,
          requestId,
        },
        { status: 400 }
      );
    }

    const { submissionId, artistId, brandId, licenseType, terms } = validation.data!;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userRole = session?.user?.role;

    logger.info(`Creating license agreement`, {
      context: 'licensing-api',
      requestId,
      data: { licenseType, submissionId, artistId, brandId, userId, userRole },
    });

    const hasPermission =
      userRole === 'admin' || userId === brandId || (userRole === 'brand' && userId === brandId);

    if (!hasPermission) {
      logger.warn(`Permission denied for license creation`, {
        context: 'licensing-api',
        requestId,
        data: { userId, userRole, brandId },
      });
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to create licenses for this brand",
          requestId,
        },
        { status: 403 }
      );
    }

    const licenseAgreement: LicenseAgreement = {
      id: `LICENSE-${Math.floor(Math.random() * 10000)}`,
      submissionId,
      artistId,
      brandId,
      licenseType,
      terms: {
        duration: terms?.duration ?? '1 year',
        territory: terms?.territory ?? 'Worldwide',
        exclusivity: terms?.exclusivity ?? false,
        royaltyRate: terms?.royaltyRate, // already optional
        restrictions: terms?.restrictions ?? ['No modifications allowed', 'Attribution required'],
      },
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info(`License agreement created successfully`, {
      context: 'licensing-api',
      requestId,
      data: { licenseId: licenseAgreement.id, processingTime: Date.now() - startTime },
    });

    return NextResponse.json({
      success: true,
      licenseAgreement,
      meta: { requestId, processingTime: Date.now() - startTime },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error('Error creating license agreement', {
      context: 'licensing-api',
      requestId,
      data: { error: errorMessage, stack: errorStack, processingTime: Date.now() - startTime },
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create license agreement',
        message: errorMessage,
        meta: { requestId, processingTime: Date.now() - startTime },
      },
      { status: 500 }
    );
  }
}
