// backend/src/controllers/moderation.controller.js
const { logger } = require('../utils/logger');
const { getSubmissionsByStatus } = require('../models/submission');
const { getComplianceRules } = require('../config/compliance'); // adapt from your config-service
const { createModeratedSubmission } = require('../models/moderation.model');
const { db } = require('../config');
async function getModerationMetrics(req, res, next) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Fetch in parallel
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

    res.json({
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
      error: error.message || error,
      processingTime: Date.now() - startTime,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to fetch moderation metrics',
      requestId,
    });
  }
}

async function createModerationSubmission(req, res, next) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info('Moderation submission request received', {
    context: 'moderation-api',
    requestId,
  });

  try {
    // Auth is already handled by middleware — we have req.user
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        requestId,
      });
    }

    // Create moderated submission
    const submission = await createModeratedSubmission({
      ...req.body,
      userId: user.id, // enforce from token
    });

    const processingTime = Date.now() - startTime;

    logger.info('Moderation completed successfully', {
      context: 'moderation-api',
      requestId,
      submissionId: submission.id,
      status: submission.status,
      processingTime,
    });

    res.json({
      success: true,
      submission,
      meta: {
        requestId,
        processingTime,
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;

    logger.error('Moderation API failed', {
      context: 'moderation-api',
      requestId,
      error: error.message || error,
      processingTime,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to process submission',
      requestId,
    });
  }
}

module.exports = { createModerationSubmission };
module.exports = { getModerationMetrics };