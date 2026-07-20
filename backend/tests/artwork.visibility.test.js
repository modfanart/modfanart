// tests/artwork.visibility.test.js

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { Kysely, PostgresDialect, DummyDriver, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler } = require("kysely");

const { applyPublicArtworkFilter } = require("../src/modules/artworks/artwork.visibility");

/**
 * Compile-only Kysely instance. It never opens a connection, so these tests
 * assert on the SQL we generate without needing a database. This is a
 * deliberate trade-off: it pins query shape (the thing that regressed), not
 * the rows Postgres returns. Row-level coverage needs integration tests.
 */
const db = new Kysely({
  dialect: {
    createAdapter: () => new PostgresAdapter(),
    createDriver: () => new DummyDriver(),
    createIntrospector: (d) => new PostgresIntrospector(d),
    createQueryCompiler: () => new PostgresQueryCompiler(),
  },
});

/** Mirrors the list query in ArtworkController.getArtworks. */
function buildListQuery({ search } = {}) {
  let query = db
    .selectFrom("artworks")
    .leftJoin("users", "users.id", "artworks.creator_id")
    .select(["artworks.id", "artworks.title"])
    .where("artworks.deleted_at", "is", null)
    .orderBy("artworks.created_at", "desc");

  query = applyPublicArtworkFilter(query);

  if (search) {
    query = query.where((eb) =>
      eb.or([
        eb("artworks.title", "ilike", `%${search}%`),
        eb("artworks.description", "ilike", `%${search}%`),
      ])
    );
  }
  return query;
}

/** Mirrors the count query in ArtworkController.getArtworks. */
function buildCountQuery({ search } = {}) {
  let countQuery = db.selectFrom("artworks").where("deleted_at", "is", null);

  countQuery = applyPublicArtworkFilter(countQuery);

  if (search) {
    countQuery = countQuery.where((eb) =>
      eb.or([
        eb("title", "ilike", `%${search}%`),
        eb("description", "ilike", `%${search}%`),
      ])
    );
  }
  return countQuery.select(db.fn.count("id").as("total"));
}

test("restricts artwork to published AND moderator-approved", () => {
  const { sql, parameters } = applyPublicArtworkFilter(
    db.selectFrom("artworks").select("id")
  ).compile();

  assert.match(sql, /"artworks"\."status" = \$\d+/);
  assert.match(sql, /"artworks"\."moderation_status" = \$\d+/);
  assert.deepEqual(parameters, ["published", "approved"]);
});

test("list and count queries apply an identical visibility filter", () => {
  // Regression guard: these two queries are built separately and previously
  // drifted, which is how unapproved submissions reached the gallery. If one
  // gains a visibility predicate the other lacks, pagination totals lie.
  const list = buildListQuery().compile();
  const count = buildCountQuery().compile();

  for (const compiled of [list, count]) {
    assert.match(compiled.sql, /"status" = \$\d+/);
    assert.match(compiled.sql, /"moderation_status" = \$\d+/);
  }

  const visibilityParams = (p) => p.filter((v) => v === "published" || v === "approved");
  assert.deepEqual(visibilityParams(list.parameters), ["published", "approved"]);
  assert.deepEqual(
    visibilityParams(count.parameters),
    visibilityParams(list.parameters)
  );
});

test("search does not widen visibility via OR", () => {
  // The status predicates must AND with the search group. If they were folded
  // into the OR, `?search=x` would match unapproved artwork again.
  const { sql, parameters } = buildListQuery({ search: "batman" }).compile();

  assert.match(sql, /"artworks"\."status" = \$\d+ and "artworks"\."moderation_status" = \$\d+ and \(/);
  assert.ok(parameters.includes("%batman%"));

  // Same guarantee on the count side, so totals match the filtered rows.
  const count = buildCountQuery({ search: "batman" }).compile();
  assert.match(count.sql, /"moderation_status" = \$\d+ and \(/);
});

test("getArtworks wires the filter into both of its queries", () => {
  // The tests above mirror the controller's query construction rather than
  // importing it, because requiring the controller pulls in ../../../config,
  // which opens a real Postgres pool at module load. That mirroring means they
  // would still pass if someone removed the filter from the controller itself.
  //
  // This asserts against the controller source as a stopgap for that blind
  // spot. It is a coarse check — replace it with an integration test against a
  // test database once that harness exists.
  const source = fs.readFileSync(
    path.join(__dirname, "../src/modules/artworks/controller/artwork.controller.js"),
    "utf8"
  );

  const getArtworks = source.slice(
    source.indexOf("static async getArtworks("),
    source.indexOf("static async getMyArtworks(")
  );
  assert.ok(getArtworks.length > 0, "could not locate getArtworks in controller source");

  // Must assert on the ASSIGNMENT, not merely the call. Kysely builders are
  // immutable, so a bare `applyPublicArtworkFilter(query);` compiles and runs
  // but discards the filter entirely — a silent reintroduction of this bug.
  for (const target of ["query", "countQuery"]) {
    const assignment = new RegExp(
      `\\b${target}\\s*=\\s*applyPublicArtworkFilter\\(\\s*${target}\\s*\\)`
    );
    assert.match(
      getArtworks,
      assignment,
      `getArtworks must reassign ${target} from applyPublicArtworkFilter(); ` +
        `calling it without assigning discards the filter (builders are immutable)`
    );
  }

  const callSites = getArtworks.match(/applyPublicArtworkFilter\(/g) || [];
  assert.equal(
    callSites.length,
    2,
    `expected getArtworks to filter both its list and count queries, found ${callSites.length} call site(s)`
  );
});

test("applyPublicArtworkFilter returns a new builder rather than mutating", () => {
  // Documents why the assignment above is load-bearing.
  const base = db.selectFrom("artworks").select("id");
  const filtered = applyPublicArtworkFilter(base);

  assert.notEqual(base, filtered);
  assert.doesNotMatch(base.compile().sql, /"status" = \$\d+/);
  assert.match(filtered.compile().sql, /"status" = \$\d+/);
});

test("draft and pending artwork cannot satisfy the filter", () => {
  // Encodes the actual bug: uploads land as draft/pending and were public.
  const { parameters } = applyPublicArtworkFilter(
    db.selectFrom("artworks").select("id")
  ).compile();

  assert.ok(!parameters.includes("draft"));
  assert.ok(!parameters.includes("pending"));
});
