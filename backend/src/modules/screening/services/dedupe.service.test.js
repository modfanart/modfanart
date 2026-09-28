import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import crypto from "node:crypto";

const require = createRequire(import.meta.url);

const { createFakeDb } = require("../__fixtures__/fakeDb.js");
const {
  findRejectedDuplicate,
  hashBuffer,
  recordHash,
} = require("./dedupe.service.js");

const ORIGINAL = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const RESUBMISSION = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const HASH = "a".repeat(64);

function artwork(overrides) {
  return {
    id: ORIGINAL,
    title: "Original",
    creator_id: "user-1",
    file_sha256: HASH,
    moderation_status: "rejected",
    deleted_at: null,
    created_at: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("hashBuffer", () => {
  it("matches a plain sha256 of the same bytes", () => {
    const buffer = Buffer.from("some image bytes");
    expect(hashBuffer(buffer)).toBe(
      crypto.createHash("sha256").update(buffer).digest("hex")
    );
  });

  it("changes when a single byte changes", () => {
    expect(hashBuffer(Buffer.from([1, 2, 3]))).not.toBe(
      hashBuffer(Buffer.from([1, 2, 4]))
    );
  });
});

describe("findRejectedDuplicate", () => {
  it("finds an earlier rejected artwork with the same bytes", async () => {
    const db = createFakeDb({ artworks: [artwork()] });

    const match = await findRejectedDuplicate(db, {
      sha256: HASH,
      excludeArtworkId: RESUBMISSION,
    });

    expect(match?.id).toBe(ORIGINAL);
  });

  it("ignores approved and pending matches — only rejections carry the signal", async () => {
    for (const status of ["approved", "pending", "flagged"]) {
      const db = createFakeDb({ artworks: [artwork({ moderation_status: status })] });

      const match = await findRejectedDuplicate(db, {
        sha256: HASH,
        excludeArtworkId: RESUBMISSION,
      });

      expect(match).toBeNull();
    }
  });

  it("ignores soft-deleted artworks", async () => {
    const db = createFakeDb({
      artworks: [artwork({ deleted_at: new Date("2026-02-01") })],
    });

    const match = await findRejectedDuplicate(db, {
      sha256: HASH,
      excludeArtworkId: RESUBMISSION,
    });

    expect(match).toBeNull();
  });

  it("does not match the artwork being screened, so a rescreen is not its own duplicate", async () => {
    const db = createFakeDb({ artworks: [artwork()] });

    const match = await findRejectedDuplicate(db, {
      sha256: HASH,
      excludeArtworkId: ORIGINAL,
    });

    expect(match).toBeNull();
  });

  it("returns null for a missing hash rather than matching every unhashed row", async () => {
    const db = createFakeDb({ artworks: [artwork({ file_sha256: null })] });

    expect(await findRejectedDuplicate(db, { sha256: null })).toBeNull();
    expect(await findRejectedDuplicate(db, { sha256: "" })).toBeNull();
  });

  it("returns null when nothing shares the hash", async () => {
    const db = createFakeDb({ artworks: [artwork({ file_sha256: "b".repeat(64) })] });

    const match = await findRejectedDuplicate(db, {
      sha256: HASH,
      excludeArtworkId: RESUBMISSION,
    });

    expect(match).toBeNull();
  });
});

describe("recordHash", () => {
  it("writes the hash onto the artwork", async () => {
    const db = createFakeDb({
      artworks: [artwork({ id: RESUBMISSION, file_sha256: null })],
    });

    await recordHash(db, RESUBMISSION, HASH);

    expect(db.rows("artworks")[0].file_sha256).toBe(HASH);
  });

  it("is a no-op for an empty hash", async () => {
    const db = createFakeDb({
      artworks: [artwork({ id: RESUBMISSION, file_sha256: null })],
    });

    expect(await recordHash(db, RESUBMISSION, null)).toBeNull();
    expect(db.rows("artworks")[0].file_sha256).toBeNull();
  });
});
