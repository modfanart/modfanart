// src/lib/config.ts

import { get } from '@vercel/edge-config';
// Safe fetch with fallback
import { LogLevel } from 'kysely';
// Full application configuration object
export const config = {
  // Blob Store configuration
  blob: {
    key: process.env.BLOB_STORAGE_KEY || '',
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },

  // Grok AI configuration
  grokAi: {
    apiKey: process.env.GROK_API_KEY || '',
    baseUrl: 'https://api.grok.ai/v1',
    timeout: 30000, // 30 seconds
  },
  stripe: {
    publicKey: process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] || '',
  },
  duckDb: {
    connectionString: process.env.DUCKDB_CONNECTION_STRING || '',
    mdToken: process.env.MOTHERDUCK_TOKEN || '', // ← add this
    maxConnections: 5,
    idleTimeout: 60000,
  },

  // Edge Config configuration
  edgeConfig: {
    key: process.env.EDGE_CONFIG_KEY || '',
    defaults: {
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
          assignmentTimeout: 30, // minutes
        },
      },
      limits: {
        maxSubmissionSize: 5 * 1024 * 1024, // 5MB
        maxSubmissionsPerUser: 10,
        maxSubmissionsPerDay: 1000,
        maxApiRequestsPerMinute: 60,
      },
    },
  },

  // External API configuration
  api: {
    aiornot: {
      key: process.env.AIORNOT_API_KEY || '',
      baseUrl: 'https://api.aiornot.com/v1',
      timeout: 10000, // 10 seconds
    },
    openai: {
      key: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4o',
      timeout: 30000, // 30 seconds
    },
  },

  // Debug settings
  debug: {
    enabled: process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true',
    level: (process.env.DEBUG_LEVEL ||
      (process.env.NODE_ENV === 'production' ? 'info' : 'debug')) as
      | 'debug'
      | 'info'
      | 'warn'
      | 'error',
    pattern: process.env.DEBUG || (process.env.NODE_ENV === 'production' ? '' : 'mod:*'),
  },
  clientDebug: process.env.NEXT_PUBLIC_DEBUG === 'true',
};

// === Named exports required by other modules ===

/**
 * Safe wrapper for Vercel Edge Config `get` function.
 * Falls back gracefully if EDGE_CONFIG_KEY is not set.
 */
export const edgeConfig = {
  get: async (key: string) => {
    if (!process.env.EDGE_CONFIG_KEY) {
      console.warn('EDGE_CONFIG_KEY is not configured – using defaults');
      return null;
    }
    try {
      return await get(key);
    } catch (error) {
      console.error(`Failed to fetch Edge Config item "${key}":`, error);
      return null;
    }
  },
};

/**
 * Constant keys used to store/retrieve items in Edge Config.
 * Use these with `edgeConfig.get()` throughout the app.
 */
export const CONFIG = {
  FEATURES: 'feature_flags' as const,
  PRICING: 'pricing_config' as const,
  COMPLIANCE_RULES: 'compliance_rules' as const,
  AI_SETTINGS: 'ai_settings' as const,
} as const;

// === Types ===

export type FeatureFlags = {
  enableGrokIntegration: boolean;
  enableAiModeration: boolean;
  enableAutoApproval: boolean;
  enableAnalytics: boolean;
  enableBetaFeatures: boolean;
  [key: string]: boolean; // ✅ allow dynamic string indexing
};

export type ModerationSettings = {
  thresholds: {
    aiScore: number;
    ipCompliance: number;
    contentSafety: number;
    autoApprove: number;
    autoReject: number;
  };
  reviewQueue: {
    maxItems: number;
    assignmentTimeout: number;
  };
};

export type Limits = {
  maxSubmissionSize: number;
  maxSubmissionsPerUser: number;
  maxSubmissionsPerDay: number;
  maxApiRequestsPerMinute: number;
};

export type EdgeConfigData = {
  featureFlags: FeatureFlags;
  moderationSettings: ModerationSettings;
  limits: Limits;
  [key: string]: any;
};

// === Validation ===

export function validateConfig() {
  const requiredVars = [
    { key: 'BLOB_STORAGE_KEY', value: config.blob.key },
    { key: 'GROK_API_KEY', value: config.grokAi.apiKey },
    { key: 'DUCKDB_CONNECTION_STRING', value: config.duckDb.connectionString },
    { key: 'EDGE_CONFIG_KEY', value: config.edgeConfig.key },
  ];

  const missingVars = requiredVars.filter((v) => !v.value);

  if (missingVars.length > 0) {
    console.warn(
      `Missing required environment variables: ${missingVars.map((v) => v.key).join(', ')}`
    );
    return false;
  }

  return true;
}
