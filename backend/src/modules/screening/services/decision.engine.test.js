import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { DECISIONS, evaluate } = require("./decision.engine.js");
const { MODERATION_CATEGORIES, normalizeRulesetConfig } = require("./ruleset.service.js");

// --- Fixtures ------------------------------------------------------------------------------
// Every stage builder defaults to a clean, passing result, so each test states only the one
// thing it is about.

const zeroScores = Object.fromEntries(MODERATION_CATEGORIES.map((c) => [c, 0]));

function cleanAiornot(overrides = {}) {
  return {
    status: "ok",
    verdict: "human",
    humanConfidence: 0.97,
    generators: [],
    ...overrides,
  };
}

function cleanModeration(overrides = {}) {
  return {
    status: "ok",
    flagged: false,
    categories: Object.fromEntries(MODERATION_CATEGORIES.map((c) => [c, false])),
    categoryScores: { ...zeroScores },
    ...overrides,
  };
}

function cleanStyle(overrides = {}) {
  return {
    status: "ok",
    styleScore: 0.95,
    brandFitScore: 0.9,
    ipRisk: 0.01,
    violations: [],
    ...overrides,
  };
}

function cleanStages(overrides = {}) {
  return {
    aiornot: cleanAiornot(),
    moderation: cleanModeration(),
    style: cleanStyle(),
    ...overrides,
  };
}

/** Config that permits automatic approval. The platform default deliberately does not. */
function autoApproveConfig(overrides = {}) {
  return normalizeRulesetConfig({ requireHumanReview: false, ...overrides });
}

function withScore(category, score) {
  return cleanModeration({ categoryScores: { ...zeroScores, [category]: score } });
}

function codes(result) {
  return result.reasons.map((r) => r.code);
}

// --- Baseline ------------------------------------------------------------------------------

describe("evaluate: baseline", () => {
  it("throws without a config rather than guessing thresholds", () => {
    expect(() => evaluate(cleanStages())).toThrow(/requires a normalised ruleset config/);
  });

  it("auto-approves a clean submission when human review is not required", () => {
    const result = evaluate(cleanStages(), autoApproveConfig());
    expect(result.decision).toBe(DECISIONS.AUTO_APPROVED);
    expect(codes(result)).toContain("auto_approved");
  });

  it("defers a clean submission under the platform default, which requires human review", () => {
    const result = evaluate(cleanStages(), normalizeRulesetConfig({}));
    expect(result.decision).toBe(DECISIONS.FLAGGED_MANUAL);
    expect(codes(result)).toContain("auto_approve_requirements_unmet");
    expect(result.reasons.at(-1).unmet).toContain("requires_human_review_disabled");
  });

  it("defers, never approves, when screening is switched off", () => {
    const result = evaluate(cleanStages(), autoApproveConfig({ enabled: false }));
    expect(result.decision).toBe(DECISIONS.FLAGGED_MANUAL);
    expect(codes(result)).toEqual(["screening_disabled"]);
  });

  it("defers on completely empty stage results", () => {
    expect(evaluate({}, autoApproveConfig()).decision).toBe(DECISIONS.FLAGGED_MANUAL);
  });

  it("is pure: the same input yields an identical result", () => {
    const stages = cleanStages();
    const config = autoApproveConfig();
    expect(evaluate(stages, config)).toEqual(evaluate(stages, config));
  });

  it("does not mutate its inputs", () => {
    const stages = cleanStages();
    const config = autoApproveConfig();
    const stagesBefore = JSON.stringify(stages);
    const configBefore = JSON.stringify(config);

    evaluate(stages, config);

    expect(JSON.stringify(stages)).toBe(stagesBefore);
    expect(JSON.stringify(config)).toBe(configBefore);
  });
});

// --- Branch 1: hard-reject categories ------------------------------------------------------

