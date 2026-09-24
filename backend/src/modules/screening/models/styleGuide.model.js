// src/modules/screening/models/styleGuide.model.js
const { sql } = require("kysely");

class StyleGuide {
  static table = "style_guides";

  static async create(
    db,
    { brandId, sourceFileUrl = null, sourceText = null, createdBy = null }
  ) {
    return db
      .insertInto("style_guides")
      .values({
        brand_id: brandId,
        source_file_url: sourceFileUrl,
        source_text: sourceText,
        parse_status: "pending",
        created_by: createdBy,
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async findById(db, id) {
    return db
      .selectFrom("style_guides")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  /**
   * The guide the style stage should use for a brand: the newest one that parsed successfully.
   * A pending or failed parse is deliberately invisible here — screening against a half-parsed
   * guide would produce violations the brand never actually asked for.
   */
  static async findActiveForBrand(db, brandId) {
    return db
      .selectFrom("style_guides")
      .selectAll()
      .where("brand_id", "=", brandId)
      .where("parse_status", "=", "parsed")
      .orderBy("created_at", "desc")
      .limit(1)
      .executeTakeFirst();
  }

  static async listForBrand(db, brandId) {
    return db
      .selectFrom("style_guides")
      .selectAll()
      .where("brand_id", "=", brandId)
      .orderBy("created_at", "desc")
      .execute();
  }

  static async saveParsedResult(db, id, { parsedRules, promptBlock }) {
    return db
      .updateTable("style_guides")
      .set({
        parsed_rules: JSON.stringify(parsedRules),
        prompt_block: promptBlock,
        parse_status: "parsed",
        parse_error: null,
        updated_at: sql`NOW()`,
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  static async markParseFailed(db, id, message) {
    return db
      .updateTable("style_guides")
      .set({
        parse_status: "failed",
        parse_error: message ? String(message).slice(0, 2000) : null,
        updated_at: sql`NOW()`,
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }
}

module.exports = StyleGuide;
