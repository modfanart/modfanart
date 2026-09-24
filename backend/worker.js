// Screening worker entrypoint. Same image as the API, different command:
//   node worker.js
//
// Kept out of the API process on purpose. Stage calls take seconds and are retried with backoff;
// running them in a request handler would tie up the web process and make an upload's latency
// depend on a third-party provider.
require("dotenv").config();

const { db } = require("./src/config");
const screeningService = require("./src/modules/screening/services/screening.service");
const { notifyDecision } = require("./src/modules/screening/services/notification.service");
const queue = require("./src/queue/screening.queue");

const usingMockAdapters =
  (process.env.SCREENING_ADAPTERS ?? "").toLowerCase() === "mock";

// Fail at boot, not on the first job. A worker that starts without credentials would accept jobs,
// fail every stage, and quietly route a day's submissions to manual review.
if (!usingMockAdapters) {
  const missing = ["AIORNOT_API_KEY", "OPENAI_API_KEY"].filter((key) => !process.env[key]);

  if (missing.length) {
    console.error(
      `[screening] refusing to start without: ${missing.join(", ")}. ` +
        "Set them, or set SCREENING_ADAPTERS=mock for local development."
    );
    process.exit(1);
  }
}

const worker = queue.startWorker({
  db,
  service: screeningService,
  onDecision: (event) => notifyDecision(db, event),
});

console.log(
  `🛡️  Screening worker listening on "${queue.QUEUE_NAME}" ` +
    `(adapters: ${usingMockAdapters ? "mock" : "live"})`
);

async function shutdown(signal) {
  console.log(`[screening] ${signal} received, finishing in-flight jobs...`);

  try {
    // Lets the current jobs finish so their stage results are persisted; an abrupt exit would
    // mean re-billing those stages on redelivery.
    await worker.close();
    await queue.close();
    await db.destroy();
  } catch (error) {
    console.error("[screening] error during shutdown:", error.message);
  } finally {
    process.exit(0);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("[screening] unhandled rejection:", reason);
});
