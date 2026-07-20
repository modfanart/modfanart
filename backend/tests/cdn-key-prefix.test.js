// Guards the key handling that lets avatars live outside the artworks prefix.
// deleteFile previously rebuilt the key from the default prefix, which would
// have deleted the wrong key (or nothing) for any object stored elsewhere.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

process.env.AWS_REGION = "us-east-1";
process.env.S3_BUCKET_NAME = "test-bucket";

const CDNFileService = require("../src/modules/cdn/services/cdn-file.service");

const CDN_BASE_URL = "https://test-bucket.s3.us-east-1.amazonaws.com";

test("derives the stored key from the URL, whatever the prefix", () => {
  const service = new CDNFileService({});

  assert.strictEqual(
    service.keyFromUrl(`${CDN_BASE_URL}/avatars/abc.png`),
    "avatars/abc.png"
  );
  assert.strictEqual(
    service.keyFromUrl(`${CDN_BASE_URL}/artworks/xyz.jpg`),
    "artworks/xyz.jpg"
  );
});

test("returns null for URLs outside the CDN so callers can fall back", () => {
  const service = new CDNFileService({});

  // Avatars set directly via admin PATCH /users/:id are arbitrary URLs.
  assert.strictEqual(service.keyFromUrl("https://elsewhere.example/x.png"), null);
  assert.strictEqual(service.keyFromUrl(undefined), null);
});

test("createFileRecord stores the file under the prefix it is given", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cdn-test-"));
  const filePath = path.join(tmp, "abc.png");
  fs.writeFileSync(filePath, Buffer.alloc(8));

  const uploaded = [];
  class StubbedService extends CDNFileService {
    // Override the S3 call; this test covers key routing, not the AWS client.
    async uploadToCDN(localFilePath, remoteFilename, mimeType, keyPrefix) {
      uploaded.push({ remoteFilename, keyPrefix });
      return `${CDN_BASE_URL}/${keyPrefix}/${remoteFilename}`;
    }
  }

  const service = new StubbedService({ create: async (record) => record });
  const record = await service.createFileRecord(
    {
      filename: "abc.png",
      path: filePath,
      originalname: "photo.png",
      mimetype: "image/png",
      size: 8,
    },
    "user-1",
    "avatars"
  );

  assert.deepStrictEqual(uploaded, [
    { remoteFilename: "abc.png", keyPrefix: "avatars" },
  ]);
  assert.strictEqual(record.url, `${CDN_BASE_URL}/avatars/abc.png`);
  assert.strictEqual(fs.existsSync(filePath), false, "temp file should be cleaned up");

  fs.rmSync(tmp, { recursive: true, force: true });
});