describe("evaluate: hard-reject categories", () => {
  it("rejects a hard-reject category the instant the model flags it, whatever the score", () => {
    const moderation = cleanModeration({
      categories: { ...cleanModeration().categories, "sexual/minors": true },
      categoryScores: { ...zeroScores, "sexual/minors": 0.01 },
    });

    const result = evaluate(cleanStages({ moderation }), autoApproveConfig());
    expect(result.decision).toBe(DECISIONS.AUTO_REJECTED);
    expect(codes(result)).toEqual(["moderation_hard_reject"]);
    expect(result.reasons[0].categories).toEqual(["sexual/minors"]);
  });

  it("ignores a flagged category that is not on the hard-reject list", () => {
    const moderation = cleanModeration({
      categories: { ...cleanModeration().categories, violence: true },
    });

    const result = evaluate(cleanStages({ moderation }), autoApproveConfig());
    expect(result.decision).not.toBe(DECISIONS.AUTO_REJECTED);
  });

  it("honours a brand's extended hard-reject list", () => {
    const moderation = cleanModeration({
      categories: { ...cleanModeration().categories, "violence/graphic": true },
    });

    const result = evaluate(
      cleanStages({ moderation }),
      autoApproveConfig({ hardRejectCategories: ["sexual/minors", "violence/graphic"] })
    );
    expect(result.decision).toBe(DECISIONS.AUTO_REJECTED);
  });

  it("outranks everything else, including an unavailable stage", () => {
    const moderation = cleanModeration({
      categories: { ...cleanModeration().categories, "sexual/minors": true },
    });

    const result = evaluate(
      { aiornot: { status: "unavailable" }, moderation, style: cleanStyle() },
      autoApproveConfig()
    );
    expect(result.decision).toBe(DECISIONS.AUTO_REJECTED);
  });
});

// --- Branch 2: auto-reject threshold -------------------------------------------------------

describe("evaluate: moderation auto-reject threshold", () => {
  it.each(MODERATION_CATEGORIES)("rejects on %s at or above the threshold", (category) => {
    const result = evaluate(
      cleanStages({ moderation: withScore(category, 0.9) }),
      autoApproveConfig()
    );
    expect(result.decision).toBe(DECISIONS.AUTO_REJECTED);
    expect(codes(result)).toEqual(["moderation_auto_reject"]);
  });

  it("treats the threshold as inclusive", () => {
    const at = evaluate(cleanStages({ moderation: withScore("violence", 0.9) }), autoApproveConfig());
    expect(at.decision).toBe(DECISIONS.AUTO_REJECTED);
  });

  it("flags rather than rejects just below the threshold", () => {
    const result = evaluate(
      cleanStages({ moderation: withScore("violence", 0.89) }),
      autoApproveConfig()
    );
    expect(result.decision).toBe(DECISIONS.FLAGGED_MANUAL);
    expect(codes(result)).toContain("moderation_flagged");
  });

  it("reports the offending categories worst-first", () => {
    const moderation = cleanModeration({
      categoryScores: { ...zeroScores, violence: 0.91, hate: 0.99 },
    });
    const result = evaluate(cleanStages({ moderation }), autoApproveConfig());
    expect(result.reasons[0].categories.map((c) => c.category)).toEqual(["hate", "violence"]);
  });
});

// --- Branch 3: autoRejectAI ----------------------------------------------------------------

describe("evaluate: autoRejectAI", () => {
  it("rejects an AI verdict outright when the brand bans AI work", () => {
    const stages = cleanStages({
      aiornot: cleanAiornot({
        verdict: "ai",
        humanConfidence: 0.02,
        generators: ["midjourney"],
      }),
    });

    const result = evaluate(stages, autoApproveConfig({ autoRejectAI: true }));
    expect(result.decision).toBe(DECISIONS.AUTO_REJECTED);
    expect(codes(result)).toEqual(["ai_generated_rejected"]);
    expect(result.reasons[0].generators).toEqual(["midjourney"]);
  });

  it("does not reject a human verdict even with the ban on", () => {
    const result = evaluate(cleanStages(), autoApproveConfig({ autoRejectAI: true }));
    expect(result.decision).toBe(DECISIONS.AUTO_APPROVED);
  });

  it("does not reject an unknown verdict outright; that is a judgement call for a human", () => {
    const stages = cleanStages({ aiornot: cleanAiornot({ verdict: "unknown" }) });
    const result = evaluate(stages, autoApproveConfig({ autoRejectAI: true }));
    expect(result.decision).toBe(DECISIONS.FLAGGED_MANUAL);
  });

  it("falls through to the band when the ban is off", () => {
    const stages = cleanStages({
      aiornot: cleanAiornot({ verdict: "ai", humanConfidence: 0.02 }),
    });
    const result = evaluate(stages, autoApproveConfig({ autoRejectAI: false }));
    expect(result.decision).toBe(DECISIONS.FLAGGED_MANUAL);
    expect(codes(result)).toContain("authenticity_fail");
  });
});

