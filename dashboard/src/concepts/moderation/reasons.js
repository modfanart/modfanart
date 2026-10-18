// Plain-English rendering of the screening decision engine's reason codes.
//
// Each reason is `{ code, ...detail }` as written by the backend decision engine
// (backend/src/modules/screening/services/decision.engine.js). Unknown codes fall back to the
// raw code so a new backend reason is still visible rather than silently dropped.

import { formatPercent } from './format';

const STAGE_NAMES = {
  aiornot: 'authenticity',
  moderation: 'content safety',
  style: 'style',
};

// Requirement codes listed in `auto_approve_requirements_unmet.unmet`.
const UNMET_REQUIREMENTS = {
  requires_human_review_disabled: 'the ruleset requires human review',
  authenticity_verified: 'authenticity was not verified',
  content_safe: 'a content safety score is above the auto-approve threshold',
  style_compliant: 'the style check did not pass',
  no_stage_unavailable: 'a check could not run',
};

// Why a stage recorded `{ status: 'skipped', reason }`.
const SKIP_REASONS = {
  style_disabled: 'style checks are off in the ruleset',
  no_brand_context: 'no brand context',
  no_style_guide: 'the brand has no style guide',
  duplicate_of_rejected: 'duplicate of a rejected image',
};

const list = items => (items?.length ? items.join(', ') : 'none listed');

const withGenerators = generators =>
  generators?.length ? ` (generators: ${list(generators)})` : '';

// Moderation hits arrive as `{ category, score }`; hard-reject hits as bare category names.
const categoryList = categories =>
  list(
    (categories ?? []).map(c =>
      typeof c === 'string' ? c : `${c.category} ${formatPercent(c.score)}`
    )
  );

const DESCRIBERS = {
  authenticity_pass: r =>
    `Passed authenticity — ${formatPercent(r.humanConfidence)} human`,
  authenticity_borderline: r =>
    `Authenticity borderline — ${formatPercent(r.humanConfidence)} human (review band ${formatPercent(r.band?.low)}–${formatPercent(r.band?.high)})`,
  authenticity_fail: r =>
    `Likely AI-generated — ${formatPercent(r.humanConfidence)} human${withGenerators(r.generators)}`,
  authenticity_unknown: () => 'Authenticity check inconclusive',
  authenticity_missing_confidence: () =>
    'Authenticity check returned no confidence score',
  ai_generated_rejected: r =>
    `AI-generated work is not allowed${withGenerators(r.generators)}`,
  moderation_hard_reject: r => `Prohibited content: ${list(r.categories)}`,
  moderation_auto_reject: r =>
    `Content safety score over the reject threshold (${formatPercent(r.threshold)}): ${categoryList(r.categories)}`,
  moderation_flagged: r =>
    `Content safety score over the flag threshold (${formatPercent(r.threshold)}): ${categoryList(r.categories)}`,
  style_below_threshold: r =>
    `Style score ${formatPercent(r.styleScore)} is below the threshold of ${formatPercent(r.threshold)}`,
  brand_fit_below_threshold: r =>
    `Brand fit ${formatPercent(r.brandFitScore)} is below the threshold of ${formatPercent(r.threshold)}`,
  ip_risk_too_high: r =>
    `IP risk ${formatPercent(r.ipRisk)} is above the maximum of ${formatPercent(r.maxAcceptable)}`,
  style_guide_violation: r => `Style guide violations: ${list(r.violations)}`,
  stage_unavailable: r =>
    `A check could not run: ${list(r.stages?.map(s => STAGE_NAMES[s] ?? s))}`,
  auto_approve_requirements_unmet: r =>
    `Needs a human: ${list(r.unmet?.map(code => UNMET_REQUIREMENTS[code] ?? code))}`,
  auto_approved: () => 'All auto-approve requirements met',
  screening_disabled: () => 'Screening is switched off in the ruleset',
  duplicate_of_rejected: r =>
    `Identical to a previously rejected image${r.duplicate_of_artwork_id ? ` (artwork ${r.duplicate_of_artwork_id})` : ''}`,
};

export const describeReason = reason => {
  if (!reason) return '';

  const describe = DESCRIBERS[reason.code];

  return describe ? describe(reason) : reason.code || JSON.stringify(reason);
};

// Whether a reason counts for or against the artwork, for the dot beside it.
const PASSING = ['authenticity_pass', 'auto_approved'];
const FAILING = [
  'authenticity_fail',
  'ai_generated_rejected',
  'moderation_hard_reject',
  'moderation_auto_reject',
  'ip_risk_too_high',
  'duplicate_of_rejected',
];

export const reasonTone = code => {
  if (PASSING.includes(code)) return 'pass';
  if (FAILING.includes(code)) return 'fail';
  return 'warn';
};

export const describeSkipReason = reason =>
  SKIP_REASONS[reason] ?? reason ?? 'no reason given';

/** Screening flags store an array of reasons; user reports store a single object. */
export const isUserReport = item =>
  !Array.isArray(item?.rule_matches) &&
  item?.rule_matches?.source === 'user_report';
