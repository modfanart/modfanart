// backend/src/controllers/submission.controller.js
const submissionRepo = require('../repositories/submission.repository');

async function getSubmissionByIdHandler(req, res, next) {
  try {
    const submission = await submissionRepo.getById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }
    res.json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
}

async function getSubmissionsByUserIdHandler(req, res, next) {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const result = await submissionRepo.getByUserId(req.params.userId, Number(limit), Number(offset));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

async function getSubmissionsByStatusHandler(req, res, next) {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }
    const result = await submissionRepo.getByStatus(status, Number(limit), Number(offset));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

async function searchSubmissionsHandler(req, res, next) {
  try {
    const result = await submissionRepo.search(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
async function analyzeSubmission(req, res, next) {
  try {
    // Rate limiting is applied in the route — we just handle the logic here

    // Parse & validate body
    const parseResult = SubmissionAnalysisSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid submission data',
        details: parseResult.error.format(),
      });
    }

    const { title, description, category, originalIp, imageUrl, userId } = parseResult.data;

    logger.info('Starting submission analysis', {
      context: 'submission-analysis',
      userId,
      title,
      category,
    });

    // Check AI moderation feature flag (adapt from your edge-config)
    let isAiModerationEnabled = true; // fallback
    try {
      const { getFeatureFlag } = require('../config/edge-config'); // copy/adapt from frontend
      isAiModerationEnabled = await getFeatureFlag('enableAiModeration');
    } catch (err) {
      logger.warn('Failed to fetch feature flag, using default (true)');
    }

    if (!isAiModerationEnabled) {
      return res.status(503).json({
        success: false,
        error: 'Submission analysis is currently disabled.',
      });
    }

    // Choose AI provider (Grok or fallback)
    const isGrokEnabled = await (async () => {
      try {
        const { getFeatureFlag } = require('../config/edge-config');
        return await getFeatureFlag('enableGrokIntegration');
      } catch {
        return false;
      }
    })();

    let analysis;

    if (isGrokEnabled) {
      try {
        const { analyzeSubmissionContent } = require('../lib/ai/grok-client'); // copy/adapt
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
          suggestedTags: grokResult.suggestedTags ?? [category],
        };
      } catch (err) {
        logger.error('Grok analysis failed, falling back', { error: err.message });
        isGrokEnabled = false; // fallback
      }
    }

    if (!isGrokEnabled) {
      try {
        const analyzeSubmission = require('../lib/ai/analyze-submission').default; // copy/adapt
        const legacyResult = await analyzeSubmission({
          title,
          description,
          category,
          originalIp,
          tags: [category],
          imageUrl,
        });

        analysis = {
          isAppropriate: legacyResult.finalRecommendation !== 'reject',
          confidenceScore: Math.round((1 - legacyResult.aiDetection.score) * 100),
          reasoning: legacyResult.contentAnalysis.reasoningSummary || 'No reasoning provided',
          suggestedTags: [category],
        };
      } catch (err) {
        logger.error('Fallback AI analysis failed', { error: err.message });
        throw err;
      }
    }

    // Track analytics if enabled
    try {
      const isAnalyticsEnabled = await (async () => {
        try {
          const { getFeatureFlag } = require('../config/edge-config');
          return await getFeatureFlag('enableAnalytics');
        } catch {
          return true;
        }
      })();

      if (isAnalyticsEnabled) {
        const { trackUserActivity } = require('../lib/db/motherduck'); // copy/adapt
        await trackUserActivity({
          userId,
          actionType: 'submission_analysis',
          resourceType: 'submission',
          resourceId: crypto.randomUUID(),
          metadata: {
            title,
            category,
            originalIp,
            isAppropriate: analysis.isAppropriate,
            confidenceScore: analysis.confidenceScore,
            provider: isGrokEnabled ? 'grok' : 'openai',
          },
        });
      }
    } catch (err) {
      logger.warn('Analytics tracking failed', { error: err.message });
    }

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    logger.error('Unexpected error during submission analysis', {
      error: error.message || error,
      context: 'submission-analysis',
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { message: error.message }),
    });
  }
}
// Note: create/update/delete would call repo methods + clearCache
// Add those when you're ready (similar to previous models)

module.exports = {
    analyzeSubmission,
  getSubmissionByIdHandler,
  getSubmissionsByUserIdHandler,
  getSubmissionsByStatusHandler,
  searchSubmissionsHandler,
};