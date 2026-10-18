// Stand-in adapters with the same interface as the real ones.
//
// They exist so the pipeline can be exercised end to end — enqueue, worker, stage persistence,
// decision, transition, audit — without an API key, a bill, or network flakiness. Selected by
// setting SCREENING_ADAPTERS=mock.
//
// The verdicts are derived from whole words in the artwork title so a developer can steer the
// pipeline deliberately (a substring match would make "Rainy day" an AI image):
//   ai, midjourney   authenticity: AI-generated          borderline   authenticity: grey zone
//   reject           moderation: auto-reject score       flag         moderation: flag score
//   offstyle         style: off-guide                    infringing   style: high IP risk
//   mockfail         every stage throws (retry / degradation path)
// The style stage also reports a violation for any term the brand's style guide bans that appears
// in the title or description.

function textOf(input) {
  return `${input?.artwork?.title ?? ""} ${input?.artwork?.description ?? ""}`.toLowerCase();
}

function hasWord(text, word) {
  return new RegExp(`\\b${word}\\b`).test(text);
}

const aiornot = {
  name: "aiornot",
  async run(input) {
    const title = (input?.artwork?.title ?? "").toLowerCase();

    if (hasWord(title, "mockfail")) {
      throw new Error("mock aiornot failure");
    }

    const looksAi = hasWord(title, "ai") || hasWord(title, "midjourney");
    const borderline = hasWord(title, "borderline");

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
    const title = (input?.artwork?.title ?? "").toLowerCase();

    if (hasWord(title, "mockfail")) {
      throw new Error("mock moderation failure");
    }

    const score = hasWord(title, "reject") ? 0.97 : hasWord(title, "flag") ? 0.85 : 0.01;

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
    const title = (input?.artwork?.title ?? "").toLowerCase();

    if (hasWord(title, "mockfail")) {
      throw new Error("mock style failure");
    }

    const offStyle = hasWord(title, "offstyle");
    const text = textOf(input);
    const banned = [
      ...(input?.styleGuide?.parsed_rules?.banned_content ?? []),
      ...(input?.styleGuide?.parsed_rules?.banned_characters ?? []),
    ];
    const bannedHits = banned.filter((term) => term && text.includes(term.toLowerCase()));

    return {
      styleScore: offStyle ? 0.2 : 0.94,
      brandFitScore: offStyle ? 0.2 : 0.9,
      ipRisk: hasWord(title, "infringing") ? 0.95 : 0.02,
      violations: [
        ...(offStyle ? ["mock: does not match the style guide"] : []),
        ...bannedHits.map((term) => `mock: style guide bans "${term}"`),
      ],
      notes: "mock assessment",
      styleGuideId: input?.styleGuide?.id ?? null,
      provider: "mock",
    };
  },
};

/**
 * Stands in for the model call that compiles a style guide, so a brand can upload one and see the
 * style stage use it without an OpenAI key. One rule per line: lines opening with "no", "never",
 * "don't" or "avoid" are bans, lines with "must" or "always" are requirements, and the rest is
 * kept as notes. A ban's subject is the rest of the line, e.g. "No pink" bans "pink".
 */
async function compileStyleGuide(sourceText) {
  const rules = {
    banned_characters: [],
    banned_content: [],
    required_elements: [],
    allowed_colors: [],
    banned_colors: [],
    tone: [],
    composition_rules: [],
    quality_requirements: [],
    notes: "",
  };
  const notes = [];

  for (const raw of sourceText.split(/\r?\n/)) {
    const line = raw.replace(/^[\s*•-]+/, "").trim();
    if (!line) continue;

    const ban = line.match(/^(?:no|never|don't|do not|avoid)\s+(.+?)\.?$/i);

    if (ban) {
      rules.banned_content.push(ban[1].trim());
    } else if (/\b(must|always)\b/i.test(line)) {
      rules.required_elements.push(line);
    } else {
      notes.push(line);
    }
  }

  rules.notes = notes.join(" ");

  return rules;
}

module.exports = { aiornot, moderation, style, compileStyleGuide };
