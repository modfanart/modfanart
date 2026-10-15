// HTTP surface for screening resources: runs, rulesets, style guides.
//
// Response shape follows the existing loose house style — `{ success, message, ...payload }` on
// writes, bare objects and arrays on reads — rather than introducing a new envelope halfway
// through the codebase.
const { z } = require("zod");

const CDNFileService = require("../../cdn/services/cdn-file.service");
const cdnFileModel = require("../../cdn/models/cdn-file.model");
const Ruleset = require("../models/ruleset.model");
const ScreeningRun = require("../models/screeningRun.model");
const StyleGuide = require("../models/styleGuide.model");
const { getDb } = require("../db");
const { belongsToBrand, can } = require("../screening.permissions");
const { parseStyleGuide } = require("../services/styleGuide.service");
const {
  publishRulesetVersion,
  resolveRuleset,
  safeNormalizeRulesetConfig,
} = require("../services/ruleset.service");
const { startRun } = require("../services/screening.service");

const uuid = z.string().uuid();

const rescreenSchema = z.object({
  artworkId: uuid,
  contestEntryId: uuid.nullish(),
});

const rulesetSchema = z.object({
  brand_id: uuid.nullish(),
  config: z.record(z.string(), z.unknown()),
});

const styleGuideSchema = z.object({
  brand_id: uuid,
  source_text: z.string().min(1).max(200000).optional(),
});

/** Turns a zod failure into the flat 400 the rest of the API returns. */
function validationError(res, error) {
  return res.status(400).json({
    error: "Invalid request",
    details: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  });
}

