// Compiles every migration's `up`/`down` against Kysely's DummyDriver.
//
// No database is contacted: DummyDriver accepts and discards queries, so this only proves the
// statements are *syntactically constructible* — that the schema-builder calls exist and the raw
// SQL templates interpolate. That is worth having on its own, because a typo in a builder chain
// otherwise stays hidden until a deploy runs the migration for real.
import { describe, expect, it } from "vitest";
import {
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const migrationDir = join(import.meta.dirname, ".");

function dummyDb() {
  const compiled = [];
  const db = new Kysely({
    dialect: {
      createAdapter: () => new PostgresAdapter(),
      createDriver: () => new DummyDriver(),
      createIntrospector: (d) => new PostgresIntrospector(d),
      createQueryCompiler: () => new PostgresQueryCompiler(),
    },
    log: (event) => compiled.push(event.query.sql),
  });
  return { db, compiled };
}

const migrationFiles = readdirSync(migrationDir)
  .filter((f) => f.endsWith(".js") && !f.endsWith(".test.js"))
  .sort();

describe("migrations compile", () => {
  it("finds the migration files", () => {
    expect(migrationFiles.length).toBeGreaterThan(0);
  });

  for (const file of migrationFiles) {
    describe(file, () => {
      const migration = require(join(migrationDir, file));

      it("exports up and down", () => {
        expect(typeof migration.up).toBe("function");
        expect(typeof migration.down).toBe("function");
      });

      it("compiles up()", async () => {
        const { db, compiled } = dummyDb();
        await migration.up(db);
        expect(compiled.length).toBeGreaterThan(0);
      });

      it("compiles down()", async () => {
        const { db } = dummyDb();
        await migration.down(db);
      });
    });
  }
});
