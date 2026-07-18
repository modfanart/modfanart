// Harness smoke test — proves `npm test` runs cleanly before any real suites exist.
// Real coverage starts in Phase 1 (decision engine, transition service) under
// src/modules/moderation/.
import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
