// Covers the AWS-SDK client layer that cdn-key-prefix.test.js deliberately
// stubs out. Storage moved from AWS to Cloudflare R2, which is reached through
// the same @aws-sdk/client-s3 by pointing S3_ENDPOINT at it. Two things only
// show up on the wire, so neither unit tests nor type-checking catch them:
//
//   1. R2 rejects virtual-hosted addressing, so requests must be path-style
//      (/<bucket>/<key>, not <bucket>.<host>/<key>). That hangs off
//      forcePathStyle being tied to S3_ENDPOINT being set at all.
//   2. The key an upload writes must be the key a delete removes. Avatars live
//      outside the default artworks prefix, so a mismatch silently orphans or
//      deletes the wrong object.
//
// A local HTTP server stands in for the endpoint: the real client builds and
// sends real requests, we assert on what arrives. Signatures are not verified,
// so this proves request shape, not R2 credentials or bucket policy.
const { test, before, after } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const BUCKET = "test-bucket";
const CDN_BASE_URL = "https://media.example.test/storage";

let server;
let service;
const requests = [];

before(async () => {
  server = http.createServer((req, res) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      requests.push({
        method: req.method,
        // The SDK appends ?x-id=PutObject; the pathname identifies the object.
        pathname: req.url.split("?")[0],
        contentType: req.headers["content-type"],
        bytes: Buffer.concat(chunks).length,
      });
      res.writeHead(200, { ETag: '"stub"' });
      res.end();
    });
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  // Must precede the require below; the service reads env at module load.
  process.env.S3_ENDPOINT = `http://127.0.0.1:${server.address().port}`;
  process.env.S3_BUCKET_NAME = BUCKET;
  process.env.AWS_REGION = "auto"; // R2's convention
  process.env.CDN_BASE_URL = CDN_BASE_URL;
  // The stub does not check signatures, but the SDK refuses to sign without these.
  process.env.AWS_ACCESS_KEY_ID = "stub-key";
  process.env.AWS_SECRET_ACCESS_KEY = "stub-secret";

  const CDNFileService = require("../src/modules/cdn/services/cdn-file.service");

  const rows = new Map();
  let nextId = 1;
  service = new CDNFileService({
    create: async (record) => {
      const row = { id: nextId++, ...record };
      rows.set(row.id, row);
      return row;
    },
    findById: async (id) => rows.get(id) ?? null,
    delete: async (id) => rows.delete(id),
  });
});

after(() => server?.close());

function tempUpload(name) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cdn-r2-"));
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, Buffer.alloc(8));
  return {
    filename: name,
    path: filePath,
    originalname: name,
    mimetype: "image/png",
    size: 8,
  };
}

test("addresses the endpoint path-style, which R2 requires", async () => {
  requests.length = 0;

  const record = await service.createFileRecord(tempUpload("avatar.png"), "user-1", "avatars");

  assert.strictEqual(requests.length, 1);
  const [put] = requests;
  assert.strictEqual(put.method, "PUT");
  // Path-style: the bucket is the first path segment. Virtual-hosted addressing
  // would put it in the host instead and R2 would reject the request.
  assert.strictEqual(put.pathname, `/${BUCKET}/avatars/avatar.png`);
  assert.strictEqual(put.contentType, "image/png");
  assert.strictEqual(put.bytes, 8);

  // The stored URL is built from CDN_BASE_URL, not the endpoint.
  assert.strictEqual(record.url, `${CDN_BASE_URL}/avatars/avatar.png`);
});

test("deletes the key the stored URL points at, not the default prefix", async () => {
  requests.length = 0;

  const record = await service.createFileRecord(tempUpload("stale.png"), "user-1", "avatars");
  await service.deleteFile(record.id);

  const del = requests.find((r) => r.method === "DELETE");
  assert.ok(del, "expected a DELETE to reach the endpoint");
  // Rebuilding from the default prefix would have produced /artworks/stale.png
  // and left the real object behind.
  assert.strictEqual(del.pathname, `/${BUCKET}/avatars/stale.png`);
});

test("leaves artwork uploads on the default prefix", async () => {
  requests.length = 0;

  const record = await service.createFileRecord(tempUpload("piece.png"), "user-1");

  assert.strictEqual(requests[0].pathname, `/${BUCKET}/artworks/piece.png`);
  assert.strictEqual(record.url, `${CDN_BASE_URL}/artworks/piece.png`);
});
