// backend/src/controllers/admin.controller.js
const { logger } = require('../utils/logger');
const fetch = require('node-fetch'); // install: npm install node-fetch@2

// Default settings (same as your code)
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

async function getAdminSettings(req, res, next) {
  try {
    // Apply rate limiting (already applied in route)
    const edgeConfigUrl = process.env.EDGE_CONFIG;

    if (!edgeConfigUrl) {
      logger.warn('EDGE_CONFIG not set — returning default settings');
      return res.json(defaultSettings);
    }

    // Vercel Edge Config is a simple JSON endpoint
    const response = await fetch(edgeConfigUrl, {
      headers: {
        Authorization: `Bearer ${process.env.EDGE_CONFIG_TOKEN || ''}`,
      },
    });

    if (!response.ok) {
      logger.warn('Failed to fetch Edge Config', { status: response.status });
      return res.json(defaultSettings);
    }

    const data = await response.json();

    // Merge with defaults (same as your code)
    const settings = {
      featureFlags: data.featureFlags ?? defaultSettings.featureFlags,
      moderationSettings: data.moderationSettings ?? defaultSettings.moderationSettings,
      limits: data.limits ?? defaultSettings.limits,
    };

    res.json(settings);
  } catch (error) {
    logger.error('Failed to fetch admin settings', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to retrieve settings' });
  }
}

function postAdminSettings(req, res) {
  res.status(400).json({
    success: false,
    error: 'Runtime updates are not supported. Update settings via the Vercel Dashboard or CLI.',
  });
}

module.exports = {
  getAdminSettings,
  postAdminSettings,
};