// Vitest is scoped to code added by the AI screening pipeline. The pre-existing suites in
// `tests/` are written against `node:test`, which vitest cannot execute — they run via
// `npm run test:node`. Widening `include` will break `npm test`.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "src/modules/screening/**/*.test.js",
      "src/modules/moderation/**/*.test.js",
      "src/queue/**/*.test.js",
      "src/migrations/**/*.test.js",
      "src/scripts/migration-provider.test.js",
    ],
    environment: "node",
    pool: "threads",
  },
});
