// Ruleset config: schema, normalisation and resolution.
//
// Field names are deliberately inherited from the existing compliance UI so a ruleset row can be
// handed to those pages unchanged: `aiDetectionThreshold`, `contentSafetyThreshold`,
// `ipComplianceThreshold`, `autoRejectThreshold`, `autoApproveThreshold` and `requireHumanReview`
// come from `ComplianceRulesSchema` in frontend/lib/db/config-service.ts; `enabled`,
// `confidenceThreshold`, `autoRejectAI`, `notifyArtist` and `sensitivityLevel` come from
// frontend/app/compliance/ai-screening/page.tsx.
//
// Rulesets are immutable. Editing config inserts a new version, so any historical run can be
// re-explained with the exact config it ran under.
const { z } = require("zod");

const Ruleset = require("../models/ruleset.model");

// Every moderation category `omni-moderation-latest` can return. Images are only ever scored for
// the six marked below; the rest are text-only and come back as 0 for an image-only input, so
// rules must not assume an image can trip them.
const MODERATION_CATEGORIES = [
  "harassment",
  "harassment/threatening",
  "hate",
  "hate/threatening",
  "illicit",
  "illicit/violent",
  "self-harm", // image-capable
  "self-harm/intent", // image-capable
  "self-harm/instructions", // image-capable
  "sexual", // image-capable
  "sexual/minors",
  "violence", // image-capable
  "violence/graphic", // image-capable
];

const fraction = z.number().min(0).max(1);

const rulesetConfigSchema = z.object({
  // Master switch. When false the pipeline records a run but makes no external calls and defers
  // to a human, rather than silently approving.
  enabled: z.boolean().default(true),

  // --- Authenticity (AIORNOT) -------------------------------------------------------------
  // Minimum human-authenticity confidence for a clean pass, as a fraction.
  aiDetectionThreshold: fraction.default(0.7),
  // The same number as a percentage, because that is what the settings slider emits. The two are
  // reconciled in `normalizeRulesetConfig` so they can never drift apart in a stored row.
  confidenceThreshold: z.number().min(0).max(100).default(70),
  // Half-width of the "borderline" band around the threshold. With the defaults this yields the
  // 65%-75% grey zone from the product spec, which always goes to a human.
  authenticityBorderlineMargin: fraction.default(0.05),
  // What to do when authenticity lands clearly below the band.
  authenticityFailAction: z.enum(["flag", "reject"]).default("flag"),
  // Hard override: any AI verdict is rejected outright, no band, no discussion.
  autoRejectAI: z.boolean().default(false),
  sensitivityLevel: z
    .enum(["lenient", "balanced", "strict", "very-strict"])
    .default("balanced"),

  // --- Content safety (OpenAI moderation) --------------------------------------------------
  // Category score at or above which a category counts as a flag.
  contentSafetyThreshold: fraction.default(0.8),
  // Category score at or above which we reject without human involvement.
  autoRejectThreshold: fraction.default(0.9),
  // Every moderation score must be at or below this for an automatic approval.
  autoApproveThreshold: fraction.default(0.2),
  // Categories that are never tolerated at any score once the model flags them.
  hardRejectCategories: z
    .array(z.enum(MODERATION_CATEGORIES))
    .default(["sexual/minors"]),

  // --- Style and IP (vision classifier) ----------------------------------------------------
  styleEnabled: z.boolean().default(true),
  // Minimum style-guide adherence, 0..1.
  styleComplianceThreshold: fraction.default(0.7),
  // Minimum brand fit, 0..1.
  brandFitThreshold: fraction.default(0.5),
  // Read as "how compliant we insist on being": the maximum tolerated IP risk is its complement,
  // so 0.75 here means an `ip_risk` above 0.25 is a violation.
  ipComplianceThreshold: fraction.default(0.75),
  styleViolationAction: z.enum(["flag", "reject"]).default("flag"),

  // --- Human review ------------------------------------------------------------------------
  // When true, nothing is ever auto-approved: clean submissions still land in the review queue.
  requireHumanReview: z.boolean().default(true),
  notifyArtist: z.boolean().default(true),
});

