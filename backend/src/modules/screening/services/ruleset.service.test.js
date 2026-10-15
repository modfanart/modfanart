import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  authenticityBands,
  maxAcceptableIpRisk,
  normalizeRulesetConfig,
  publishRulesetVersion,
  resolveRuleset,
  safeNormalizeRulesetConfig,
} = require("./ruleset.service.js");

describe("normalizeRulesetConfig", () => {
  it("fills every field from an empty input", () => {
    const config = normalizeRulesetConfig({});

    expect(config.enabled).toBe(true);
    expect(config.requireHumanReview).toBe(true);
    expect(config.aiDetectionThreshold).toBe(0.7);
    expect(config.contentSafetyThreshold).toBe(0.8);
    expect(config.hardRejectCategories).toEqual(["sexual/minors"]);
  });

  it("strips unknown keys rather than rejecting them, so old stored versions still parse", () => {
    const config = normalizeRulesetConfig({ somethingRetired: 42 });
    expect(config).not.toHaveProperty("somethingRetired");
  });

  it("rejects out-of-range fractions", () => {
    expect(() => normalizeRulesetConfig({ contentSafetyThreshold: 1.5 })).toThrow();
    expect(() => normalizeRulesetConfig({ autoRejectThreshold: -0.1 })).toThrow();
  });

  it("rejects an unknown moderation category in hardRejectCategories", () => {
    const result = safeNormalizeRulesetConfig({
      hardRejectCategories: ["not-a-category"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown sensitivity level", () => {
    expect(() => normalizeRulesetConfig({ sensitivityLevel: "medium" })).toThrow();
  });

  describe("authenticity threshold reconciliation", () => {
    it("derives the fraction from the percent the slider sends", () => {
      const config = normalizeRulesetConfig({ confidenceThreshold: 90 });
      expect(config.aiDetectionThreshold).toBeCloseTo(0.9);
      expect(config.confidenceThreshold).toBe(90);
    });

    it("derives the percent when only the fraction is given", () => {
      const config = normalizeRulesetConfig({ aiDetectionThreshold: 0.55 });
      expect(config.confidenceThreshold).toBe(55);
    });

    it("lets the slider win when the two disagree, and never stores a mismatch", () => {
      const config = normalizeRulesetConfig({
        confidenceThreshold: 80,
        aiDetectionThreshold: 0.2,
      });
      expect(config.aiDetectionThreshold).toBeCloseTo(0.8);
      expect(config.confidenceThreshold).toBe(80);
    });

    it("keeps the pair consistent through a save/reload round-trip", () => {
      const once = normalizeRulesetConfig({ confidenceThreshold: 64 });
      const twice = normalizeRulesetConfig(once);
      expect(twice.aiDetectionThreshold).toBeCloseTo(once.aiDetectionThreshold);
      expect(twice.confidenceThreshold).toBe(once.confidenceThreshold);
    });
  });
});

describe("authenticityBands", () => {
  it("reproduces the 65%-75% grey zone from the product spec", () => {
    const bands = authenticityBands(normalizeRulesetConfig({}));
    expect(bands.low).toBeCloseTo(0.65);
    expect(bands.high).toBeCloseTo(0.75);
  });

  it("clamps to [0,1] for extreme thresholds", () => {
    const low = authenticityBands(
      normalizeRulesetConfig({ confidenceThreshold: 2, authenticityBorderlineMargin: 0.2 })
    );
    expect(low.low).toBe(0);

    const high = authenticityBands(
      normalizeRulesetConfig({ confidenceThreshold: 99, authenticityBorderlineMargin: 0.2 })
    );
    expect(high.high).toBe(1);
  });
});

describe("maxAcceptableIpRisk", () => {
  it("is the complement of the compliance requirement", () => {
    expect(maxAcceptableIpRisk(normalizeRulesetConfig({}))).toBeCloseTo(0.25);
    expect(
      maxAcceptableIpRisk(normalizeRulesetConfig({ ipComplianceThreshold: 1 }))
    ).toBeCloseTo(0);
  });
});

// A minimal stand-in for the Kysely query builder, covering only the chain the ruleset model
// actually uses. Enough to prove resolution order without a database.
function fakeDb(rows) {
  return {
    selectFrom() {
      const state = { brandFilter: undefined };
      const chain = {
        selectAll: () => chain,
        where(column, op, value) {
          if (column === "brand_id") {
            state.brandFilter = op === "is" ? null : value;
          }
          return chain;
        },
        orderBy: () => chain,
        limit: () => chain,
        async executeTakeFirst() {
          const matching = rows
            .filter((r) => r.brand_id === state.brandFilter)
            .sort((a, b) => b.version - a.version);
          return matching[0];
        },
      };
      return chain;
    },
    insertInto() {
      const chain = {
        values(v) {
          chain._values = v;
          return chain;
        },
        returningAll: () => chain,
        async executeTakeFirst() {
          return { ...chain._values, config: JSON.parse(chain._values.config) };
        },
      };
      return chain;
    },
  };
}

const platformRow = { id: "platform-1", brand_id: null, version: 1, config: {} };
const brandRow = { id: "brand-v2", brand_id: "brand-a", version: 2, config: {} };

describe("resolveRuleset", () => {
  it("prefers the brand's newest version when there is brand context", async () => {
    const db = fakeDb([platformRow, brandRow, { ...brandRow, id: "brand-v1", version: 1 }]);
    const resolved = await resolveRuleset(db, { brandId: "brand-a" });
    expect(resolved.id).toBe("brand-v2");
  });

  it("falls back to the platform default when the brand has no ruleset", async () => {
    const db = fakeDb([platformRow]);
    const resolved = await resolveRuleset(db, { brandId: "brand-with-none" });
    expect(resolved.id).toBe("platform-1");
  });

  it("uses the platform default when there is no brand context at all", async () => {
    const db = fakeDb([platformRow]);
    const resolved = await resolveRuleset(db, {});
    expect(resolved.id).toBe("platform-1");
  });

  it("throws rather than inventing thresholds when nothing is seeded", async () => {
    await expect(resolveRuleset(fakeDb([]), {})).rejects.toThrow(
      /No platform default ruleset/
    );
  });
});

describe("publishRulesetVersion", () => {
  it("increments the version from the currently active one", async () => {
    const db = fakeDb([{ ...brandRow, config: {} }]);
    const created = await publishRulesetVersion(db, {
      brandId: "brand-a",
      config: { confidenceThreshold: 90 },
    });
    expect(created.version).toBe(3);
  });

  it("starts at version 1 for a brand's first ruleset", async () => {
    const created = await publishRulesetVersion(fakeDb([]), {
      brandId: "brand-new",
      config: {},
    });
    expect(created.version).toBe(1);
  });

  it("treats a partial edit as a change to those knobs, not a reset of the others", async () => {
    const existing = {
      ...brandRow,
      config: normalizeRulesetConfig({ requireHumanReview: false, brandFitThreshold: 0.9 }),
    };
    const created = await publishRulesetVersion(fakeDb([existing]), {
      brandId: "brand-a",
      config: { confidenceThreshold: 90 },
    });

    expect(created.config.aiDetectionThreshold).toBeCloseTo(0.9);
    // Untouched fields survive.
    expect(created.config.requireHumanReview).toBe(false);
    expect(created.config.brandFitThreshold).toBeCloseTo(0.9);
  });
});
