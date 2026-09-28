// BullMQ wiring for the screening pipeline.
//
// This file is the only place that knows about Redis and BullMQ. The work itself lives in
// screening.service.js, which is why that module can be tested without either.
//
// Producer and consumer are separate exports on purpose: the API process should create a Queue
// (cheap, one connection) and never a Worker, while `worker.js` creates both.
const { Queue, Worker } = require("bullmq");
const IORedis = require("ioredis");

const QUEUE_NAME = "screening";
const JOB_NAME = "screen-artwork";

const MAX_ATTEMPTS = 5;

/** Shared job options. `jobId` is set per-enqueue to the run id. */
const DEFAULT_JOB_OPTIONS = {
  attempts: MAX_ATTEMPTS,
  backoff: { type: "exponential", delay: 5000 },
  // Keep a window of history for debugging without letting Redis grow without bound.
  removeOnComplete: { age: 24 * 3600, count: 1000 },
  // Failures are the interesting ones, so they are kept longer.
  removeOnFail: { age: 7 * 24 * 3600 },
};

let cachedConnection = null;
let cachedQueue = null;

function redisUrl() {
  return process.env.REDIS_URL || "redis://127.0.0.1:6379";
}

/**
 * BullMQ requires `maxRetriesPerRequest: null` on the connection it blocks on, otherwise a brief
 * Redis outage makes the blocking read throw instead of reconnecting.
 */
function createConnection() {
  return new IORedis(redisUrl(), { maxRetriesPerRequest: null });
}

function connection() {
  if (!cachedConnection) cachedConnection = createConnection();
  return cachedConnection;
}

function getQueue() {
  if (!cachedQueue) {
    cachedQueue = new Queue(QUEUE_NAME, { connection: connection() });
  }
  return cachedQueue;
}

/**
 * Enqueues a screening job.
 *
 * `jobId` is the run id, which makes the enqueue idempotent: a controller retried by a client, or
 * a double-submitted form, cannot produce two jobs for one run. BullMQ silently ignores a
 * duplicate id, which is the behaviour we want.
 */
async function enqueueScreening({ runId, artworkId, contestEntryId = null }) {
  return getQueue().add(
    JOB_NAME,
    { runId, artworkId, contestEntryId },
    { ...DEFAULT_JOB_OPTIONS, jobId: runId }
  );
}

/**
 * Starts the consumer. Called only by worker.js.
 *
 * @param {object} deps
 * @param {import('kysely').Kysely<any>} deps.db
 * @param {object} deps.service the screening service (injectable for tests)
 * @param {number} [deps.concurrency]
 */
function startWorker({ db, service, concurrency, onDecision }) {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      // The processor needs to know whether it can still ask for a retry. On the final attempt it
      // records the failed stages as `unavailable` instead, so the submission reaches a human
      // rather than being silently dropped.
      const isFinalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? MAX_ATTEMPTS);

      try {
        return await service.processScreeningRun(
          db,
          { runId: job.data.runId, isFinalAttempt },
          { onDecision }
        );
      } catch (error) {
        // A permanent error (missing run, missing artwork, no adapter) cannot be fixed by waiting.
        // Discarding stops it from burning four more attempts and an hour of backoff.
        if (error.permanent) {
          await service.failRun(db, job.data.runId, error.message);
          job.discard();
        }
        throw error;
      }
    },
    {
      connection: createConnection(),
      concurrency: concurrency ?? Number(process.env.SCREENING_CONCURRENCY ?? 4),
    }
  );

  worker.on("failed", async (job, error) => {
    if (!job) return;

    const attempts = job.opts.attempts ?? MAX_ATTEMPTS;
    console.error(
      `[screening] job ${job.id} failed on attempt ${job.attemptsMade}/${attempts}: ${error.message}`
    );

    // Dead letter. BullMQ keeps the job in its failed set; this records the same fact in the
    // database so the run does not sit in `running` forever and shows up in /metrics.
    if (job.attemptsMade >= attempts) {
      try {
        await service.failRun(db, job.data.runId, error.message);
      } catch (recordError) {
        console.error(
          `[screening] could not mark run ${job.data.runId} failed: ${recordError.message}`
        );
      }
    }
  });

  worker.on("error", (error) => {
    console.error("[screening] worker error:", error.message);
  });

  return worker;
}

async function close() {
  if (cachedQueue) {
    await cachedQueue.close();
    cachedQueue = null;
  }
  if (cachedConnection) {
    await cachedConnection.quit();
    cachedConnection = null;
  }
}

module.exports = {
  DEFAULT_JOB_OPTIONS,
  JOB_NAME,
  MAX_ATTEMPTS,
  QUEUE_NAME,
  close,
  createConnection,
  enqueueScreening,
  getQueue,
  startWorker,
};
