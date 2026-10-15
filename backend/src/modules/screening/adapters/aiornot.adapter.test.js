import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const adapter = require("./aiornot.adapter.js");

const image = {
  buffer: Buffer.from("fake png bytes"),
  contentType: "image/png",
  bytes: 14,
  filename: "artwork.png",
};

const artwork = { id: "artwork-1", title: "A cat" };

/** The documented v2 response shape, as returned for a human-made image. */
function humanResponse() {
  return {
    id: "req-123",
    created_at: "2026-08-16T12:00:00Z",
    report: {
      ai_generated: {
        verdict: "human",
        ai: { is_detected: false, confidence: 0.02 },
        human: { is_detected: true, confidence: 0.98 },
        generator: {
          midjourney: { is_detected: false, confidence: 0.01 },
          dall_e: { is_detected: false, confidence: 0.0 },
        },
      },
      nsfw: { is_detected: false, confidence: 0.01 },
      quality: { is_detected: true, confidence: 0.9 },
    },
  };
}

function aiResponse() {
  return {
    id: "req-456",
    report: {
      ai_generated: {
        verdict: "ai",
        ai: { is_detected: true, confidence: 0.99 },
        human: { is_detected: false, confidence: 0.01 },
        generator: {
          midjourney: { is_detected: true, confidence: 0.97 },
          stable_diffusion: { is_detected: false, confidence: 0.1 },
        },
      },
      nsfw: { is_detected: false },
      quality: { is_detected: true },
    },
  };
}

function mockFetch(body, { status = 200 } = {}) {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  }));
}

let originalFetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  process.env.AIORNOT_API_KEY = "test-key";
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.AIORNOT_API_KEY;
  vi.restoreAllMocks();
});

describe("aiornot adapter: request", () => {
  it("posts multipart to the v2 sync endpoint with bearer auth", async () => {
    globalThis.fetch = mockFetch(humanResponse());

    await adapter.run({ image, artwork, runId: "run-9" });

    const [url, options] = globalThis.fetch.mock.calls[0];
    expect(url.origin + url.pathname).toBe("https://api.aiornot.com/v2/image/sync");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer test-key");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("image")).toBeInstanceOf(Blob);
  });

  it("requests only the reports it needs, leaving the separately billed deepfake report out", async () => {
    globalThis.fetch = mockFetch(humanResponse());

    await adapter.run({ image, artwork, runId: "run-9" });

    const [url] = globalThis.fetch.mock.calls[0];
    expect(url.searchParams.get("only")).toBe("ai_generated,nsfw,quality");
    expect(url.searchParams.get("only")).not.toContain("deepfake");
  });

  it("passes the run id as external_id so a provider query traces back to a run", async () => {
    globalThis.fetch = mockFetch(humanResponse());

    await adapter.run({ image, artwork, runId: "run-9" });

    expect(globalThis.fetch.mock.calls[0][0].searchParams.get("external_id")).toBe("run-9");
  });
});

describe("aiornot adapter: response mapping", () => {
  it("maps a human verdict", async () => {
    globalThis.fetch = mockFetch(humanResponse());

    const result = await adapter.run({ image, artwork });

    expect(result).toMatchObject({
      verdict: "human",
      humanConfidence: 0.98,
      aiConfidence: 0.02,
      generators: [],
      provider: "aiornot",
      providerRequestId: "req-123",
    });
    expect(result.nsfw).toEqual({ isDetected: false, confidence: 0.01 });
    expect(result.quality).toEqual({ isDetected: true, confidence: 0.9 });
  });

  it("reports only the generators it actually detected", async () => {
    globalThis.fetch = mockFetch(aiResponse());

    const result = await adapter.run({ image, artwork });

    expect(result.verdict).toBe("ai");
    expect(result.generators).toEqual(["midjourney"]);
    // Every score is kept for analytics, even the ones below the detection bar.
    expect(result.generatorScores).toEqual({ midjourney: 0.97, stable_diffusion: 0.1 });
  });

  it("passes an unknown verdict through instead of coercing it", async () => {
    const body = humanResponse();
    body.report.ai_generated.verdict = "unknown";
    globalThis.fetch = mockFetch(body);

    const result = await adapter.run({ image, artwork });
    expect(result.verdict).toBe("unknown");
  });

  it("tolerates a response with no nsfw or quality report", async () => {
    const body = humanResponse();
    delete body.report.nsfw;
    body.report.quality = null;
    globalThis.fetch = mockFetch(body);

    const result = await adapter.run({ image, artwork });
    expect(result.nsfw).toBeNull();
    expect(result.quality).toBeNull();
  });

  it("tolerates a missing generator map", async () => {
    const body = humanResponse();
    delete body.report.ai_generated.generator;
    globalThis.fetch = mockFetch(body);

    const result = await adapter.run({ image, artwork });
    expect(result.generators).toEqual([]);
  });
});

describe("aiornot adapter: failures", () => {
  it("refuses to call without an API key, permanently", async () => {
    delete process.env.AIORNOT_API_KEY;
    globalThis.fetch = mockFetch(humanResponse());

    await expect(adapter.run({ image, artwork })).rejects.toMatchObject({ permanent: true });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("rejects an oversized image before spending a call", async () => {
    globalThis.fetch = mockFetch(humanResponse());

    await expect(
      adapter.run({ image: { ...image, bytes: 51 * 1024 * 1024 }, artwork })
    ).rejects.toMatchObject({ permanent: true });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("rejects an unsupported content type before spending a call", async () => {
    globalThis.fetch = mockFetch(humanResponse());

    await expect(
      adapter.run({ image: { ...image, contentType: "image/svg+xml" }, artwork })
    ).rejects.toMatchObject({ permanent: true });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("treats a 4xx as permanent, since the same request would fail again", async () => {
    globalThis.fetch = mockFetch("bad request", { status: 400 });

    await expect(adapter.run({ image, artwork })).rejects.toMatchObject({ permanent: true });
  });

  it("treats a 429 as retryable, unlike other 4xx", async () => {
    globalThis.fetch = mockFetch("slow down", { status: 429 });

    const error = await adapter.run({ image, artwork }).catch((e) => e);
    expect(error.permanent).toBeFalsy();
  });

  it("treats a 5xx as retryable", async () => {
    globalThis.fetch = mockFetch("upstream boom", { status: 503 });

    const error = await adapter.run({ image, artwork }).catch((e) => e);
    expect(error.permanent).toBeFalsy();
    expect(error.message).toMatch(/503/);
  });

  it("fails loudly when the response shape changes, rather than reporting a missing score", async () => {
    globalThis.fetch = mockFetch({ report: { ai_generated: { verdict: "human" } } });

    await expect(adapter.run({ image, artwork })).rejects.toThrow(
      /did not match the expected shape/
    );
  });

  it("rejects a verdict value it does not understand", async () => {
    const body = humanResponse();
    body.report.ai_generated.verdict = "probably-ai";
    globalThis.fetch = mockFetch(body);

    await expect(adapter.run({ image, artwork })).rejects.toThrow(
      /did not match the expected shape/
    );
  });
});