// --- Branches 4/5: authenticity ------------------------------------------------------------

describe("evaluate: authenticity bands", () => {
  // Default config: threshold 0.70, margin 0.05 -> pass >= 0.75, borderline [0.65, 0.75).
  const cases = [
    { humanConfidence: 1.0, expected: "pass" },
    { humanConfidence: 0.76, expected: "pass" },
    { humanConfidence: 0.75, expected: "pass" },
    { humanConfidence: 0.7499, expected: "borderline" },
    { humanConfidence: 0.7, expected: "borderline" },
    { humanConfidence: 0.65, expected: "borderline" },
    { humanConfidence: 0.6499, expected: "fail" },
    { humanConfidence: 0.3, expected: "fail" },
    { humanConfidence: 0, expected: "fail" },
  ];

  it.each(cases)(
    "human confidence $humanConfidence is $expected",
    ({ humanConfidence, expected }) => {
      const stages = cleanStages({ aiornot: cleanAiornot({ humanConfidence }) });
      const result = evaluate(stages, autoApproveConfig());

      if (expected === "pass") {
        expect(result.decision).toBe(DECISIONS.AUTO_APPROVED);
      } else if (expected === "borderline") {
        expect(result.decision).toBe(DECISIONS.FLAGGED_MANUAL);
        expect(codes(result)).toContain("authenticity_borderline");
      } else {
        expect(result.decision).toBe(DECISIONS.FLAGGED_MANUAL);
        expect(codes(result)).toContain("authenticity_fail");
      }
    }
  );

  it("rejects a clear authenticity failure when the brand configured reject", () => {
    const stages = cleanStages({ aiornot: cleanAiornot({ verdict: "ai", humanConfidence: 0.1 }) });
    const result = evaluate(stages, autoApproveConfig({ authenticityFailAction: "reject" }));
    expect(result.decision).toBe(DECISIONS.AUTO_REJECTED);
    expect(codes(result)).toContain("authenticity_fail");
  });

  it("never rejects on the borderline band, even with reject configured", () => {
    const stages = cleanStages({ aiornot: cleanAiornot({ humanConfidence: 0.7 }) });
    const result = evaluate(stages, autoApproveConfig({ authenticityFailAction: "reject" }));
    expect(result.decision).toBe(DECISIONS.FLAGGED_MANUAL);
  });

  it("defers when the provider itself says unknown", () => {
    const stages = cleanStages({ aiornot: cleanAiornot({ verdict: "unknown" }) });
    const result = evaluate(stages, autoApproveConfig());
    expect(result.decision).toBe(DECISIONS.FLAGGED_MANUAL);
    expect(codes(result)).toContain("authenticity_unknown");
  });

  it("defers when the confidence figure is missing", () => {
    const stages = cleanStages({ aiornot: cleanAiornot({ humanConfidence: null }) });
    const result = evaluate(stages, autoApproveConfig());
    expect(result.decision).toBe(DECISIONS.FLAGGED_MANUAL);
    expect(codes(result)).toContain("authenticity_missing_confidence");
  });

  it("moves the band with the brand's threshold", () => {
    const stages = cleanStages({ aiornot: cleanAiornot({ humanConfidence: 0.8 }) });
    // Threshold 90% -> pass needs >= 0.95, so 0.8 is now a failure rather than a pass.
    const result = evaluate(stages, autoApproveConfig({ confidenceThreshold: 90 }));
    expect(result.decision).toBe(DECISIONS.FLAGGED_MANUAL);
    expect(codes(result)).toContain("authenticity_fail");
  });
});