/**
 * Keeps `aiDetectionThreshold` (fraction, what the engine reads) and `confidenceThreshold`
 * (percent, what the settings slider emits) in agreement.
 *
 * The slider wins when supplied, because that is the field a human just moved. Without this a
 * round-trip through the UI would leave a row whose two authenticity knobs disagree, and the
 * engine would silently use the one nobody edited.
 */
function reconcileAuthenticityThreshold(input) {
  const raw = { ...input };
  const hasPercent = typeof raw.confidenceThreshold === "number";
  const hasFraction = typeof raw.aiDetectionThreshold === "number";

  if (hasPercent) {
    raw.aiDetectionThreshold = raw.confidenceThreshold / 100;
  } else if (hasFraction) {
    raw.confidenceThreshold = Math.round(raw.aiDetectionThreshold * 100);
  }

  return raw;
}

/**
 * Validates and fills in a ruleset config. Throws a zod error on invalid input.
 * @param {object} input
 * @returns {object} the complete, normalised config
 */
function normalizeRulesetConfig(input = {}) {
  return rulesetConfigSchema.parse(reconcileAuthenticityThreshold(input));
}

function safeNormalizeRulesetConfig(input = {}) {
  return rulesetConfigSchema.safeParse(reconcileAuthenticityThreshold(input));
}

/**
 * The authenticity decision bands, derived from the normalised config.
 *
 * `pass` at or above `high`; `borderline` in [low, high); `fail` below `low`.
 */
function authenticityBands(config) {
  const margin = config.authenticityBorderlineMargin;
  return {
    low: Math.max(0, config.aiDetectionThreshold - margin),
    high: Math.min(1, config.aiDetectionThreshold + margin),
  };
}

/** Maximum IP risk tolerated, as the complement of the compliance requirement. */
function maxAcceptableIpRisk(config) {
  return 1 - config.ipComplianceThreshold;
}

/**
 * Resolves the ruleset a run should use: the brand's newest version when the artwork has brand
 * context, otherwise the platform default. Every run stores the id it resolved to.
 *
 * @param {import('kysely').Kysely<any>} db
 * @param {{ brandId?: string | null }} context
 */
async function resolveRuleset(db, { brandId = null } = {}) {
  if (brandId) {
    const brandRuleset = await Ruleset.findLatestForBrand(db, brandId);
    if (brandRuleset) return brandRuleset;
  }

  const platform = await Ruleset.findLatestPlatformDefault(db);

  if (!platform) {
    // Screening cannot proceed without a config, and guessing one would mean inventing
    // thresholds nobody approved. The seed in the screening migration should make this
    // unreachable.
    throw new Error(
      "No platform default ruleset found. Run the AI screening migration to seed one."
    );
  }

  return platform;
}

/**
 * Publishes a new immutable version of a ruleset.
 * @param {import('kysely').Kysely<any>} db
 * @param {{ brandId: string | null, config: object, createdBy?: string | null }} params
 */
async function publishRulesetVersion(db, { brandId, config, createdBy = null }) {
  const current = brandId
    ? await Ruleset.findLatestForBrand(db, brandId)
    : await Ruleset.findLatestPlatformDefault(db);

  // A partial update should mean "change these knobs", not "reset everything else to default",
  // so the new version starts from whatever is currently in force.
  const merged = normalizeRulesetConfig({
    ...(current ? current.config : {}),
    ...config,
  });

  return Ruleset.insertVersion(db, {
    brandId,
    version: (current?.version ?? 0) + 1,
    config: merged,
    createdBy,
  });
}

module.exports = {
  MODERATION_CATEGORIES,
  rulesetConfigSchema,
  normalizeRulesetConfig,
  safeNormalizeRulesetConfig,
  authenticityBands,
  maxAcceptableIpRisk,
  resolveRuleset,
  publishRulesetVersion,
};
