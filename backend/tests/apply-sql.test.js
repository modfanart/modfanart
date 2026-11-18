// Guards the SQL runner used for production schema changes: every file must
// end up in one transaction that only commits with --apply, and PL/pgSQL
// BEGIN inside DO blocks must survive.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const {
  buildTransactionSql,
  stripTransactionLines,
  parseArgs,
} = require("../src/scripts/apply-sql");

test("drops top-level BEGIN/COMMIT lines but keeps DO-block BEGIN", () => {
  const sql = [
    "BEGIN;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS x text;",
    "DO $$",
    "BEGIN",
    "  BEGIN",
    "    PERFORM 1;",
    "  END;",
    "END $$;",
    "commit;",
  ].join("\n");
  const out = stripTransactionLines(sql);
  assert.doesNotMatch(out, /^BEGIN;$/m);
  assert.doesNotMatch(out, /^commit;$/im);
  assert.match(out, /^BEGIN$/m);
  assert.match(out, /^  END;$/m);
  assert.match(out, /END \$\$;/);
});

test("wraps all files in one transaction, rollback unless --apply", () => {
  const files = [
    { name: "a.sql", sql: "BEGIN;\nSELECT 1;\nCOMMIT;" },
    { name: "b.sql", sql: "SELECT 2;" },
  ];
  const dry = buildTransactionSql(files, { apply: false });
  assert.match(dry, /^BEGIN;\n/);
  assert.match(dry, /ROLLBACK;\n$/);
  assert.doesNotMatch(dry, /^COMMIT;/m);
  assert.strictEqual(dry.match(/^BEGIN;$/gm).length, 1);

  const real = buildTransactionSql(files, { apply: true });
  assert.match(real, /COMMIT;\n$/);
  assert.doesNotMatch(real, /ROLLBACK;/);
});

test("requires --expect-db and at least one file", () => {
  assert.throws(() => parseArgs(["x.sql"]), /--expect-db/);
  assert.throws(() => parseArgs(["--expect-db", "moddb"]), /No SQL files/);
  assert.deepStrictEqual(parseArgs(["--expect-db=moddb", "--apply", "x.sql"]), {
    apply: true,
    expectDb: "moddb",
    files: ["x.sql"],
  });
});

test("the shipped migration SQL files keep exactly one wrapping transaction", () => {
  const dir = path.join(__dirname, "../src/migrations");
  const files = ["newmigrations.sql", "workspace_migrations.sql"].map((name) => ({
    name,
    sql: fs.readFileSync(path.join(dir, name), "utf8"),
  }));
  const out = buildTransactionSql(files, { apply: false });
  assert.strictEqual(out.match(/^[ \t]*BEGIN[ \t]*;/gim).length, 1);
  assert.strictEqual((out.match(/^[ \t]*COMMIT[ \t]*;/gim) || []).length, 0);
});
