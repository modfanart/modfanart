export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { analyzeSubmission } from '@/lib/services/moderation-service';

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

export async function POST(request: NextRequest) {
  /* -------------------- Block in Production -------------------- */
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Endpoint not available in production' },
      { status: 404 }
    );
  }

  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info('Test moderation request received', {
    context: 'test-moderation-api',
    requestId,
  });

  try {
    /* ---------------------------- Body --------------------------- */
    let body: any;

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

    const {
      title = '',
      description = '',
      category = '',
      originalIp = '',
      tags = [],
      imageUrl = null,
    } = body ?? {};

    /* ------------------------ Moderation ------------------------- */
    const analysis = await analyzeSubmission(
      title,
      description,
      category,
      originalIp,
      tags,
      imageUrl
    );

    logger.info('Test moderation completed', {
      context: 'test-moderation-api',
      requestId,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      analysis,
      meta: {
        requestId,
        processingTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    logger.error('Error in test moderation API', {
      context: 'test-moderation-api',
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process test submission',
        requestId,
      },
      { status: 500 }
    );
  }
}
