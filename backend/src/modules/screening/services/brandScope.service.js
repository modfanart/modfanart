// Which brands a piece of screened work belongs to.
//
// Brand members review and configure screening for their own brand only, so every brand-facing
// route needs the same answer to "whose is this?". A contest entry belongs to the brand running the
// contest; a standalone artwork belongs to any brand that has it on its storefront. Kept in one
// place so the queue filter, the resolve check and the run history check cannot drift apart.
const { sql } = require("kysely");

/** Brands that can act on an artwork: through a contest it was entered in, or its storefront. */
async function brandIdsForArtwork(db, artworkId) {
  const [viaContests, viaStorefront] = await Promise.all([
    db
      .selectFrom("contest_entries")
      .innerJoin("contests", "contests.id", "contest_entries.contest_id")
      .select(["contests.brand_id as brand_id"])
      .where("contest_entries.artwork_id", "=", artworkId)
      .execute(),
    db
      .selectFrom("brand_artworks")
      .select(["brand_id"])
      .where("artwork_id", "=", artworkId)
      .execute(),
  ]);

  return unique([...viaContests, ...viaStorefront].map((row) => row.brand_id));
}

/** Brands that can act on a contest entry: only the one running its contest. */
async function brandIdsForContestEntry(db, contestEntryId) {
  const row = await db
    .selectFrom("contest_entries")
    .innerJoin("contests", "contests.id", "contest_entries.contest_id")
    .select(["contests.brand_id as brand_id", "contest_entries.artwork_id as artwork_id"])
    .where("contest_entries.id", "=", contestEntryId)
    .executeTakeFirst();

  return row ? { brandIds: unique([row.brand_id]), artworkId: row.artwork_id } : null;
}

/** Brands that can review a queue item. Items about anything else (users, comments) have none. */
async function brandIdsForQueueItem(db, item) {
  if (item.entity_type === "contest_entry") {
    return (await brandIdsForContestEntry(db, item.entity_id))?.brandIds ?? [];
  }

  if (item.entity_type === "artwork") {
    // A standalone artwork is only a brand's business through its storefront. Contest context
    // arrives as a separate contest_entry item.
    const rows = await db
      .selectFrom("brand_artworks")
      .select(["brand_id"])
      .where("artwork_id", "=", item.entity_id)
      .execute();

    return unique(rows.map((row) => row.brand_id));
  }

  return [];
}

/**
 * Restricts a `moderation_queue` query to one brand's items, mirroring brandIdsForQueueItem.
 * Raw SQL because `moderation_queue.entity_id` is `text` while the ids it points at are `uuid`,
 * and Postgres has no `uuid = text` operator.
 */
function queueBrandCondition(brandId) {
  return sql`(
    (moderation_queue.entity_type = 'contest_entry' AND EXISTS (
      SELECT 1
      FROM contest_entries ce
      JOIN contests c ON c.id = ce.contest_id
      WHERE ce.id::text = moderation_queue.entity_id
        AND c.brand_id = ${brandId}
    ))
    OR
    (moderation_queue.entity_type = 'artwork' AND EXISTS (
      SELECT 1
      FROM brand_artworks ba
      WHERE ba.artwork_id::text = moderation_queue.entity_id
        AND ba.brand_id = ${brandId}
    ))
  )`;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

module.exports = {
  brandIdsForArtwork,
  brandIdsForContestEntry,
  brandIdsForQueueItem,
  queueBrandCondition,
};
