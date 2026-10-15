// Stand-in adapters with the same interface as the real ones.
//
// They exist so the pipeline can be exercised end to end — enqueue, worker, stage persistence,
// decision, transition, audit — without an API key, a bill, or network flakiness. Selected by
// setting SCREENING_ADAPTERS=mock.
//
// The verdicts are derived from the artwork title so a developer can steer the pipeline
// deliberately: put "reject", "flag", "ai" or "fail" in the title to trigger that path.

function titleOf(input) {
  return (input?.artwork?.title ?? "").toLowerCase();
}

const aiornot = {
  name: "aiornot",
  async run(input) {
    const title = titleOf(input);

    if (title.includes("mockfail")) {
      throw new Error("mock aiornot failure");
    }

    const looksAi = title.includes("ai") || title.includes("midjourney");
    const borderline = title.includes("borderline");

    const humanConfidence = looksAi ? 0.04 : borderline ? 0.7 : 0.97;

    return {
      verdict: looksAi ? "ai" : "human",
      humanConfidence,
      aiConfidence: 1 - humanConfidence,
      generators: looksAi ? ["midjourney"] : [],
      nsfw: { isDetected: false },
      quality: { isDetected: true },
      provider: "mock",
    };
  },
};

const moderation = {
  name: "moderation",
  async run(input) {
    const title = titleOf(input);

    if (title.includes("mockfail")) {
      throw new Error("mock moderation failure");
    }

    const score = title.includes("reject") ? 0.97 : title.includes("flag") ? 0.85 : 0.01;

    return {
      flagged: score >= 0.5,
      categories: { violence: score >= 0.5 },
      categoryScores: { violence: score },
      categoryAppliedInputTypes: { violence: ["image"] },
      provider: "mock",
    };
  },
};

const style = {
  name: "style",
  async run(input) {
    const title = titleOf(input);

    if (title.includes("mockfail")) {
      throw new Error("mock style failure");
    }

    const offStyle = title.includes("offstyle");

    return {
      styleScore: offStyle ? 0.2 : 0.94,
      brandFitScore: offStyle ? 0.2 : 0.9,
      ipRisk: title.includes("infringing") ? 0.95 : 0.02,
      violations: offStyle ? ["mock: does not match the style guide"] : [],
      provider: "mock",
    };
  },
};

module.exports = { aiornot, moderation, style };