// --- Branch 6: flag categories -------------------------------------------------------------

describe("evaluate: moderation flag band", () => {
  it("flags between the safety and auto-reject thresholds", () => {
    const result = evaluate(
      cleanStages({ moderation: withScore("violence", 0.85) }),
      autoApproveConfig()
    );
    expect(result.decision).toBe(DECISIONS.FLAGGED_MANUAL);
    expect(codes(result)).toContain("moderation_flagged");
  });

  it("treats the safety threshold as inclusive", () => {
    const result = evaluate(
      cleanStages({ moderation: withScore("violence", 0.8) }),
      autoApproveConfig()
    );
    expect(codes(result)).toContain("moderation_flagged");
  });

  it("does not flag below the safety threshold", () => {
    const result = evaluate(
      cleanStages({ moderation: withScore("violence", 0.19) }),
      autoApproveConfig()
    );
    expect(result.decision).toBe(DECISIONS.AUTO_APPROVED);
  });

  it("is outranked by an authenticity problem, which is checked first", () => {
    const stages = cleanStages({
      aiornot: cleanAiornot({ humanConfidence: 0.7 }),
      moderation: withScore("violence", 0.85),
    });
    const result = evaluate(stages, autoApproveConfig());
    expect(codes(result)).toContain("authenticity_borderline");
    expect(codes(result)).not.toContain("moderation_flagged");
  });
});

// --- Branch 7: style and IP ----------------------------------------------------------------

describe("evaluate: style and IP", () => {
  it("flags a style score below the threshold", () => {
    const result = evaluate(
      cleanStages({ style: cleanStyle({ styleScore: 0.4 }) }),
      autoApproveConfig()
    );
    expect(result.decision).toBe(DECISIONS.FLAGGED_MANUAL);
    expect(codes(result)).toContain("style_below_threshold");
  });

  it("flags a brand fit score below the threshold", () => {
    const result = evaluate(
      cleanStages({ style: cleanStyle({ brandFitScore: 0.1 }) }),
      autoApproveConfig()
    );
    expect(codes(result)).toContain("brand_fit_below_threshold");
  });

  it("flags IP risk above the complement of the compliance requirement", () => {
    // ipComplianceThreshold 0.75 -> tolerate at most 0.25 risk.
    const result = evaluate(
      cleanStages({ style: cleanStyle({ ipRisk: 0.26 }) }),
      autoApproveConfig()
    );
    expect(codes(result)).toContain("ip_risk_too_high");
  });

  it("accepts IP risk exactly at the tolerance", () => {
    const result = evaluate(
      cleanStages({ style: cleanStyle({ ipRisk: 0.25 }) }),
      autoApproveConfig()
    );
    expect(result.decision).toBe(DECISIONS.AUTO_APPROVED);
  });

  it("flags an explicit style-guide violation list", () => {
    const result = evaluate(
      cleanStages({ style: cleanStyle({ violations: ["uses a banned character"] }) }),
      autoApproveConfig()
    );
    expect(codes(result)).toContain("style_guide_violation");
  });

  it("rejects style violations when the brand configured reject", () => {
    const result = evaluate(
      cleanStages({ style: cleanStyle({ styleScore: 0.1 }) }),
      autoApproveConfig({ styleViolationAction: "reject" })
    );
    expect(result.decision).toBe(DECISIONS.AUTO_REJECTED);
  });

  it("reports every style violation at once, not just the first", () => {
    const result = evaluate(
      cleanStages({
        style: cleanStyle({ styleScore: 0.1, brandFitScore: 0.1, ipRisk: 0.9, violations: ["x"] }),
      }),
      autoApproveConfig()
    );
    expect(codes(result)).toEqual(
      expect.arrayContaining([
        "style_below_threshold",
        "brand_fit_below_threshold",
        "ip_risk_too_high",
        "style_guide_violation",
      ])
    );
  });

  it("auto-approves when the style stage was legitimately skipped", () => {
    const result = evaluate(
      cleanStages({ style: { status: "skipped", reason: "no_brand_context" } }),
      autoApproveConfig()
    );
    expect(result.decision).toBe(DECISIONS.AUTO_APPROVED);
  });
});

