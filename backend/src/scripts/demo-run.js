// Drives the seeded artworks through the real pipeline and prints the outcome as a table.
//
//   node src/scripts/demo-run.js
//
// Needs the worker running (`npm run worker`) and Redis up. It enqueues through BullMQ exactly as
// the upload controller does, then polls the database until every run settles — so what it prints
// is the worker's own work, not a simulation.
//
// Exists because the HTTP surface needs a Firebase ID token, and a standup demo should not hinge on
// getting one. Same services, same queue, same tables — only the transport differs.
// Set before ../config loads, so the pool's per-acquire chatter doesn't bury the table below.
process.env.DB_QUIET = process.env.DB_QUIET ?? "true";

require("dotenv").config({ quiet: true });

const { db } = require("../config");
const { startRun } = require("../modules/screening/services/screening.service");
const queue = require("../queue/screening.queue");

const TIMEOUT_MS = 45_000;
const POLL_MS = 750;

function truncate(value, width) {
  const text = String(value ?? "—");
  return text.length > width ? `${text.slice(0, width - 1)}…` : text.padEnd(width);
}

async function main() {
  // Only the most recent batch, so repeated demo runs don't drag every artwork ever seeded into
  // the table. Defaults to the four that demo-seed creates.
  const limit = Number(process.argv[2] ?? 4);

  const newest = await db
    .selectFrom("artworks")
    .select(["id", "title", "moderation_status"])
    .where("deleted_at", "is", null)
    .orderBy("created_at", "desc")
    .limit(limit)
    .execute();

  const artworks = newest.reverse();

  if (!artworks.length) {
    throw new Error("No artworks to screen. Run: npm run demo:seed");
  }

  console.log(
    `\n${truncate("ARTWORK", 32)}${truncate("DECISION", 16)}${truncate("ARTWORK STATUS", 16)}WHY`
  );
  console.log("-".repeat(110));

  let unsettled = 0;

  // One at a time, waiting for each run to settle. The dedupe short circuit only has something to
  // match against once the artwork sharing its bytes has actually been rejected, so a concurrent
  // sweep would make that row's outcome depend on which worker slot finished first.
  for (const artwork of artworks) {
    const started = await startRun(db, { artworkId: artwork.id, rescreen: true });

    const deadline = Date.now() + TIMEOUT_MS;
    let run;

    do {
      run = await db
        .selectFrom("screening_runs")
        .select(["id", "status", "decision", "decision_reasons"])
        .where("id", "=", started.id)
        .executeTakeFirst();

      if (run && run.status !== "running") break;

      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    } while (Date.now() < deadline);

    const current = await db
      .selectFrom("artworks")
      .select(["moderation_status"])
      .where("id", "=", artwork.id)
      .executeTakeFirst();

    if (!run || run.status === "running") unsettled += 1;

    const reasons = Array.isArray(run?.decision_reasons)
      ? run.decision_reasons.map((r) => r.code).join(" | ")
      : "—";

    console.log(
      truncate(artwork.title, 32) +
        truncate(run?.decision ?? run?.status ?? "no run", 16) +
        truncate(current?.moderation_status, 16) +
        reasons
    );
  }

  if (unsettled) {
    console.log(
      `\n${unsettled} run(s) never settled within ${TIMEOUT_MS / 1000}s — ` +
        "is the worker up? Start it with: npm run worker"
    );
  }

  const pending = await db
    .selectFrom("moderation_queue")
    .select(["id", "entity_type", "entity_id", "status"])
    .where("status", "=", "pending")
    .where(
      "entity_id",
      "in",
      artworks.map((a) => a.id)
    )
    .execute();

  console.log(`\nHuman review queue, this batch: ${pending.length} item(s) pending`);
  for (const item of pending) {
    console.log(`  ${item.id}  ${item.entity_type} ${item.entity_id}`);
  }

  const audits = await db
    .selectFrom("audited_events")
    .select(["action"])
    .orderBy("created_at", "desc")
    .limit(8)
    .execute();

  console.log(`\nAudit trail (latest ${audits.length}): ${audits.map((a) => a.action).join(", ")}\n`);
}

main()
  .catch((error) => {
    console.error("\ndemo-run failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Enqueuing opens a Redis connection that would otherwise keep the process alive forever.
    await queue.close();
    await db.destroy();
  });
