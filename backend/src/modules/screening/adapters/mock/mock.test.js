import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { aiornot, compileStyleGuide, style } = require("./index.js");

const input = (title, extra = {}) => ({ artwork: { title, description: "" }, ...extra });

describe("mock adapters", () => {
  it("steers on whole words, so 'Rainy day' is not read as AI", async () => {
    expect((await aiornot.run(input("Rainy day"))).verdict).toBe("human");
    expect((await aiornot.run(input("an AI generated landscape"))).verdict).toBe("ai");
  });

  it("reports a violation for a term the brand's compiled style guide bans", async () => {
    const parsed_rules = await compileStyleGuide("No pink\nThe hero must wear the red jacket");
    const result = await style.run(input("Pink hero", { styleGuide: { id: "g-1", parsed_rules } }));

    expect(parsed_rules.banned_content).toEqual(["pink"]);
    expect(parsed_rules.required_elements).toEqual(["The hero must wear the red jacket"]);
    expect(result.violations).toEqual(['mock: style guide bans "pink"']);
  });
});
