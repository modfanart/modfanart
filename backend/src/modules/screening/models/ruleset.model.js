// src/modules/screening/models/ruleset.model.js
//
// Every method takes the Kysely instance as its first argument rather than importing the
// singleton, so the services above can be unit-tested against a fake. See ../db.js.
const { sql } = require("kysely");

class Ruleset {
  static table = "rulesets";

  static async findById(db, id) {
    return db
      .selectFrom("rulesets")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  static async findLatestForBrand(db, brandId) {
    return db
      .selectFrom("rulesets")
      .selectAll()
      .where("brand_id", "=", brandId)
      .orderBy("version", "desc")
      .limit(1)
      .executeTakeFirst();
  }

  static async findLatestPlatformDefault(db) {
    return db
      .selectFrom("rulesets")
      .selectAll()
      .where("brand_id", "is", null)
      .orderBy("version", "desc")
      .limit(1)
      .executeTakeFirst();
  }

  static async listForBrand(db, brandId) {
    return db
      .selectFrom("rulesets")
      .selectAll()
      .where((eb) =>
        brandId
          ? eb("brand_id", "=", brandId)
          : eb("brand_id", "is", null)
      )
      .orderBy("version", "desc")
      .execute();
  }

  /**
   * Inserts a new version. Never updates `config` on an existing row — the immutability is the
   * whole point, since a stored run references the exact version it was judged under.
   */
  static async insertVersion(db, { brandId, version, config, createdBy = null }) {
    return db
      .insertInto("rulesets")
      .values({
        brand_id: brandId,
        version,
        config: JSON.stringify(config),
        created_by: createdBy,
        created_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }
}

module.exports = Ruleset;
