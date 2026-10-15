// The screening verdict, as a pure function.
//
// No database, no network, no clock, no randomness: `evaluate` maps stage results plus a ruleset
// config onto a decision and an ordered list of reasons. That constraint is deliberate — it is
// the only part of the pipeline whose behaviour is fully enumerable in tests, and it is where
// every "should this be rejected" question is answered. Anything that needs I/O belongs in
// screening.service.js or the adapters.
//
// Stage result shapes (each carries its own `status`):
//   aiornot    { status: 'ok'|'unavailable'|'skipped', verdict, humanConfidence, generators[] }
//   moderation { status, flagged, categories: {name: bool}, categoryScores: {name: number} }
//   style      { status, styleScore, brandFitScore, ipRisk, violations[] }
const {
  authenticityBands,
  maxAcceptableIpRisk,
} = require("./ruleset.service");

const DECISIONS = {
  AUTO_APPROVED: "auto_approved",
  AUTO_REJECTED: "auto_rejected",
  FLAGGED_MANUAL: "flagged_manual",
};

function reason(code, detail = {}) {
  return { code, ...detail };
}

/** A stage that ran and produced a usable result. */
function isUsable(stage) {
  return Boolean(stage) && stage.status === "ok";
}

/** A stage that could not produce a result — provider down, retries exhausted, bad response. */
function isUnavailable(stage) {
  return Boolean(stage) && stage.status === "unavailable";
}

/**
 * Category scores at or above `threshold`, highest first. Categories the model reports as
 * inapplicable come back as 0, so this naturally ignores the text-only categories on an
 * image-only submission.
 */
function categoriesAtOrAbove(moderation, threshold) {
  const scores = moderation?.categoryScores ?? {};
  return Object.entries(scores)
    .filter(([, score]) => typeof score === "number" && score >= threshold)
    .sort((a, b) => b[1] - a[1])
    .map(([category, score]) => ({ category, score }));
}

function maxCategoryScore(moderation) {
  const scores = Object.values(moderation?.categoryScores ?? {}).filter(
    (s) => typeof s === "number"
  );
  return scores.length ? Math.max(...scores) : 0;
}

/**
 * Decides the outcome of a screening run.
 *
 * Precedence, highest first:
 *   1. hard-reject moderation category      -> auto_rejected
 *   2. moderation score >= autoRejectThreshold -> auto_rejected
 *   3. AI verdict with autoRejectAI on      -> auto_rejected
 *   4. authenticity borderline band         -> flagged_manual
 *   5. authenticity below the band          -> reject or flag, per authenticityFailAction
 *   6. moderation flag categories           -> flagged_manual
 *   7. style / IP violation                 -> reject or flag, per styleViolationAction
 *   8. all requirements met                 -> auto_approved
 *   9. anything else                        -> flagged_manual
 *
 * Rejections are evaluated before deferrals so that an unambiguously prohibited image is not
 * parked in a review queue. The fallback is always manual review, never approval.
 *
 * @param {{aiornot?: object, moderation?: object, style?: object}} stages
 * @param {object} config normalised ruleset config
 * @returns {{decision: string, reasons: Array<{code: string}>}}
 */
