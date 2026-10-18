// Plain-English rendering of AI screening output for reviewers.
//
// The decision engine records each rule it hit as `{ code, ...details }` (see
// backend/src/modules/screening/services/decision.engine.js). Reviewers need to know *why* a
// submission is in front of them, so every code the engine can emit is described here, with an
// unrecognised one falling back to its raw code rather than disappearing.
import type {
  ModerationStatus,
  ScreeningDecision,
  ScreeningReason,
} from '@/services/types/screening';

export type ReasonTone = 'pass' | 'warn' | 'fail' | 'info';

export interface DescribedReason {
  title: string;
  detail?: string;
  tone: ReasonTone;
}

export const DECISION_LABELS: Record<ScreeningDecision, string> = {
  auto_approved: 'Auto-approved',
  auto_rejected: 'Auto-rejected',
  flagged_manual: 'Needs human review',
};

export const MODERATION_STATUS_LABELS: Record<ModerationStatus, string> = {
  pending: 'Screening',
  flagged: 'In review',
  approved: 'Approved',
  rejected: 'Rejected',
};

/** The requirement codes `auto_approve_requirements_unmet` lists, as reviewers would say them. */
const REQUIREMENT_LABELS: Record<string, string> = {
  requires_human_review_disabled: 'the ruleset requires human review of every submission',
  authenticity_verified: 'authenticity was not confirmed',
  content_safe: 'content safety scores were not low enough to auto-approve',
  style_compliant: 'the style check did not complete',
  no_stage_unavailable: 'a check could not run',
};

const STAGE_LABELS: Record<string, string> = {
  aiornot: 'Authenticity',
  moderation: 'Content safety',
  style: 'Style & IP',
};

export function formatPercent(value: unknown): string {
  return typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value * 100)}%` : '—';
}

function list(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

/** `[{ category, score }]` → "violence 85%, sexual 40%". */
function categoryScores(value: unknown): string {
  if (!Array.isArray(value)) return '';

  return value
    .map((entry) =>
      entry && typeof entry === 'object'
        ? `${(entry as { category?: string }).category} ${formatPercent((entry as { score?: number }).score)}`
        : String(entry)
    )
    .join(', ');
}

export function describeReason(reason: ScreeningReason): DescribedReason {
  const r = reason as Record<string, unknown>;

  switch (reason.code) {
    case 'authenticity_pass':
      return {
        title: 'Passed the authenticity check',
        detail: `Human-made confidence ${formatPercent(r['humanConfidence'])}`,
        tone: 'pass',
      };
    case 'authenticity_borderline': {
      const band = (r['band'] ?? {}) as { low?: number; high?: number };
      return {
        title: 'Authenticity is borderline',
        detail: `Human-made confidence ${formatPercent(r['humanConfidence'])}, inside the ${formatPercent(band.low)}–${formatPercent(band.high)} grey zone`,
        tone: 'warn',
      };
    }
    case 'authenticity_fail': {
      const generators = list(r['generators']);
      return {
        title: 'Likely AI-generated',
        detail:
          `Human-made confidence ${formatPercent(r['humanConfidence'])}` +
          (generators.length ? ` · looks like ${generators.join(', ')}` : ''),
        tone: 'fail',
      };
    }
    case 'authenticity_unknown':
      return { title: 'Authenticity check was inconclusive', tone: 'warn' };
    case 'authenticity_missing_confidence':
      return { title: 'Authenticity check returned no confidence score', tone: 'warn' };
    case 'ai_generated_rejected': {
      const generators = list(r['generators']);
      return {
        title: 'AI-generated work is not accepted',
        ...(generators.length ? { detail: `Looks like ${generators.join(', ')}` } : {}),
        tone: 'fail',
      };
    }
    case 'moderation_hard_reject':
      return {
        title: 'Prohibited content',
        detail: list(r['categories']).join(', '),
        tone: 'fail',
      };
    case 'moderation_auto_reject':
      return {
        title: 'Content safety score over the rejection threshold',
        detail: `${categoryScores(r['categories'])} (threshold ${formatPercent(r['threshold'])})`,
        tone: 'fail',
      };
    case 'moderation_flagged':
      return {
        title: 'Content safety score over the review threshold',
        detail: `${categoryScores(r['categories'])} (threshold ${formatPercent(r['threshold'])})`,
        tone: 'warn',
      };
    case 'style_below_threshold':
      return {
        title: 'Does not follow the style guide closely enough',
        detail: `Style score ${formatPercent(r['styleScore'])}, needs ${formatPercent(r['threshold'])}`,
        tone: 'warn',
      };
    case 'brand_fit_below_threshold':
      return {
        title: 'Weak fit with the brand',
        detail: `Brand fit ${formatPercent(r['brandFitScore'])}, needs ${formatPercent(r['threshold'])}`,
        tone: 'warn',
      };
    case 'ip_risk_too_high':
      return {
        title: 'May use someone else’s intellectual property',
        detail: `IP risk ${formatPercent(r['ipRisk'])}, maximum ${formatPercent(r['maxAcceptable'])}`,
        tone: 'fail',
      };
    case 'style_guide_violation':
      return {
        title: 'Breaks the style guide',
        detail: list(r['violations']).join('; '),
        tone: 'warn',
      };
    case 'stage_unavailable':
      return {
        title: 'A check could not run',
        detail: list(r['stages'])
          .map((stage) => STAGE_LABELS[stage] ?? stage)
          .join(', '),
        tone: 'warn',
      };
    case 'auto_approve_requirements_unmet':
      return {
        title: 'Not eligible for automatic approval',
        detail: list(r['unmet'])
          .map((code) => REQUIREMENT_LABELS[code] ?? code)
          .join('; '),
        tone: 'info',
      };
    case 'auto_approved':
      return { title: 'Met every requirement for automatic approval', tone: 'pass' };
    case 'screening_disabled':
      return { title: 'Screening is switched off for this ruleset', tone: 'info' };
    case 'duplicate_of_rejected':
      return {
        title: 'Identical to an image that was rejected before',
        tone: 'fail',
      };
    default:
      return { title: reason.code, tone: 'info' };
  }
}

/** The reasons worth showing, in order. Accepts whatever a queue item's `rule_matches` holds. */
export function screeningReasons(value: unknown): ScreeningReason[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is ScreeningReason =>
          Boolean(item) && typeof (item as { code?: unknown }).code === 'string'
      )
    : [];
}
