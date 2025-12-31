import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* -------------------------------------------------------------------------- */
/*                                   Schemas                                  */
/* -------------------------------------------------------------------------- */

const LicenseTermsSchema = z.object({
  duration: z.string().min(1).max(100),
  territory: z.string().min(1).max(100),
  exclusivity: z.boolean(),
  royaltyRate: z.number().min(0).max(100).optional(),
  restrictions: z.array(z.string().max(500)).optional(),
});

const CreateLicenseSchema = z.object({
  submissionId: z.string().min(1),
  artistId: z.string().min(1),
  brandId: z.string().min(1),
  licenseType: z.enum(['personal', 'commercial', 'full']),
  terms: LicenseTermsSchema.optional(),
});

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

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
    royaltyRate?: number;
    restrictions: string[];
  };
  status: 'draft' | 'pending' | 'active' | 'expired';
  createdAt: string;
  updatedAt: string;
}

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  const { randomUUID } = await import('crypto');

  const requestId = randomUUID();
  const startTime = Date.now();

  logger.info('License creation request received', {
    context: 'licensing-api',
    requestId,
  });

  try {
    /* -------------------------- Rate Limiting -------------------------- */
    const { rateLimit } = await import('@/lib/middleware/rate-limit');

    const limiter = rateLimit({
      limit: 30,
      windowMs: 60 * 1000,
    });

    const rateLimitResponse = await limiter(req);
    if (rateLimitResponse) return rateLimitResponse;

    /* --------------------------- Auth Guard ---------------------------- */
    const { requireAuth } = await import('@/lib/middleware/requireAuth');

    const authResponse = await requireAuth(req);
    if (authResponse) return authResponse;

    const { getServerSession } = await import('next-auth/next');
    const { authOptions } = await import('@/lib/auth');

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', requestId },
        { status: 401 }
      );
    }

    /* ----------------------------- Body ------------------------------- */
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body', requestId },
        { status: 400 }
      );
    }

    const parsed = CreateLicenseSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn('Invalid license payload', {
        context: 'licensing-api',
        requestId,
        errors: parsed.error.flatten(),
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid license data',
          details: parsed.error.flatten(),
          requestId,
        },
        { status: 400 }
      );
    }

    const { submissionId, artistId, brandId, licenseType, terms } = parsed.data;

    const userId = session.user.id;
    const userRole = session.user.role;

    /* -------------------------- Permission ----------------------------- */
    const hasPermission = userRole === 'admin' || (userRole === 'brand' && userId === brandId);

    if (!hasPermission) {
      logger.warn('Permission denied', {
        context: 'licensing-api',
        requestId,
        userId,
        userRole,
        brandId,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to create this license',
          requestId,
        },
        { status: 403 }
      );
    }

    /* ------------------------ License Object --------------------------- */
    const baseTerms = {
      duration: terms?.duration ?? '1 year',
      territory: terms?.territory ?? 'Worldwide',
      exclusivity: terms?.exclusivity ?? false,
      restrictions: terms?.restrictions ?? [
        'No unauthorized redistribution',
        'Attribution required',
      ],
    };

    const licenseAgreement: LicenseAgreement = {
      id: `LICENSE-${Math.floor(Math.random() * 100000)}`,
      submissionId,
      artistId,
      brandId,
      licenseType,
      terms:
        terms?.royaltyRate !== undefined
          ? { ...baseTerms, royaltyRate: terms.royaltyRate }
          : baseTerms,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info('License agreement created', {
      context: 'licensing-api',
      requestId,
      licenseId: licenseAgreement.id,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      licenseAgreement,
      meta: {
        requestId,
        processingTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    logger.error('License creation failed', {
      context: 'licensing-api',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create license',
        requestId,
      },
      { status: 500 }
    );
  }
}
