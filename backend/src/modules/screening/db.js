// The shared Kysely instance lives in `src/config`, whose module body opens a pool and calls
// `process.exit(1)` when the database is unreachable. Requiring it at the top of a file makes
// that file unimportable without a live database — which is why the existing `tests/` suites die
// instead of skipping. Everything in this module therefore resolves the handle lazily, and every
// data-access function takes it as its first argument so tests can pass a fake.
function getDb() {
  return require("../../config").db;
}

module.exports = { getDb };
