import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const { createFakeDb } = require("../__fixtures__/fakeDb.js");
const { DECISIONS } = require("./decision.engine.js");
const { escapeHtml, notifyDecision } = require("./notification.service.js");

const ARTWORK_ID = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";
const RUN_ID = "33333333-3333-4333-8333-333333333333";

function seed({ email = "artist@example.com" } = {}) {
  return createFakeDb({
    users: [{ id: USER_ID, email, username: "artist" }],
    artworks: [{ id: ARTWORK_ID, title: "Sunset", creator_id: USER_ID }],
  });
}

function stubs() {
  return {
    notificationModel: { create: vi.fn(async (row) => row) },
    emailService: {
      generateTemplate: vi.fn(({ content }) => `<html>${content}</html>`),
      sendEmail: vi.fn(async () => ({ statusCode: 202 })),
    },
  };
}

const run = { id: RUN_ID, artwork_id: ARTWORK_ID };

describe("escapeHtml", () => {
  it("neutralises markup in an artist-supplied title", () => {
    expect(escapeHtml(`<img src=x onerror="alert('x')">`)).toBe(
      "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;"
    );
  });

  it("survives null and undefined", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });
});

describe("notifyDecision", () => {
  let deps;

  beforeEach(() => {
    deps = stubs();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  for (const decision of Object.values(DECISIONS)) {
    it(`sends both channels for ${decision}`, async () => {
      const db = seed();

      const result = await notifyDecision(
        db,
        { run, decision, config: { notifyArtist: true } },
        deps
      );

      expect(result).toMatchObject({ notified: true, inApp: true, email: true });
      expect(deps.notificationModel.create).toHaveBeenCalledTimes(1);
      expect(deps.emailService.sendEmail).toHaveBeenCalledTimes(1);

      const [notification] = deps.notificationModel.create.mock.calls[0];
      expect(notification.user_id).toBe(USER_ID);
      expect(notification.data).toEqual({
        artwork_id: ARTWORK_ID,
        screening_run_id: RUN_ID,
        decision,
      });
    });
  }

  it("says 'reviewed', not 'flagged', so the artist cannot tune against the detector", async () => {
    const db = seed();

    await notifyDecision(
      db,
      { run, decision: DECISIONS.FLAGGED_MANUAL, config: {} },
      deps
    );

    const [notification] = deps.notificationModel.create.mock.calls[0];
    const [{ html }] = deps.emailService.sendEmail.mock.calls[0];

    expect(`${notification.title} ${notification.body} ${html}`.toLowerCase()).not.toContain(
      "flag"
    );
  });

  it("stays silent when the ruleset disables artist notification", async () => {
    const db = seed();

    const result = await notifyDecision(
      db,
      { run, decision: DECISIONS.AUTO_APPROVED, config: { notifyArtist: false } },
      deps
    );

    expect(result).toEqual({ notified: false, reason: "disabled_by_ruleset" });
    expect(deps.notificationModel.create).not.toHaveBeenCalled();
    expect(deps.emailService.sendEmail).not.toHaveBeenCalled();
  });

  it("defaults to notifying when the flag is absent", async () => {
    const db = seed();

    const result = await notifyDecision(
      db,
      { run, decision: DECISIONS.AUTO_APPROVED, config: {} },
      deps
    );

    expect(result.notified).toBe(true);
  });

  it("escapes the title before it reaches the email body", async () => {
    const db = createFakeDb({
      users: [{ id: USER_ID, email: "artist@example.com", username: "artist" }],
      artworks: [
        { id: ARTWORK_ID, title: "<script>steal()</script>", creator_id: USER_ID },
      ],
    });

    await notifyDecision(db, { run, decision: DECISIONS.AUTO_APPROVED, config: {} }, deps);

    const [{ html }] = deps.emailService.sendEmail.mock.calls[0];
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("still writes the in-app row when SendGrid fails", async () => {
    const db = seed();
    deps.emailService.sendEmail.mockRejectedValue(new Error("sendgrid 503"));

    const result = await notifyDecision(
      db,
      { run, decision: DECISIONS.AUTO_APPROVED, config: {} },
      deps
    );

    expect(result).toMatchObject({ notified: true, inApp: true, email: false });
  });

  it("still emails when the in-app insert fails", async () => {
    const db = seed();
    deps.notificationModel.create.mockRejectedValue(new Error("db down"));

    const result = await notifyDecision(
      db,
      { run, decision: DECISIONS.AUTO_APPROVED, config: {} },
      deps
    );

    expect(result).toMatchObject({ notified: true, inApp: false, email: true });
  });

  it("skips email when the creator has no address on file", async () => {
    const db = seed({ email: null });

    const result = await notifyDecision(
      db,
      { run, decision: DECISIONS.AUTO_APPROVED, config: {} },
      deps
    );

    expect(result).toMatchObject({ notified: true, inApp: true, email: false });
    expect(deps.emailService.sendEmail).not.toHaveBeenCalled();
  });

  it("reports rather than throws when the artwork has no creator", async () => {
    const db = createFakeDb({ users: [], artworks: [] });

    const result = await notifyDecision(
      db,
      { run, decision: DECISIONS.AUTO_APPROVED, config: {} },
      deps
    );

    expect(result).toEqual({ notified: false, reason: "no_creator" });
  });

  it("reports an unrecognised decision instead of guessing a message", async () => {
    const db = seed();

    const result = await notifyDecision(db, { run, decision: "banana", config: {} }, deps);

    expect(result).toEqual({ notified: false, reason: "unknown_decision" });
    expect(deps.notificationModel.create).not.toHaveBeenCalled();
  });
});
