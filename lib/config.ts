// Environment variables and configuration
export const config = {
  // Blob Store configuration
  blob: {
    key: process.env.BLOB_STORAGE_KEY || "",
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },

  // GrokAi configuration
  grokAi: {
    apiKey: process.env.GROK_API_KEY || "",
    baseUrl: "https://api.grok.ai/v1",
    timeout: 30000, // 30 seconds
  },

  // DuckDB configuration
  duckDb: {
    connectionString: process.env.DUCKDB_CONNECTION_STRING || "",
    maxConnections: 5,
    idleTimeout: 60000, // 60 seconds
  },

  // Edge Config configuration
  edgeConfig: {
    key: process.env.EDGE_CONFIG_KEY || "",
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

  // API configuration
  api: {
    aiornot: {
      key: process.env.AIORNOT_API_KEY || "",
      baseUrl: "https://api.aiornot.com/v1",
      timeout: 10000, // 10 seconds
    },
    openai: {
      key: process.env.OPENAI_API_KEY || "",
      model: "gpt-4o",
      timeout: 30000, // 30 seconds
    },
  },

  // Debug configuration
  debug: process.env.DEBUG || "mod:*",
  clientDebug: process.env.NEXT_PUBLIC_DEBUG === "true",
}

// Types for Edge Config data
export type FeatureFlags = {
  enableGrokIntegration: boolean
  enableAiModeration: boolean
  enableAutoApproval: boolean
  enableAnalytics: boolean
  enableBetaFeatures: boolean
  [key: string]: boolean
}

export type ModerationSettings = {
  thresholds: {
    aiScore: number
    ipCompliance: number
    contentSafety: number
    autoApprove: number
    autoReject: number
  }
  reviewQueue: {
    maxItems: number
    assignmentTimeout: number
  }
}

export type Limits = {
  maxSubmissionSize: number
  maxSubmissionsPerUser: number
  maxSubmissionsPerDay: number
  maxApiRequestsPerMinute: number
}

export type EdgeConfigData = {
  featureFlags: FeatureFlags
  moderationSettings: ModerationSettings
  limits: Limits
  [key: string]: any
}

// Validate required environment variables
export function validateConfig() {
  const requiredVars = [
    { key: "BLOB_STORAGE_KEY", value: config.blob.key },
    { key: "GROK_API_KEY", value: config.grokAi.apiKey },
    { key: "DUCKDB_CONNECTION_STRING", value: config.duckDb.connectionString },
    { key: "EDGE_CONFIG_KEY", value: config.edgeConfig.key },
  ]

  const missingVars = requiredVars.filter((v) => !v.value)

  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.map((v) => v.key).join(", ")}`)
    return false
  }

  return true
}

