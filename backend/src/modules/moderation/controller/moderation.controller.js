// The human side of moderation: the review queue, resolving an item, reporting, and metrics.
//
// This replaces an earlier version of this file that could not load at all — it required four
// modules that do not exist (`../utils/logger`, `../models/submission`,
// `../../../config/compliance`, and a `createModeratedSubmission` export), referenced `crypto`
// without importing it, and ended with two `module.exports =` assignments where the second
// discarded the first. The module was never mounted, so none of that surfaced.
//
// Field names on the queue and metrics responses match `frontend/services/api/moderationApi.ts`,
// which already declares these endpoints, so the existing client works without changes.
const { sql } = require("kysely");
const { z } = require("zod");

const ModerationQueue = require("../models/moderation.model");
const ScreeningRun = require("../../screening/models/screeningRun.model");
const { getDb } = require("../../screening/db");
const { applyHumanReview } = require("../../screening/services/transition.service");

const ENTITY_TABLES = { artwork: "artworks", contest_entry: "contest_entries" };

const queueQuerySchema = z.object({
  status: z.enum(["pending", "reviewed", "escalated"]).optional(),
  entity_type: z.string().max(64).optional(),
  brand_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const resolveSchema = z.object({
  decision: z.enum(["approved", "rejected", "escalated"]),
  notes: z.string().max(2000).nullish(),
});

const reportSchema = z.object({
  entity_type: z.string().min(1).max(64),
  entity_id: z.string().min(1).max(128),
  violation_type: z.string().min(1).max(64),
  description: z.string().max(2000).optional(),
});

function validationError(res, error) {
  return res.status(400).json({
    error: "Invalid request",
    details: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  });
}

class ModerationController {
  /**
   * GET /api/moderation/queue
   *
   * Returns a bare array, as `moderationApi.ts` expects. Each item is enriched with the screening
   * run that flagged it, so a reviewer sees *why* it is here without a second request — the
   * queue is useless if every row needs a follow-up call to be intelligible.
   */
  static async getQueue(req, res) {
    try {
      const parsed = queueQuerySchema.safeParse(req.query);

      if (!parsed.success) return validationError(res, parsed.error);

      const db = getDb();
      const { status, entity_type: entityType, brandId, limit, offset } = {
        ...parsed.data,
        brandId: parsed.data.brand_id,
      };

      let query = db
        .selectFrom("moderation_queue")
        .leftJoin(
          "screening_runs",
          "screening_runs.id",
          "moderation_queue.screening_run_id"
        )
        .select([
          "moderation_queue.id as id",
          "moderation_queue.entity_type as entity_type",
          "moderation_queue.entity_id as entity_id",
          "moderation_queue.status as status",
          "moderation_queue.priority as priority",
          "moderation_queue.assigned_to as assigned_to",
          "moderation_queue.reviewed_by as reviewed_by",
          "moderation_queue.reviewed_at as reviewed_at",
          "moderation_queue.decision as decision",
          "moderation_queue.notes as notes",
          "moderation_queue.created_at as created_at",
          "moderation_queue.updated_at as updated_at",
          "moderation_queue.screening_run_id as screening_run_id",
          "moderation_queue.rule_matches as rule_matches",
          "screening_runs.decision as screening_decision",
          "screening_runs.aiornot as aiornot",
          "screening_runs.moderation as moderation",
          "screening_runs.style as style",
        ])
        .orderBy("moderation_queue.priority", "desc")
        .orderBy("moderation_queue.created_at", "asc")
        .limit(limit)
        .offset(offset);

      query = query.where(
        "moderation_queue.status",
        "=",
        status ?? "pending"
      );

      if (entityType) {
        query = query.where("moderation_queue.entity_type", "=", entityType);
      }

      if (brandId) {
        // Brand scope runs through the contest that owns the entry, the only link between a queued
        // item and a brand. Raw SQL because `moderation_queue.entity_id` is `text` while
        // `contest_entries.id` is `uuid`: Postgres has no `uuid = text` operator, so the join needs
        // an explicit cast that the query builder will not add for us.
        query = query.where(
          sql`EXISTS (
            SELECT 1
            FROM contest_entries ce
            JOIN contests c ON c.id = ce.contest_id
            WHERE ce.id::text = moderation_queue.entity_id
              AND c.brand_id = ${brandId}
          )`
        );
      }

      return res.json(await query.execute());
    } catch (error) {
      console.error("Moderation queue fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch the moderation queue" });
    }
  }

  /**
   * POST /api/moderation/queue/:id/resolve
   *
   * Delegates to the transition service so a human override lands in `audited_events` exactly like
   * an automated decision. This controller does not write moderation state itself.
   */
  static async resolveQueueItem(req, res) {
    try {
      const parsed = resolveSchema.safeParse(req.body);

      if (!parsed.success) return validationError(res, parsed.error);

      const result = await applyHumanReview(getDb(), {
        queueItemId: req.params.id,
        reviewerId: req.user.id,
        decision: parsed.data.decision,
        notes: parsed.data.notes ?? null,
      });

      return res.json({
        success: true,
        message: `Item ${parsed.data.decision}`,
        moderation_status: result.moderationStatus,
        queue_item: result.queueItem,
      });
    } catch (error) {
      // The transition service attaches an HTTP status to the cases a client can act on
      // (404 missing, 409 already reviewed or illegal transition, 422 unsupported entity).
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }

      console.error("Moderation resolve error:", error);
      return res.status(500).json({ error: "Failed to resolve the item" });
    }
  }

  /**
   * POST /api/moderation/submit
   *
   * A user reporting content. Distinct from screening: this is the path
   * `moderationApi.ts#submitModerationReport` already calls, and it must stay that way.
   */
  static async submitReport(req, res) {
    try {
      const parsed = reportSchema.safeParse(req.body);

      if (!parsed.success) return validationError(res, parsed.error);

      const db = getDb();
      const { entity_type: entityType, entity_id: entityId, violation_type: violationType, description } =
        parsed.data;

      const item = await ModerationQueue.enqueueReport(db, {
        entityType,
        entityId,
        violationType,
        description: description ?? null,
        reporterId: req.user.id,
      });

      return res.status(201).json({
        success: true,
        moderation_queue_id: item.id,
        message: "Report submitted for review",
      });
    } catch (error) {
      console.error("Moderation report error:", error);
      return res.status(500).json({ error: "Failed to submit the report" });
    }
  }

  /**
   * GET /api/moderation/metrics
   *
   * Computed on read from `moderation_queue` and `screening_runs`. There is deliberately no stats
   * table: at this volume a few GROUP BYs are cheaper than keeping a denormalised counter honest.
   */
  static async getMetrics(req, res) {
    try {
      const db = getDb();

      const [byStatus, byEntityType, resolution, decisions, runStatuses] =
        await Promise.all([
          db
            .selectFrom("moderation_queue")
            .select(["status", (eb) => eb.fn.countAll().as("count")])
            .groupBy("status")
            .execute(),
          db
            .selectFrom("moderation_queue")
            .select(["entity_type", (eb) => eb.fn.countAll().as("count")])
            .groupBy("entity_type")
            .execute(),
          // Raw SQL: averaging a timestamp difference yields an `interval`, which pg hands back as
          // an object of date parts. Reducing it to days in SQL keeps the arithmetic in one place.
          db
            .selectFrom("moderation_queue")
            .select(
              sql`AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at)) / 86400)`.as(
                "avg_days"
              )
            )
            .where("reviewed_at", "is not", null)
            .executeTakeFirst(),
          ScreeningRun.decisionCounts(db),
          ScreeningRun.statusCounts(db),
        ]);

      const countsByStatus = Object.fromEntries(
        byStatus.map((row) => [row.status, Number(row.count)])
      );

      const total = Object.values(countsByStatus).reduce((a, b) => a + b, 0);

      return res.json({
        // The shape ModerationMetrics in moderationApi.ts declares.
        total_reports: total,
        pending_reports: countsByStatus.pending ?? 0,
        resolved_reports: countsByStatus.reviewed ?? 0,
        rejected_reports: countsByStatus.rejected ?? 0,
        reports_by_entity_type: Object.fromEntries(
          byEntityType.map((row) => [row.entity_type, Number(row.count)])
        ),
        reports_by_status: countsByStatus,
        average_resolution_time_days: toDays(resolution?.avg_days),

        // Screening additions, on top of the declared contract.
        screening: {
          decisions: Object.fromEntries(
            decisions
              .filter((row) => row.decision)
              .map((row) => [row.decision, Number(row.count)])
          ),
          run_statuses: Object.fromEntries(
            runStatuses.map((row) => [row.status, Number(row.count)])
          ),
        },
      });
    } catch (error) {
      console.error("Moderation metrics error:", error);
      return res.status(500).json({ error: "Failed to compute moderation metrics" });
    }
  }
}

/**
 * pg returns `numeric` as a string to avoid precision loss, so AVG() arrives as text. Returns
 * undefined when nothing has been reviewed yet, which the client renders as "no data" rather than
 * a misleading zero.
 */
function toDays(value) {
  if (value === null || value === undefined) return undefined;

  const days = Number(value);

  return Number.isFinite(days) ? Number(days.toFixed(2)) : undefined;
}

module.exports = ModerationController;
module.exports.ENTITY_TABLES = ENTITY_TABLES;
module.exports.toDays = toDays;
