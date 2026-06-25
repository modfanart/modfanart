module.exports = {
  provider: process.env.CDN_PROVIDER || "local", // local | s3

  s3: {
    accessKeyId: process.env.CDN_ACCESS_KEY,
    secretAccessKey: process.env.CDN_SECRET_KEY,
    region: process.env.CDN_REGION,
    bucket: process.env.CDN_BUCKET,
  },

  baseUrl:
    process.env.CDN_BASE_URL || "https://media.modfanofficial.com/storage",
};