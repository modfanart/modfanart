import { edgeConfig, CONFIG } from './config';

export interface FeatureFlags {
  enableMarketplace: boolean;
  enableAIScreening: boolean;
  enableAutomatedApprovals: boolean;
  enableRevenueSplitting: boolean;
  enableBulkUploads: boolean;
  enableAdvancedAnalytics: boolean;
}

export interface PricingConfig {
  tiers: {
    free: {
      monthlyPrice: number;
      yearlyPrice: number;
      features: string[];
      submissionLimit: number;
    };
    premium_artist: {
      monthlyPrice: number;
      yearlyPrice: number;
      features: string[];
      submissionLimit: number;
      revenueSplit: number;
    };
    creator: {
      monthlyPrice: number;
      yearlyPrice: number;
      features: string[];
      revenueSplit: number;
    };
    enterprise: {
      features: string[];
      revenueSplit: number;
    };
  };
  stripePriceIds: {
    [key: string]: {
      monthly: string;
      yearly: string;
    };
  };
}

export interface ComplianceRules {
  aiDetectionThreshold: number;
  contentSafetyThreshold: number;
  ipComplianceThreshold: number;
  requireHumanReview: boolean;
  autoRejectThreshold: number;
  autoApproveThreshold: number;
}

export interface AISettings {
  models: {
    detection: string;
    compliance: string;
    safety: string;
  };
  promptTemplates: {
    compliance: string;
    safety: string;
    guidelines: string;
  };
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  try {
    return (await edgeConfig.get(CONFIG.FEATURES)) as FeatureFlags;
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return {
      enableMarketplace: true,
      enableAIScreening: true,
      enableAutomatedApprovals: true,
      enableRevenueSplitting: true,
      enableBulkUploads: false,
      enableAdvancedAnalytics: false,
    };
  }
}

export async function getPricingConfig(): Promise<PricingConfig> {
  try {
    return (await edgeConfig.get(CONFIG.PRICING)) as PricingConfig;
  } catch (error) {
    console.error('Error fetching pricing config:', error);
    return {
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
          submissionLimit: -1, // -1 means unlimited
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
  }
}

export async function getComplianceRules(): Promise<ComplianceRules> {
  try {
    return (await edgeConfig.get(CONFIG.COMPLIANCE_RULES)) as ComplianceRules;
  } catch (error) {
    console.error('Error fetching compliance rules:', error);
    return {
      aiDetectionThreshold: 0.7,
      contentSafetyThreshold: 0.8,
      ipComplianceThreshold: 0.75,
      requireHumanReview: true,
      autoRejectThreshold: 0.9,
      autoApproveThreshold: 0.2,
    };
  }
}

export async function getAISettings(): Promise<AISettings> {
  try {
    return (await edgeConfig.get(CONFIG.AI_SETTINGS)) as AISettings;
  } catch (error) {
    console.error('Error fetching AI settings:', error);
    return {
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
  }
}
