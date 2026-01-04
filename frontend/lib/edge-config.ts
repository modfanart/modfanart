import { createClient } from '@vercel/edge-config';
import {
  config,
  type EdgeConfigData,
  type FeatureFlags,
  type ModerationSettings,
  type Limits,
} from './config';
import { logger } from './logger';

let edgeConfigClient: ReturnType<typeof createClient> | null = null;

function getEdgeConfigClient() {
  if (!edgeConfigClient) {
    edgeConfigClient = createClient(config.edgeConfig.key);
  }
  return edgeConfigClient;
}

/**
 * Get all configuration from Edge Config
 */
export async function getEdgeConfig(): Promise<EdgeConfigData> {
  try {
    const client = getEdgeConfigClient();
    const data = await client.getAll(); // Record<string, unknown>

    logger.debug('Retrieved Edge Config data', {
      context: 'edge-config',
      keys: Object.keys(data),
    });

    return {
      // Use bracket notation + type assertion
      featureFlags:
        (data['featureFlags'] as FeatureFlags) ?? config.edgeConfig.defaults.featureFlags,
      moderationSettings:
        (data['moderationSettings'] as ModerationSettings) ??
        config.edgeConfig.defaults.moderationSettings,
      limits: (data['limits'] as Limits) ?? config.edgeConfig.defaults.limits,
      ...data, // If you need other dynamic keys, they'll be unknown anyway
    };
  } catch (error) {
    logger.error('Failed to retrieve Edge Config data', error, { context: 'edge-config' });
    return { ...config.edgeConfig.defaults };
  }
}

/**
 * Get a specific feature flag
 */
export async function getFeatureFlag(key: keyof FeatureFlags): Promise<boolean> {
  try {
    const client = getEdgeConfigClient();
    const featureFlags = (await client.get('featureFlags')) as FeatureFlags | undefined;

    // Use type assertion to satisfy TypeScript
    return (
      featureFlags?.[key as keyof FeatureFlags] ??
      (config.edgeConfig.defaults.featureFlags as FeatureFlags)[key] ??
      false
    );
  } catch (error) {
    logger.error(`Failed to retrieve feature flag: ${key}`, error, { context: 'edge-config' });
    return (config.edgeConfig.defaults.featureFlags as FeatureFlags)[key] ?? false;
  }
}

/**
 * Get moderation settings
 */
export async function getModerationSettings(): Promise<ModerationSettings> {
  try {
    const client = getEdgeConfigClient();
    const settings = (await client.get('moderationSettings')) as ModerationSettings | undefined;

    return settings ?? config.edgeConfig.defaults.moderationSettings;
  } catch (error) {
    logger.error('Failed to retrieve moderation settings', error, { context: 'edge-config' });
    return config.edgeConfig.defaults.moderationSettings;
  }
}

/**
 * Get system limits
 */
export async function getLimits(): Promise<Limits> {
  try {
    const client = getEdgeConfigClient();
    const limits = (await client.get('limits')) as Limits | undefined;

    return limits ?? config.edgeConfig.defaults.limits;
  } catch (error) {
    logger.error('Failed to retrieve system limits', error, { context: 'edge-config' });
    return config.edgeConfig.defaults.limits;
  }
}

/**
 * Check if a feature is enabled (client-side safe)
 */
export function isFeatureEnabled(key: keyof FeatureFlags): boolean {
  if (typeof window !== 'undefined') {
    const clientFlags = (window as any).__NEXT_DATA__?.props?.pageProps?.featureFlags as
      | FeatureFlags
      | undefined;
    return clientFlags?.[key as keyof FeatureFlags] ?? false;
  }

  return (config.edgeConfig.defaults.featureFlags as FeatureFlags)[key] ?? false;
}

/**
 * Helper to hydrate client-side feature flags
 */
export async function getClientFeatureFlags(): Promise<FeatureFlags> {
  try {
    const allConfig = await getEdgeConfig();
    return allConfig.featureFlags;
  } catch (error) {
    return config.edgeConfig.defaults.featureFlags;
  }
}