// --- Degradation ---------------------------------------------------------------------------

describe("evaluate: degradation goes to humans, never to approval", () => {
  it.each(["aiornot", "moderation", "style"])(
    "defers when the %s stage is unavailable",
    (stageName) => {
      const stages = cleanStages({ [stageName]: { status: "unavailable", error: "timeout" } });
      const result = evaluate(stages, autoApproveConfig());

      expect(result.decision).toBe(DECISIONS.FLAGGED_MANUAL);
      expect(codes(result)).toContain("stage_unavailable");
      expect(result.reasons.find((r) => r.code === "stage_unavailable").stages).toContain(
        stageName
      );
    }
  );

  it("defers when every stage is unavailable", () => {
    const result = evaluate(
      {
        aiornot: { status: "unavailable" },
        moderation: { status: "unavailable" },
        style: { status: "unavailable" },
      },
      autoApproveConfig()
    );
    expect(result.decision).toBe(DECISIONS.FLAGGED_MANUAL);
  });

  it("still rejects a condemned image when an unrelated stage is unavailable", () => {
    const stages = {
      aiornot: cleanAiornot(),
      moderation: withScore("violence", 0.95),
      style: { status: "unavailable" },
    };
    expect(evaluate(stages, autoApproveConfig()).decision).toBe(DECISIONS.AUTO_REJECTED);
  });
});

// --- Precedence table ----------------------------------------------------------------------

describe("evaluate: precedence", () => {
  const hardRejectModeration = cleanModeration({
    categories: { ...cleanModeration().categories, "sexual/minors": true },
  });

  const table = [
    {
      name: "hard reject outranks an auto-reject score",
      stages: cleanStages({
        moderation: cleanModeration({
          categories: { ...cleanModeration().categories, "sexual/minors": true },
          categoryScores: { ...zeroScores, violence: 0.99 },
        }),
      }),
      config: autoApproveConfig(),
      decision: DECISIONS.AUTO_REJECTED,
      firstCode: "moderation_hard_reject",
    },
    {
      name: "hard reject outranks an AI ban",
      stages: cleanStages({
        aiornot: cleanAiornot({ verdict: "ai", humanConfidence: 0.01 }),
        moderation: hardRejectModeration,
      }),
      config: autoApproveConfig({ autoRejectAI: true }),
      decision: DECISIONS.AUTO_REJECTED,
      firstCode: "moderation_hard_reject",
    },
    {
      name: "an auto-reject score outranks an AI ban",
      stages: cleanStages({
        aiornot: cleanAiornot({ verdict: "ai", humanConfidence: 0.01 }),
        moderation: withScore("violence", 0.99),
      }),
      config: autoApproveConfig({ autoRejectAI: true }),
      decision: DECISIONS.AUTO_REJECTED,
      firstCode: "moderation_auto_reject",
    },
    {
      name: "an AI ban outranks the borderline band",
      stages: cleanStages({ aiornot: cleanAiornot({ verdict: "ai", humanConfidence: 0.7 }) }),
      config: autoApproveConfig({ autoRejectAI: true }),
      decision: DECISIONS.AUTO_REJECTED,
      firstCode: "ai_generated_rejected",
    },
    {
      name: "the borderline band outranks a moderation flag",
      stages: cleanStages({
        aiornot: cleanAiornot({ humanConfidence: 0.7 }),
        moderation: withScore("violence", 0.85),
      }),
      config: autoApproveConfig(),
      decision: DECISIONS.FLAGGED_MANUAL,
      containsCode: "authenticity_borderline",
    },
    {
      name: "a moderation flag outranks a style violation",
      stages: cleanStages({
        moderation: withScore("violence", 0.85),
        style: cleanStyle({ styleScore: 0.01 }),
      }),
      config: autoApproveConfig(),
      decision: DECISIONS.FLAGGED_MANUAL,
      containsCode: "moderation_flagged",
      excludesCode: "style_below_threshold",
    },
    {
      name: "a style violation outranks auto-approval",
      stages: cleanStages({ style: cleanStyle({ ipRisk: 0.99 }) }),
      config: autoApproveConfig(),
      decision: DECISIONS.FLAGGED_MANUAL,
      containsCode: "ip_risk_too_high",
    },
  ];

  it.each(table)("$name", ({ stages, config, decision, firstCode, containsCode, excludesCode }) => {
    const result = evaluate(stages, config);
    expect(result.decision).toBe(decision);
    if (firstCode) expect(result.reasons[0].code).toBe(firstCode);
    if (containsCode) expect(codes(result)).toContain(containsCode);
    if (excludesCode) expect(codes(result)).not.toContain(excludesCode);
  });
});

