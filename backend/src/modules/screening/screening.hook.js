// The seam between the request path and the pipeline.
//
// Controllers call this and nothing else. It is deliberately failure-tolerant: by the time it runs
// the artwork is already stored, and its `moderation_status` is `pending`, which keeps it out of
// the public gallery. Failing the upload because Redis blinked would lose the artist's work for no
// safety benefit — a run that never got enqueued is recoverable through POST /api/screening/runs.
const { getDb } = require("./db");
const { startRun } = require("./services/screening.service");

/**
 * Starts screening for a freshly created artwork or contest entry.
 *
 * @returns {Promise<object|null>} the run, or null when it could not be started
 */
async function triggerScreening({
  artworkId,
  contestEntryId = null,
  actorId = null,
  rescreen = false,
}) {
  try {
    return await startRun(getDb(), { artworkId, contestEntryId, actorId, rescreen });
  } catch (error) {
    console.error(
      `[screening] could not start a run for artwork ${artworkId}` +
        (contestEntryId ? ` (entry ${contestEntryId})` : "") +
        `: ${error.message}`
    );
    return null;
  }
}

module.exports = { triggerScreening };
