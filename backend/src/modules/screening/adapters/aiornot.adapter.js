// Stage A — authenticity, via AI or Not.
//
// POST https://api.aiornot.com/v2/image/sync
//   Authorization: Bearer <key>
//   multipart/form-data, field `image`
//   ?only=ai_generated,nsfw,quality   (ai_generated and deepfake are billed separately, so
//                                      deepfake is not requested; nsfw and quality are cheap
//                                      extras that feed the content and minimum-quality rules)
//   ?external_id=<run id>             (so a support query can be traced back to a run)
//
// Limits: 50MB, jpg/jpeg/png/webp/heic/heif/tiff.
//
// The response is parsed with zod rather than trusted. A provider that changes shape should
// produce a loud failure that routes the submission to a human, not a silently absent score that
// the engine might read as "fine".
const { z } = require("zod");

const { AIORNOT_MAX_BYTES } = require("../services/image.loader");

const API_URL = "https://api.aiornot.com/v2/image/sync";
const REQUESTED_REPORTS = "ai_generated,nsfw,quality";
const DEFAULT_TIMEOUT_MS = 30000;

const SUPPORTED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/tiff",
]);

const predictionSchema = z.object({
  is_detected: z.boolean(),
  confidence: z.number(),
});

const responseSchema = z.object({
  id: z.string().optional(),
  created_at: z.string().optional(),
  report: z.object({
    ai_generated: z.object({
      // Their docs are explicit that `verdict` is the field to act on: it is calibrated, whereas
      // raw confidence drifts as they retrain. 'unknown' is a real value, not an error.
      verdict: z.enum(["ai", "human", "unknown"]),
      ai: predictionSchema,
      human: predictionSchema,
      generator: z.record(z.string(), predictionSchema).optional().default({}),
    }),
    nsfw: z
      .object({ is_detected: z.boolean(), confidence: z.number().optional() })
      .nullish(),
    quality: z
      .object({ is_detected: z.boolean(), confidence: z.number().optional() })
      .nullish(),
  }),
});

/** Marks an error as not worth retrying. */
function permanent(message) {
  const error = new Error(message);
  error.permanent = true;
  return error;
}

/**
 * Runs the authenticity check.
 *
 * @param {{image: {buffer: Buffer, contentType: string, bytes: number, filename: string}, artwork: object}} input
 * @returns {Promise<object>} stage payload (the caller adds `status` and `latencyMs`)
 */
async function run({ image, artwork, runId }) {
  const apiKey = process.env.AIORNOT_API_KEY;

  if (!apiKey) {
    throw permanent("AIORNOT_API_KEY is not set");
  }

  if (!image?.buffer) {
    throw permanent("AIORNOT adapter received no image bytes");
  }

  // Both are permanent: no amount of retrying shrinks the file or changes its type.
  if (image.bytes > AIORNOT_MAX_BYTES) {
    throw permanent(
      `Image is ${image.bytes} bytes, over the AIORNOT 50MB limit`
    );
  }

  if (!SUPPORTED_CONTENT_TYPES.has(image.contentType)) {
    throw permanent(`AIORNOT does not accept ${image.contentType}`);
  }

  const url = new URL(API_URL);
  url.searchParams.set("only", REQUESTED_REPORTS);
  if (runId) url.searchParams.set("external_id", runId);

  const form = new FormData();
  form.append(
    "image",
    new Blob([image.buffer], { type: image.contentType }),
    image.filename ?? "artwork.jpg"
  );

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: AbortSignal.timeout(
      Number(process.env.AIORNOT_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS)
    ),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");

    // 4xx other than 429 means the request itself is wrong; retrying sends the same bad request.
    if (response.status !== 429 && response.status >= 400 && response.status < 500) {
      throw permanent(`AIORNOT rejected the request: ${response.status} ${body.slice(0, 500)}`);
    }

    throw new Error(`AIORNOT returned ${response.status}: ${body.slice(0, 500)}`);
  }

  const parsed = responseSchema.safeParse(await response.json());

  if (!parsed.success) {
    throw new Error(
      `AIORNOT response did not match the expected shape: ${parsed.error.message.slice(0, 500)}`
    );
  }

  const report = parsed.data.report;
  const aiGenerated = report.ai_generated;

  return {
    verdict: aiGenerated.verdict,
    humanConfidence: aiGenerated.human.confidence,
    aiConfidence: aiGenerated.ai.confidence,
    // Which tool the provider thinks made it, for the reviewer and for analytics.
    generators: Object.entries(aiGenerated.generator)
      .filter(([, prediction]) => prediction.is_detected)
      .map(([name]) => name),
    generatorScores: Object.fromEntries(
      Object.entries(aiGenerated.generator).map(([name, prediction]) => [
        name,
        prediction.confidence,
      ])
    ),
    nsfw: report.nsfw
      ? { isDetected: report.nsfw.is_detected, confidence: report.nsfw.confidence ?? null }
      : null,
    // `quality.is_detected` is true for a *high* quality image, so a false here is what the
    // minimum-quality style rule keys off.
    quality: report.quality
      ? { isDetected: report.quality.is_detected, confidence: report.quality.confidence ?? null }
      : null,
    provider: "aiornot",
    providerRequestId: parsed.data.id ?? null,
    artworkId: artwork?.id ?? null,
  };
}

module.exports = { name: "aiornot", responseSchema, run };
