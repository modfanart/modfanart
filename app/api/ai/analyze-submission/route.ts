import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeSubmissionContent } from '@/lib/ai/grok-client';
import { analyzeSubmission } from '@/lib/ai/analyze-submission';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/middleware/rate-limit';
import { getFeatureFlag } from '@/lib/edge-config';
import { trackUserActivity } from '@/lib/db/motherduck';

// Input validation schema
const SubmissionSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  category: z.string().min(1).max(50),
  originalIp: z.string().min(1).max(100),
  imageUrl: z.string().url(),
  userId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    // Check if AI moderation is enabled
    const isAiModerationEnabled = await getFeatureFlag('enableAiModeration');
    if (!isAiModerationEnabled) {
      return NextResponse.json(
        { error: 'AI moderation is currently disabled' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = SubmissionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { title, description, category, originalIp, imageUrl, userId } = validationResult.data;

    logger.info('Analyzing submission', {
      context: 'submission-analysis',
      title,
      category,
      userId,
    });

    // Check if GrokAi integration is enabled
    const isGrokEnabled = await getFeatureFlag('enableGrokIntegration');
    
    let analysis;
    
    if (isGrokEnabled) {
      // Use GrokAi for analysis
      analysis = await analyzeSubmissionContent({
        title,
        description,
        category,
        originalIp,
        imageUrl,
      });
      
      logger.info('Used GrokAi for submission analysis', {
        context: 'submission-analysis',
        isAppropriate: analysis.isAppropriate,
        confidenceScore: analysis.confidenceScore,
      });
    } else {
      // Fall back to existing OpenAI + AIORNOT analysis
      const aiAnalysis = await analyzeSubmission(
        title,
        description,
        category,
        originalIp,
        [category],
        imageUrl,
      );
      
      // Convert the existing analysis format to match GrokAi format
      analysis = {
        isAppropriate: aiAnalysis.finalRecommendation !== 'reject',
        confidenceScore: Math.round((1 - aiAnalysis.aiDetection.score) * 100),
        reasoning: aiAnalysis.contentAnalysis.reasoningSummary,
        suggestedTags: [category, originalIp],
      };
      
      logger.info('Used OpenAI + AIORNOT for submission analysis', {
        context: 'submission-analysis',
        recommendation: aiAnalysis.finalRecommendation,
        aiScore: aiAnalysis.aiDetection.score,
      });
    }

    // Track this activity in MotherDuck
    const isAnalyticsEnabled = await getFeatureFlag('enableAnalytics');
    
    if (isAnalyticsEnabled) {
      await trackUserActivity({
        userId,
        actionType: 'submission_analysis',
        resourceType: 'submission',
        resourceId: crypto.randomUUID(), // Placeholder ID
        metadata: {
          title,
          category,
          originalIp,
          isAppropriate: analysis.isAppropriate,
          confidenceScore: analysis.confidenceScore,
        },
      });
    }

    // Return the analysis results
    return NextResponse.json({
      success: true,
      analysis: {
        isAppropriate: analysis.isAppropriate,
        confidenceScore: analysis.confidenceScore,
        reasoning: analysis.reasoning,
        suggestedTags: analysis.suggestedTags,
      },
    });
  } catch (error) {
    logger.error('Error in submission analysis', error, {
      context: 'submission-analysis',
    });

    return NextResponse.json(
      { error: 'Failed to analyze submission', message: (error as Error).message },
      { status: 500 }
    );
  }
}

