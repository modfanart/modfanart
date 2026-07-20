// Guards the server-side avatar limits added alongside the CDN upload fix.
// The route previously used bare memoryStorage with no size cap and no type
// filter, so validation existed only in the browser.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const express = require("express");

// upload.js reads TEMP_UPLOAD_DIR at module load, so it must be set first.
const TEMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "avatar-test-"));
process.env.TEMP_UPLOAD_DIR = TEMP_DIR;

const { singleAvatarUpload } = require("../src/common/middleware/upload");
const errorHandler = require("../src/common/middleware/error");

const app = express();
app.post("/me/avatar", singleAvatarUpload("avatar"), (req, res) =>
  res.json({ filename: req.file.filename })
);
app.use(errorHandler);

const listening = app.listen(0);
const url = () => `http://127.0.0.1:${listening.address().port}/me/avatar`;

async function upload(bytes, type, filename) {
  const body = new FormData();
  body.append("avatar", new Blob([Buffer.alloc(bytes)], { type }), filename);
  const res = await fetch(url(), { method: "POST", body });
  return { status: res.status, json: await res.json() };
}

test.after(() => {
  listening.close();
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
});

test("accepts an image within the size cap", async () => {
  const { status, json } = await upload(1024, "image/png", "avatar.png");

  assert.strictEqual(status, 200);
  assert.match(json.filename, /\.png$/);
});

test("rejects a file over the 2MB cap as a client error", async () => {
  const { status, json } = await upload(3 * 1024 * 1024, "image/png", "big.png");

  assert.strictEqual(status, 400, "oversized upload must not surface as a 500");
  assert.match(json.error, /too large/i);
});

test("rejects types outside the image allowlist", async () => {
  for (const [type, name] of [
    ["application/pdf", "doc.pdf"],
    // Allowed by the general media upload, must not be allowed for avatars.
    ["video/mp4", "clip.mp4"],
  ]) {
    const { status, json } = await upload(512, type, name);

    assert.strictEqual(status, 400, `${type} should be rejected`);
    assert.match(json.error, /invalid file type/i);
  }
});
