import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getComplianceRules } from '@/lib/db/config-service';
import { getSubmissionsByStatus } from '@/lib/db/models/submission';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* -------------------------------------------------------------------------- */
/*                                   GET                                      */
/* -------------------------------------------------------------------------- */

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  /* ---------------------------- Auth Guard ---------------------------- */
  const authHeader = request.headers.get('authorization');

  if (!process.env.BYPASS_AUTH) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', requestId },
        { status: 401 }
      );
    }
  }

  try {
    /* ---------------------- Fetch Data (Parallel) ---------------------- */
    const [
      pendingSubmissions,
      reviewSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      licensedSubmissions,
      complianceRules,
    ] = await Promise.all([
      getSubmissionsByStatus('pending'),
      getSubmissionsByStatus('review'),
      getSubmissionsByStatus('approved'),
      getSubmissionsByStatus('rejected'),
      getSubmissionsByStatus('licensed'),
      getComplianceRules(),
    ]);

    /* ---------------------------- Metrics ----------------------------- */
    const submissionCounts = {
      pending: pendingSubmissions.length,
      review: reviewSubmissions.length,
      approved: approvedSubmissions.length,
      rejected: rejectedSubmissions.length,
      licensed: licensedSubmissions.length,
    };

    const metrics = {
      submissionCounts: {
        ...submissionCounts,
        total: Object.values(submissionCounts).reduce((a, b) => a + b, 0),
      },
      aiDetection: {
        threshold: complianceRules.aiDetectionThreshold,
        autoRejectThreshold: complianceRules.autoRejectThreshold,
        autoApproveThreshold: complianceRules.autoApproveThreshold,
      },
      complianceSettings: {
        requireHumanReview: complianceRules.requireHumanReview,
        contentSafetyThreshold: complianceRules.contentSafetyThreshold,
        ipComplianceThreshold: complianceRules.ipComplianceThreshold,
      },
      timestamp: new Date().toISOString(),
    };

    logger.info('Moderation metrics requested', {
      context: 'moderation-metrics',
      requestId,
      data: metrics.submissionCounts,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      metrics,
      meta: {
        requestId,
        processingTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    logger.error('Error fetching moderation metrics', {
      context: 'moderation-metrics',
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch moderation metrics',
        requestId,
      },
      { status: 500 }
    );
  }
}