// --- Properties ----------------------------------------------------------------------------

describe("evaluate: invariants", () => {
  // Enumerates a wide grid of stage/config combinations and asserts the two rules that must hold
  // no matter what. This is the safety net for future edits to the precedence chain.
  const verdicts = ["human", "ai", "unknown"];
  const confidences = [0, 0.5, 0.649, 0.65, 0.7, 0.75, 0.9, 1];
  const scores = [0, 0.19, 0.2, 0.5, 0.8, 0.9, 1];
  const stageStatuses = ["ok", "unavailable", "skipped"];

  function* combinations() {
    for (const verdict of verdicts) {
      for (const humanConfidence of confidences) {
        for (const score of scores) {
          for (const styleStatus of stageStatuses) {
            for (const requireHumanReview of [true, false]) {
              yield {
                stages: {
                  aiornot: cleanAiornot({ verdict, humanConfidence }),
                  moderation: withScore("violence", score),
                  style:
                    styleStatus === "ok"
                      ? cleanStyle()
                      : { status: styleStatus },
                },
                config: normalizeRulesetConfig({ requireHumanReview }),
              };
            }
          }
        }
      }
    }
  }

  const allCases = [...combinations()];

  it("covers a broad grid", () => {
    expect(allCases.length).toBe(
      verdicts.length * confidences.length * scores.length * stageStatuses.length * 2
    );
  });

  it("always returns one of the three known decisions, with at least one reason", () => {
    for (const { stages, config } of allCases) {
      const result = evaluate(stages, config);
      expect(Object.values(DECISIONS)).toContain(result.decision);
      expect(result.reasons.length).toBeGreaterThan(0);
    }
  });

  it("never auto-approves unless every requirement is genuinely met", () => {
    for (const { stages, config } of allCases) {
      const result = evaluate(stages, config);
      if (result.decision !== DECISIONS.AUTO_APPROVED) continue;

      // Human review must be off.
      expect(config.requireHumanReview).toBe(false);
      // Authenticity must be a confident human verdict at or above the top of the band.
      expect(stages.aiornot.verdict).not.toBe("unknown");
      expect(stages.aiornot.humanConfidence).toBeGreaterThanOrEqual(
        config.aiDetectionThreshold + config.authenticityBorderlineMargin
      );
      // Content must be quiet enough for the auto-approve bar.
      const maxScore = Math.max(...Object.values(stages.moderation.categoryScores));
      expect(maxScore).toBeLessThanOrEqual(config.autoApproveThreshold);
      // No stage may have degraded.
      for (const stage of ["aiornot", "moderation", "style"]) {
        expect(stages[stage].status).not.toBe("unavailable");
      }
    }
  });

  it("never auto-approves when any stage is unavailable", () => {
    for (const { stages, config } of allCases) {
      if (stages.style.status !== "unavailable") continue;
      expect(evaluate(stages, config).decision).not.toBe(DECISIONS.AUTO_APPROVED);
    }
  });

  it("auto-approves at least once, so the grid is not vacuously passing", () => {
    const approvals = allCases.filter(
      ({ stages, config }) => evaluate(stages, config).decision === DECISIONS.AUTO_APPROVED
    );
    expect(approvals.length).toBeGreaterThan(0);
  });
});
