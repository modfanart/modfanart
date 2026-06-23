import { getEdgeConfig } from "../edge-config"
import { logger } from "../logger"

/**
 * Get moderation thresholds from Edge Config
 */
export async function getModerationThresholds() {
  try {
    const config = await getEdgeConfig()
    return config.moderationSettings.thresholds
  } catch (error) {
    logger.error("Failed to get moderation thresholds", error, { context: "edge-config" })
    // Return default thresholds
    return {
      aiScore: 0.7,
      ipCompliance: 7,
      contentSafety: 7,
      autoApprove: 3,
      autoReject: 8,
    }
  }
}

/**
 * Check if a submission should be auto-approved based on thresholds
 */
export async function shouldAutoApprove(scores: {
  aiScore: number
  ipComplianceScore: number
  contentSafetyScore: number
  overallRiskScore: number
}) {
  try {
    const thresholds = await getModerationThresholds()

    return (
      scores.aiScore < thresholds.aiScore &&
      scores.ipComplianceScore < thresholds.ipCompliance &&
      scores.contentSafetyScore < thresholds.contentSafety &&
      scores.overallRiskScore < thresholds.autoApprove
    )
  } catch (error) {
    logger.error("Failed to check auto-approve", error, { context: "edge-config" })
    return false // Default to manual review if there's an error
  }
}

/**
 * Check if a submission should be auto-rejected based on thresholds
 */
export async function shouldAutoReject(scores: {
  aiScore: number
  ipComplianceScore: number
  contentSafetyScore: number
  overallRiskScore: number
}) {
  try {
    const thresholds = await getModerationThresholds()

    return (
      scores.aiScore > 0.95 || // Very high AI score
      scores.ipComplianceScore > thresholds.ipCompliance ||
      scores.contentSafetyScore > thresholds.contentSafety ||
      scores.overallRiskScore > thresholds.autoReject
    )
  } catch (error) {
    logger.error("Failed to check auto-reject", error, { context: "edge-config" })
    return false // Default to manual review if there's an error
  }
}

/**
 * Get feature flag status with fallback
 */
export async function getFeatureFlagWithFallback(key: string, defaultValue = false): Promise<boolean> {
  try {
    const config = await getEdgeConfig()
    return config.featureFlags[key] ?? defaultValue
  } catch (error) {
    logger.error(`Failed to get feature flag: ${key}`, error, { context: "edge-config" })
    return defaultValue
  }
}

/**
 * Get all feature flags for client-side hydration
 */
export async function getClientSafeFeatureFlags() {
  try {
    const config = await getEdgeConfig()

    // Only include flags that are safe for client exposure
    return {
      enableGrokIntegration: config.featureFlags.enableGrokIntegration ?? false,
      enableAiModeration: config.featureFlags.enableAiModeration ?? true,
      enableAutoApproval: config.featureFlags.enableAutoApproval ?? false,
      enableAnalytics: config.featureFlags.enableAnalytics ?? true,
      enableBetaFeatures: config.featureFlags.enableBetaFeatures ?? false,
    }
  } catch (error) {
    logger.error("Failed to get client-safe feature flags", error, { context: "edge-config" })

    // Return defaults
    return {
      enableGrokIntegration: false,
      enableAiModeration: true,
      enableAutoApproval: false,
      enableAnalytics: true,
      enableBetaFeatures: false,
    }
  }
}

