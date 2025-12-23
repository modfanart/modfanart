import { createClient } from '@vercel/edge-config';
import {
  config,
  type EdgeConfigData,
  type FeatureFlags,
  type ModerationSettings,
  type Limits,
} from './config';
import { logger } from './logger';

// Edge Config client
let edgeConfigClient: ReturnType<typeof createClient> | null = null;

/**
 * Get the Edge Config client
 */
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
    const data = await client.getAll();

    logger.debug('Retrieved Edge Config data', {
      context: 'edge-config',
      keys: Object.keys(data),
    });

    return {
      featureFlags: (data.featureFlags as FeatureFlags) || config.edgeConfig.defaults.featureFlags,
      moderationSettings:
        (data.moderationSettings as ModerationSettings) ||
        config.edgeConfig.defaults.moderationSettings,
      limits: (data.limits as Limits) || config.edgeConfig.defaults.limits,
      ...data,
    };
  } catch (error) {
    logger.error('Failed to retrieve Edge Config data', error, { context: 'edge-config' });

    // Return defaults if Edge Config is unavailable
    return {
      ...config.edgeConfig.defaults,
    };
  }
}

/**
 * Get a specific feature flag
 */
export async function getFeatureFlag(key: string): Promise<boolean> {
  try {
    const client = getEdgeConfigClient();
    const featureFlags = (await client.get('featureFlags')) as FeatureFlags;

    // Return the specific flag or false if not found
    return featureFlags?.[key] ?? config.edgeConfig.defaults.featureFlags[key] ?? false;
  } catch (error) {
    logger.error(`Failed to retrieve feature flag: ${key}`, error, { context: 'edge-config' });

    // Return default if Edge Config is unavailable
    return config.edgeConfig.defaults.featureFlags[key] ?? false;
  }
}

/**
 * Get moderation settings
 */
export async function getModerationSettings(): Promise<ModerationSettings> {
  try {
    const client = getEdgeConfigClient();
    const settings = (await client.get('moderationSettings')) as ModerationSettings;

    return settings || config.edgeConfig.defaults.moderationSettings;
  } catch (error) {
    logger.error('Failed to retrieve moderation settings', error, { context: 'edge-config' });

    // Return defaults if Edge Config is unavailable
    return config.edgeConfig.defaults.moderationSettings;
  }
}

/**
 * Get system limits
 */
export async function getLimits(): Promise<Limits> {
  try {
    const client = getEdgeConfigClient();
    const limits = (await client.get('limits')) as Limits;

    return limits || config.edgeConfig.defaults.limits;
  } catch (error) {
    logger.error('Failed to retrieve system limits', error, { context: 'edge-config' });

    // Return defaults if Edge Config is unavailable
    return config.edgeConfig.defaults.limits;
  }
}

/**
 * Check if a feature is enabled
 * Client-side safe version that uses defaults if needed
 */
export function isFeatureEnabled(key: string): boolean {
  // For client-side, we need to use the Next.js public runtime config
  // This assumes you've exposed the necessary flags via Next.js config
  if (typeof window !== 'undefined') {
    return (window as any).__NEXT_DATA__?.props?.pageProps?.featureFlags?.[key] ?? false;
  }

  // Default to the static config for SSR/SSG
  return config.edgeConfig.defaults.featureFlags[key] ?? false;
}

/**
 * Helper to hydrate client-side feature flags
 * Call this in getServerSideProps or similar
 */
export async function getClientFeatureFlags(): Promise<FeatureFlags> {
  try {
    const allConfig = await getEdgeConfig();
    return allConfig.featureFlags;
  } catch (error) {
    return config.edgeConfig.defaults.featureFlags;
  }
}

/**
 * Set a specific key in Edge Config
 */
export async function setEdgeConfig<T>(key: string, value: T): Promise<void> {
  try {
    const client = getEdgeConfigClient();
    await client.set(key, value);

    logger.debug(`Set Edge Config for key: ${key}`, {
      context: 'edge-config',
      value,
    });
  } catch (error) {
    logger.error(`Failed to set Edge Config for key: ${key}`, error, {
      context: 'edge-config',
    });
    throw error;
  }
}
