import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  brandIdsForArtwork,
  brandIdsForContestEntry,
  brandIdsForQueueItem,
} = require("./brandScope.service.js");
const { createFakeDb } = require("../__fixtures__/fakeDb.js");

function seed() {
  return createFakeDb({
    contests: [
      { id: "contest-a", brand_id: "brand-a" },
      { id: "contest-b", brand_id: "brand-b" },
    ],
    contest_entries: [
      { id: "entry-1", contest_id: "contest-a", artwork_id: "artwork-1" },
      { id: "entry-2", contest_id: "contest-b", artwork_id: "artwork-1" },
    ],
    brand_artworks: [{ brand_id: "brand-c", artwork_id: "artwork-2" }],
  });
}

describe("brandScope", () => {
  it("gives an artwork every brand it was entered with, plus storefronts", async () => {
    const db = seed();
    expect((await brandIdsForArtwork(db, "artwork-1")).sort()).toEqual(["brand-a", "brand-b"]);
    expect(await brandIdsForArtwork(db, "artwork-2")).toEqual(["brand-c"]);
    expect(await brandIdsForArtwork(db, "artwork-9")).toEqual([]);
  });

  it("gives a contest entry only the brand running its contest", async () => {
    expect(await brandIdsForContestEntry(seed(), "entry-2")).toEqual({
      brandIds: ["brand-b"],
      artworkId: "artwork-1",
    });
    expect(await brandIdsForContestEntry(seed(), "missing")).toBeNull();
  });

  it("scopes queue items: entries by contest, artworks by storefront, anything else to nobody", async () => {
    const db = seed();

    expect(await brandIdsForQueueItem(db, { entity_type: "contest_entry", entity_id: "entry-1" })).toEqual(["brand-a"]);
    // An artwork item is a platform matter unless the artwork sits on a brand's storefront: the
    // brands that ran its contests see the separate contest_entry items instead.
    expect(await brandIdsForQueueItem(db, { entity_type: "artwork", entity_id: "artwork-1" })).toEqual([]);
    expect(await brandIdsForQueueItem(db, { entity_type: "artwork", entity_id: "artwork-2" })).toEqual(["brand-c"]);
    expect(await brandIdsForQueueItem(db, { entity_type: "comment", entity_id: "c-1" })).toEqual([]);
  });
});
