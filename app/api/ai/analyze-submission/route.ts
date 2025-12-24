import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeSubmissionContent } from '@/lib/ai/grok-client';
import analyzeSubmission from '@/lib/ai/analyze-submission';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/middleware/rate-limit';
import { getFeatureFlag } from '@/lib/edge-config';
import { trackUserActivity } from '@/lib/db/motherduck';
import { randomUUID } from 'crypto'; // Node.js crypto

// Input validation schema
const SubmissionSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  category: z.string().min(1).max(50),
  originalIp: z.string().min(1).max(100),
  imageUrl: z.string().url(),
  userId: z.string().uuid(),
});

type SubmissionInput = z.infer<typeof SubmissionSchema>;

// Unified analysis result shape
type AnalysisResult = {
  isAppropriate: boolean;
  confidenceScore: number; // 0-100
  reasoning: string;
  suggestedTags: string[];
};

export async function POST(request: NextRequest) {
  try {
    // 1. Initialize the middleware with options
    const limiter = rateLimit({
      limit: 10,
      windowMs: 60 * 1000, // 1 minute
    });

    // 2. Execute it by passing the request
    const rateLimitResponse = await limiter(request);

    // 3. If it returns a NextResponse (the 429 error), return it immediately
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Check if AI moderation is enabled
    const isAiModerationEnabled = await getFeatureFlag('enableAiModeration');
    if (!isAiModerationEnabled) {
      return NextResponse.json(
        { error: 'Submission analysis is currently disabled.' },
        { status: 503 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parseResult = SubmissionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid submission data',
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { title, description, category, originalIp, imageUrl, userId } = parseResult.data;

    logger.info('Starting submission analysis', {
      context: 'submission-analysis',
      userId,
      title,
      category,
    });

    const isGrokEnabled = await getFeatureFlag('enableGrokIntegration');

    let analysis: AnalysisResult;

    if (isGrokEnabled) {
      // Use Grok AI
      const grokResult = await analyzeSubmissionContent({
        title,
        description,
        category,
        originalIp,
        imageUrl,
      });

      analysis = {
        isAppropriate: grokResult.isAppropriate,
        confidenceScore: grokResult.confidenceScore,
        reasoning: grokResult.reasoning,
        suggestedTags: grokResult.suggestedTags ?? [category, originalIp],
      };

      logger.info('Grok AI analysis completed', {
        context: 'submission-analysis',
        isAppropriate: analysis.isAppropriate,
        confidenceScore: analysis.confidenceScore,
      });
    } else {
      // Fallback to legacy OpenAI + AIorNot pipeline
      const legacyResult = await analyzeSubmission({
        title,
        description,
        category,
        originalIp,
        tags: [category],
        imageUrl,
      });

      // Map legacy result to unified shape
      analysis = {
        isAppropriate: legacyResult.finalRecommendation !== 'reject',
        confidenceScore: Math.round((1 - legacyResult.aiDetection.score) * 100),
        reasoning: legacyResult.contentAnalysis.reasoningSummary || 'No reasoning provided',
        suggestedTags: [category, originalIp],
      };

      logger.info('Legacy AI analysis completed', {
        context: 'submission-analysis',
        recommendation: legacyResult.finalRecommendation,
        aiScore: legacyResult.aiDetection.score,
      });
    }

    // Track analytics if enabled
    const isAnalyticsEnabled = await getFeatureFlag('enableAnalytics');
    if (isAnalyticsEnabled) {
      await trackUserActivity({
        userId,
        actionType: 'submission_analysis',
        resourceType: 'submission',
        resourceId: randomUUID(),
        metadata: {
          title,
          category,
          originalIp,
          isAppropriate: analysis.isAppropriate,
          confidenceScore: analysis.confidenceScore,
          provider: isGrokEnabled ? 'grok' : 'openai',
        },
      }).catch((err) => {
        logger.warn('Failed to track submission analysis activity', err);
      });
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    logger.error('Unexpected error during submission analysis', error, {
      context: 'submission-analysis',
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    );
  }
}