function evaluate(stages = {}, config) {
  if (!config) throw new Error("evaluate requires a normalised ruleset config");

  const { aiornot, moderation, style } = stages;
  const reasons = [];

  // Screening switched off entirely. Recording a run but making no calls must not be mistaken
  // for a clean bill of health, so it defers to a human.
  if (config.enabled === false) {
    return {
      decision: DECISIONS.FLAGGED_MANUAL,
      reasons: [reason("screening_disabled")],
    };
  }

  // --- 1. Hard-reject categories ------------------------------------------------------------
  if (isUsable(moderation)) {
    const flaggedCategories = moderation.categories ?? {};
    const hardHits = (config.hardRejectCategories ?? []).filter(
      (category) => flaggedCategories[category] === true
    );

    if (hardHits.length) {
      return {
        decision: DECISIONS.AUTO_REJECTED,
        reasons: [reason("moderation_hard_reject", { categories: hardHits })],
      };
    }
  }

  // --- 2. Any category confident enough to reject on its own --------------------------------
  if (isUsable(moderation)) {
    const rejectHits = categoriesAtOrAbove(moderation, config.autoRejectThreshold);
    if (rejectHits.length) {
      return {
        decision: DECISIONS.AUTO_REJECTED,
        reasons: [
          reason("moderation_auto_reject", {
            categories: rejectHits,
            threshold: config.autoRejectThreshold,
          }),
        ],
      };
    }
  }

  // --- 3. Blanket ban on AI-generated work --------------------------------------------------
  if (isUsable(aiornot) && config.autoRejectAI && aiornot.verdict === "ai") {
    return {
      decision: DECISIONS.AUTO_REJECTED,
      reasons: [
        reason("ai_generated_rejected", {
          verdict: aiornot.verdict,
          generators: aiornot.generators ?? [],
        }),
      ],
    };
  }

  // --- Degradation: a stage that could not run means a human decides ------------------------
  // Checked after the outright rejections (a missing style verdict should not rescue an image
  // the moderation stage already condemned) but before anything that could approve.
  const unavailableStages = ["aiornot", "moderation", "style"].filter((name) =>
    isUnavailable(stages[name])
  );

  if (unavailableStages.length) {
    reasons.push(reason("stage_unavailable", { stages: unavailableStages }));
  }

  // --- 4/5. Authenticity --------------------------------------------------------------------
  if (isUsable(aiornot)) {
    const bands = authenticityBands(config);
    const human = typeof aiornot.humanConfidence === "number" ? aiornot.humanConfidence : null;

    // `verdict` is the provider's own calibrated call and is more stable than a raw confidence
    // cutoff, so an explicit 'unknown' goes to a human regardless of the number attached.
    if (aiornot.verdict === "unknown") {
      reasons.push(reason("authenticity_unknown"));
    } else if (human === null) {
      reasons.push(reason("authenticity_missing_confidence"));
    } else if (human >= bands.high) {
      reasons.push(reason("authenticity_pass", { humanConfidence: human }));
    } else if (human >= bands.low) {
      return {
        decision: DECISIONS.FLAGGED_MANUAL,
        reasons: [
          ...reasons,
          reason("authenticity_borderline", { humanConfidence: human, band: bands }),
        ],
      };
    } else {
      const failReason = reason("authenticity_fail", {
        humanConfidence: human,
        band: bands,
        verdict: aiornot.verdict,
        generators: aiornot.generators ?? [],
      });

      if (config.authenticityFailAction === "reject") {
        return {
          decision: DECISIONS.AUTO_REJECTED,
          reasons: [...reasons, failReason],
        };
      }

      return {
        decision: DECISIONS.FLAGGED_MANUAL,
        reasons: [...reasons, failReason],
      };
    }
  }

  // --- 6. Categories worth a second opinion -------------------------------------------------
  if (isUsable(moderation)) {
    const flagHits = categoriesAtOrAbove(moderation, config.contentSafetyThreshold);
    if (flagHits.length) {
      return {
        decision: DECISIONS.FLAGGED_MANUAL,
        reasons: [
          ...reasons,
          reason("moderation_flagged", {
            categories: flagHits,
            threshold: config.contentSafetyThreshold,
          }),
        ],
      };
    }
  }

  // --- 7. Style and IP ----------------------------------------------------------------------
  if (isUsable(style)) {
    const styleViolations = [];

    if (typeof style.styleScore === "number" && style.styleScore < config.styleComplianceThreshold) {
      styleViolations.push(
        reason("style_below_threshold", {
          styleScore: style.styleScore,
          threshold: config.styleComplianceThreshold,
        })
      );
    }

    if (
      typeof style.brandFitScore === "number" &&
      style.brandFitScore < config.brandFitThreshold
    ) {
      styleViolations.push(
        reason("brand_fit_below_threshold", {
          brandFitScore: style.brandFitScore,
          threshold: config.brandFitThreshold,
        })
      );
    }

    if (typeof style.ipRisk === "number" && style.ipRisk > maxAcceptableIpRisk(config)) {
      styleViolations.push(
        reason("ip_risk_too_high", {
          ipRisk: style.ipRisk,
          maxAcceptable: maxAcceptableIpRisk(config),
        })
      );
    }

    if (Array.isArray(style.violations) && style.violations.length) {
      styleViolations.push(reason("style_guide_violation", { violations: style.violations }));
    }

    if (styleViolations.length) {
      if (config.styleViolationAction === "reject") {
        return {
          decision: DECISIONS.AUTO_REJECTED,
          reasons: [...reasons, ...styleViolations],
        };
      }

      return {
        decision: DECISIONS.FLAGGED_MANUAL,
        reasons: [...reasons, ...styleViolations],
      };
    }
  }

  // --- 8. Auto-approval ---------------------------------------------------------------------
  // Every condition is a positive requirement. Anything missing, unavailable or merely
  // unasserted falls through to manual review below.
  const requirements = [];

  requirements.push({
    code: "requires_human_review_disabled",
    met: config.requireHumanReview === false,
  });

  requirements.push({
    code: "authenticity_verified",
    met:
      isUsable(aiornot) &&
      aiornot.verdict !== "unknown" &&
      typeof aiornot.humanConfidence === "number" &&
      aiornot.humanConfidence >= authenticityBands(config).high,
  });

  requirements.push({
    code: "content_safe",
    met: isUsable(moderation) && maxCategoryScore(moderation) <= config.autoApproveThreshold,
  });

  // The style stage is legitimately absent when the ruleset disables it or the artwork has no
  // brand context. 'skipped' satisfies the requirement; 'unavailable' does not.
  requirements.push({
    code: "style_compliant",
    met: isUsable(style) || style?.status === "skipped",
  });

  requirements.push({
    code: "no_stage_unavailable",
    met: unavailableStages.length === 0,
  });

  const unmet = requirements.filter((r) => !r.met).map((r) => r.code);

  if (!unmet.length) {
    return {
      decision: DECISIONS.AUTO_APPROVED,
      reasons: [...reasons, reason("auto_approved", { requirementsMet: requirements.map((r) => r.code) })],
    };
  }

  // --- 9. Fallback --------------------------------------------------------------------------
  return {
    decision: DECISIONS.FLAGGED_MANUAL,
    reasons: [...reasons, reason("auto_approve_requirements_unmet", { unmet })],
  };
}

module.exports = { DECISIONS, evaluate };
