// Shapes returned by the backend's AI screening routes (/api/screening/*) and the review queue
// (/api/moderation/queue). Field names are the backend's own snake_case: these are database rows
// and jsonb blobs passed through as stored, not a reshaped client model.

/** The automated verdict a screening run records. */
export type ScreeningDecision = 'auto_approved' | 'auto_rejected' | 'flagged_manual';

/** Moderation state of an artwork or contest entry. `flagged` means waiting on a human. */
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

/**
 * One rule hit from the decision engine, in precedence order. `code` identifies the rule; the
 * remaining keys depend on it (scores, thresholds, categories...). See lib/screening-reasons.ts.
 */
export interface ScreeningReason {
  code: string;
  [detail: string]: unknown;
}

type StageStatus = 'ok' | 'unavailable' | 'skipped';

interface StageBase {
  status: StageStatus;
  /** Why an unavailable stage could not run. */
  error?: string;
  /** Why a skipped stage did not need to run. */
  reason?: string;
  provider?: string;
  latencyMs?: number;
}

export interface AuthenticityStage extends StageBase {
  verdict?: 'ai' | 'human' | 'unknown';
  humanConfidence?: number;
  aiConfidence?: number;
  generators?: string[];
}

export interface ContentSafetyStage extends StageBase {
  flagged?: boolean;
  categories?: Record<string, boolean>;
  categoryScores?: Record<string, number>;
  categoryAppliedInputTypes?: Record<string, string[]>;
}

export interface StyleStage extends StageBase {
  styleScore?: number;
  brandFitScore?: number;
  ipRisk?: number;
  violations?: string[];
  notes?: string;
}

/** A `screening_runs` row. */
export interface ScreeningRun {
  id: string;
  artwork_id: string;
  contest_entry_id: string | null;
  ruleset_id: string;
  status: 'running' | 'complete' | 'failed';
  aiornot: AuthenticityStage | null;
  moderation: ContentSafetyStage | null;
  style: StyleStage | null;
  decision: ScreeningDecision | null;
  decision_reasons: ScreeningReason[] | null;
  error: string | null;
  duplicate_of_artwork_id: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface ScreeningHistoryResponse {
  artwork_id: string;
  runs: ScreeningRun[];
}

export interface StartScreeningRunRequest {
  artworkId: string;
  contestEntryId?: string;
}

export interface StartScreeningRunResponse {
  success: boolean;
  message: string;
  run: ScreeningRun;
}

// ─── Rulesets ───────────────────────────────────────────────────────────────────────────────

export type SensitivityLevel = 'lenient' | 'balanced' | 'strict' | 'very-strict';
export type ViolationAction = 'flag' | 'reject';

/**
 * A ruleset's config. Names follow the compliance settings vocabulary the backend schema adopted;
 * every threshold is a 0-1 fraction except `confidenceThreshold`, which is a percentage.
 */
export interface RulesetConfig {
  enabled: boolean;
  aiDetectionThreshold: number;
  confidenceThreshold: number;
  authenticityBorderlineMargin: number;
  authenticityFailAction: ViolationAction;
  autoRejectAI: boolean;
  sensitivityLevel: SensitivityLevel;
  contentSafetyThreshold: number;
  autoRejectThreshold: number;
  autoApproveThreshold: number;
  hardRejectCategories: string[];
  styleEnabled: boolean;
  styleComplianceThreshold: number;
  brandFitThreshold: number;
  ipComplianceThreshold: number;
  styleViolationAction: ViolationAction;
  requireHumanReview: boolean;
  notifyArtist: boolean;
}

/** A `rulesets` row. Rows are immutable: an edit publishes a new version. */
export interface Ruleset {
  id: string;
  brand_id: string | null;
  version: number;
  config: Partial<RulesetConfig>;
  created_by: string | null;
  created_at: string;
}

export interface RulesetsResponse {
  brand_id: string | null;
  /** The ruleset new submissions are judged under: the brand's latest, or the platform default. */
  effective_ruleset: Ruleset;
  /** That ruleset's config with defaults filled in, exactly as the decision engine reads it. */
  effective_config: RulesetConfig;
  /** This brand's own versions, newest first. Empty while it inherits the platform default. */
  versions: Ruleset[];
}

export interface PublishRulesetRequest {
  brand_id: string;
  config: Partial<RulesetConfig>;
}

export interface PublishRulesetResponse {
  success: boolean;
  message: string;
  ruleset: Ruleset;
}

// ─── Style guides ───────────────────────────────────────────────────────────────────────────

/** A `style_guides` row. The newest one that parsed is what the style stage screens against. */
export interface StyleGuide {
  id: string;
  brand_id: string;
  source_file_url: string | null;
  source_text: string | null;
  parsed_rules: Record<string, string[] | string> | null;
  prompt_block: string | null;
  parse_status: 'pending' | 'parsed' | 'failed';
  parse_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface StyleGuidesResponse {
  brand_id: string;
  style_guides: StyleGuide[];
}

export interface UploadStyleGuideResponse {
  success: boolean;
  message: string;
  style_guide: StyleGuide;
}
