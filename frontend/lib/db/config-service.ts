// src/lib/config-service.ts

import { get } from '@vercel/edge-config';
import { z } from 'zod';
import { edgeConfig, CONFIG } from '../config';
// === Zod Schemas ===

const FeatureFlagsSchema = z.object({
  enableMarketplace: z.boolean(),
  enableAIScreening: z.boolean(),
  enableAutomatedApprovals: z.boolean(),
  enableRevenueSplitting: z.boolean(),
  enableBulkUploads: z.boolean(),
  enableAdvancedAnalytics: z.boolean(),
});

const PricingTierFreeSchema = z.object({
  monthlyPrice: z.number(),
  yearlyPrice: z.number(),
  features: z.array(z.string()),
  submissionLimit: z.number(),
});

const PricingTierPremiumArtistSchema = PricingTierFreeSchema.extend({
  revenueSplit: z.number(),
});

const PricingTierCreatorSchema = z.object({
  monthlyPrice: z.number(),
  yearlyPrice: z.number(),
  features: z.array(z.string()),
  revenueSplit: z.number(),
});

const PricingTierEnterpriseSchema = z.object({
  features: z.array(z.string()),
  revenueSplit: z.number(),
});

const PricingConfigSchema = z.object({
  tiers: z.object({
    free: PricingTierFreeSchema,
    premium_artist: PricingTierPremiumArtistSchema,
    creator: PricingTierCreatorSchema,
    enterprise: PricingTierEnterpriseSchema,
  }),
  stripePriceIds: z.record(
    z.string(), // ← keys are strings (e.g. "premium_artist", "creator")
    z.object({
      monthly: z.string(),
      yearly: z.string(),
    })
  ),
});

const ComplianceRulesSchema = z.object({
  aiDetectionThreshold: z.number(),
  contentSafetyThreshold: z.number(),
  ipComplianceThreshold: z.number(),
  requireHumanReview: z.boolean(),
  autoRejectThreshold: z.number(),
  autoApproveThreshold: z.number(),
});

const AISettingsSchema = z.object({
  models: z.object({
    detection: z.string(),
    compliance: z.string(),
    safety: z.string(),
  }),
  promptTemplates: z.object({
    compliance: z.string(),
    safety: z.string(),
    guidelines: z.string(),
  }),
});

// === Types ===

export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;
export type PricingConfig = z.infer<typeof PricingConfigSchema>;
export type ComplianceRules = z.infer<typeof ComplianceRulesSchema>;
export type AISettings = z.infer<typeof AISettingsSchema>;

// === Defaults ===

const defaultFeatureFlags: FeatureFlags = {
  enableMarketplace: true,
  enableAIScreening: true,
  enableAutomatedApprovals: true,
  enableRevenueSplitting: true,
  enableBulkUploads: false,
  enableAdvancedAnalytics: false,
};

const defaultPricingConfig: PricingConfig = {
  tiers: {
    free: {
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: ['Basic submissions', 'AI screening', 'Limited analytics'],
      submissionLimit: 5,
    },
    premium_artist: {
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      features: ['Unlimited submissions', 'Priority review', 'Advanced analytics'],
      submissionLimit: -1,
      revenueSplit: 0.85,
    },
    creator: {
      monthlyPrice: 49.99,
      yearlyPrice: 499.99,
      features: ['Brand guidelines', 'Custom licensing terms', 'Dedicated support'],
      revenueSplit: 0.7,
    },
    enterprise: {
      features: ['Custom integration', 'White-label options', 'Dedicated account manager'],
      revenueSplit: 0.6,
    },
  },
  stripePriceIds: {
    premium_artist: {
      monthly: 'price_1234567890',
      yearly: 'price_0987654321',
    },
    creator: {
      monthly: 'price_2345678901',
      yearly: 'price_1098765432',
    },
  },
};

const defaultComplianceRules: ComplianceRules = {
  aiDetectionThreshold: 0.7,
  contentSafetyThreshold: 0.8,
  ipComplianceThreshold: 0.75,
  requireHumanReview: true,
  autoRejectThreshold: 0.9,
  autoApproveThreshold: 0.2,
};

const defaultAISettings: AISettings = {
  models: {
    detection: 'aiornot',
    compliance: 'gpt-4o',
    safety: 'gpt-4o',
  },
  promptTemplates: {
    compliance: 'Analyze this fan art for IP compliance issues...',
    safety: 'Analyze this fan art for content safety concerns...',
    guidelines: 'Evaluate this fan art against the following brand guidelines...',
  },
};

// === Safe Edge Config Fetcher ===

async function fetchFromEdgeConfig<T>(key: string, schema: z.ZodType<T>, fallback: T): Promise<T> {
  if (!process.env.EDGE_CONFIG_KEY) {
    console.warn(`EDGE_CONFIG_KEY not set – using fallback for ${key}`);
    return fallback;
  }

  try {
    const raw = await edgeConfig.get(key);

    if (raw === null || raw === undefined) {
      console.info(`No value in Edge Config for key "${key}" – using fallback`);
      return fallback;
    }

    const parseResult = schema.safeParse(raw);

    if (parseResult.success) {
      return parseResult.data;
    } else {
      console.error(
        `Invalid data shape in Edge Config for key "${key}":`,
        parseResult.error.format()
      );
      return fallback;
    }
  } catch (error) {
    console.error(`Failed to fetch Edge Config key "${key}":`, error);
    return fallback;
  }
}

// === Public Getters ===

export async function getFeatureFlags(): Promise<FeatureFlags> {
  return fetchFromEdgeConfig(CONFIG.FEATURES, FeatureFlagsSchema, defaultFeatureFlags);
}

export async function getPricingConfig(): Promise<PricingConfig> {
  return fetchFromEdgeConfig(CONFIG.PRICING, PricingConfigSchema, defaultPricingConfig);
}

export async function getComplianceRules(): Promise<ComplianceRules> {
  return fetchFromEdgeConfig(
    CONFIG.COMPLIANCE_RULES,
    ComplianceRulesSchema,
    defaultComplianceRules
  );
}

export async function getAISettings(): Promise<AISettings> {
  return fetchFromEdgeConfig(CONFIG.AI_SETTINGS, AISettingsSchema, defaultAISettings);
}