class ScreeningController {
  /**
   * GET /api/screening/runs/:artworkId
   *
   * Full screening history, newest first. Stage blobs are returned as stored: a reviewer needs the
   * raw provider output to judge a borderline call, and hiding it would make the verdict
   * unauditable.
   */
  static async getRunsForArtwork(req, res) {
    try {
      const db = getDb();
      const artworkId = uuid.safeParse(req.params.artworkId);

      if (!artworkId.success) {
        return res.status(400).json({ error: "Invalid artwork id" });
      }

      const runs = await ScreeningRun.listForArtwork(db, artworkId.data);

      return res.json({ artwork_id: artworkId.data, runs });
    } catch (error) {
      console.error("Screening runs fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch screening runs" });
    }
  }

  /**
   * POST /api/screening/runs
   *
   * Manual (re)screen. This is the recovery path for a run that never got enqueued, a run that
   * dead-lettered, and for re-judging an artwork after a brand changes its thresholds.
   */
  static async createRun(req, res) {
    try {
      const parsed = rescreenSchema.safeParse(req.body);

      if (!parsed.success) return validationError(res, parsed.error);

      const db = getDb();
      const { artworkId, contestEntryId } = parsed.data;

      const artwork = await db
        .selectFrom("artworks")
        .select(["id", "creator_id", "moderation_status"])
        .where("id", "=", artworkId)
        .executeTakeFirst();

      if (!artwork) {
        return res.status(404).json({ error: "Artwork not found" });
      }

      const run = await startRun(db, {
        artworkId,
        contestEntryId: contestEntryId ?? null,
        actorId: req.user.id,
        // A resubmission for screening must reset a settled verdict, otherwise the new decision
        // would be an illegal approved -> approved transition.
        rescreen: true,
      });

      return res.status(202).json({
        success: true,
        message: "Screening queued",
        run,
      });
    } catch (error) {
      console.error("Screening run create error:", error);
      return res.status(500).json({ error: "Failed to queue screening" });
    }
  }

  /**
   * GET /api/screening/rulesets
   *
   * `?brand_id=` returns that brand's versions; without it, the platform defaults. Also reports
   * which ruleset would actually be used, since the answer for a brand with no rulesets of its own
   * is the platform default.
   */
  static async listRulesets(req, res) {
    try {
      const db = getDb();
      const brandId = req.query.brand_id ?? null;

      if (brandId && !uuid.safeParse(brandId).success) {
        return res.status(400).json({ error: "Invalid brand id" });
      }

      const [versions, effective] = await Promise.all([
        Ruleset.listForBrand(db, brandId),
        resolveRuleset(db, { brandId }),
      ]);

      return res.json({
        brand_id: brandId,
        effective_ruleset: effective,
        versions,
      });
    } catch (error) {
      console.error("Ruleset list error:", error);
      return res.status(500).json({ error: "Failed to fetch rulesets" });
    }
  }

  /**
   * POST /api/screening/rulesets
   *
   * Publishes a new immutable version. Never updates an existing row: a stored run points at the
   * exact version it was judged under, and mutating that would rewrite history.
   */
  static async createRuleset(req, res) {
    try {
      const parsed = rulesetSchema.safeParse(req.body);

      if (!parsed.success) return validationError(res, parsed.error);

      const brandId = parsed.data.brand_id ?? null;

      // Only a platform administrator may move the platform default. The route guard already
      // allows a brand user through when they name their own brand, so this closes the case where
      // they name none.
      if (!brandId && !can(req.user, "screening.manage")) {
        return res
          .status(403)
          .json({ error: "Only an administrator can change the platform default ruleset" });
      }

      const configCheck = safeNormalizeRulesetConfig(parsed.data.config);

      if (!configCheck.success) return validationError(res, configCheck.error);

      const db = getDb();
      const ruleset = await publishRulesetVersion(db, {
        brandId,
        config: parsed.data.config,
        createdBy: req.user.id,
      });

      return res.status(201).json({
        success: true,
        message: `Ruleset version ${ruleset.version} published`,
        ruleset,
      });
    } catch (error) {
      console.error("Ruleset create error:", error);
      return res.status(500).json({ error: "Failed to publish ruleset" });
    }
  }

  /**
   * POST /api/screening/style-guides
   *
   * Accepts either a multipart file (field `file`, via the shared singleUpload middleware) or
   * inline `source_text`. The guide is compiled to `parsed_rules` + `prompt_block` immediately,
   * once, so the per-artwork path never re-reads the document.
   */
  static async createStyleGuide(req, res) {
    try {
      const parsed = styleGuideSchema.safeParse(req.body);

      if (!parsed.success) return validationError(res, parsed.error);

      if (!req.file && !parsed.data.source_text) {
        return res
          .status(400)
          .json({ error: "Provide either a file upload or source_text" });
      }

      const db = getDb();
      const { brand_id: brandId, source_text: sourceText } = parsed.data;

      let sourceFileUrl = null;

      if (req.file) {
        const cdnService = new CDNFileService(cdnFileModel);
        const record = await cdnService.createFileRecord(
          req.file,
          req.user.id,
          "style-guides"
        );
        sourceFileUrl = record.url;
      }

      const guide = await StyleGuide.create(db, {
        brandId,
        sourceFileUrl,
        sourceText: sourceText ?? null,
        createdBy: req.user.id,
      });

      // Compiled inline rather than queued: the brand is waiting on the answer, and a failure is
      // recorded on the row instead of thrown, so this cannot fail the request.
      const compiled = await parseStyleGuide(db, guide.id);

      return res.status(201).json({
        success: true,
        message:
          compiled.parse_status === "parsed"
            ? "Style guide uploaded and compiled"
            : "Style guide uploaded, but could not be compiled",
        style_guide: compiled,
      });
    } catch (error) {
      console.error("Style guide create error:", error);
      return res.status(500).json({ error: "Failed to create style guide" });
    }
  }

  /** GET /api/screening/style-guides?brand_id= */
  static async listStyleGuides(req, res) {
    try {
      const brandId = req.query.brand_id;

      if (!uuid.safeParse(brandId).success) {
        return res.status(400).json({ error: "A valid brand_id is required" });
      }

      if (!can(req.user, "screening.manage") && !belongsToBrand(req.user, brandId)) {
        return res.status(403).json({ error: "You do not manage this brand" });
      }

      const guides = await StyleGuide.listForBrand(getDb(), brandId);

      return res.json({ brand_id: brandId, style_guides: guides });
    } catch (error) {
      console.error("Style guide list error:", error);
      return res.status(500).json({ error: "Failed to fetch style guides" });
    }
  }
}

module.exports = ScreeningController;
