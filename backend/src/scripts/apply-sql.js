// apply-sql.js
//
// Runs hand-written schema SQL files (src/migrations/*.sql) against the
// database in DATABASE_URL, all in ONE transaction.
//
// Why this exists: production schema changes have been applied by pasting
// SQL into psql. That went wrong twice in Nov 2026. A paste dropped a
// character ("DD COLUMN"). Then the files were run against the `postgres`
// database instead of `moddb`, so the live database never got the new
// columns. Running committed files through this script avoids both.
//
//   node src/scripts/apply-sql.js --expect-db moddb file1.sql [file2.sql ...]
//       dry run: everything runs, then ROLLBACK. Nothing is changed.
//   node src/scripts/apply-sql.js --expect-db moddb --apply file1.sql ...
//       same, but COMMIT at the end.
//
// --expect-db is required. The script stops before running any SQL if the
// connected database has a different name.
//
// Statements that are only `BEGIN;` / `COMMIT;` lines inside the files are
// dropped so every file runs in the single wrapping transaction. PL/pgSQL
// `BEGIN` inside DO blocks has no semicolon, so it is not affected.
// Rows returned by SELECTs in the files (e.g. the read-only "missing column"
// checks) are printed.

const fs = require("node:fs");
const path = require("node:path");

// Not `END;`: inside a DO block that closes a PL/pgSQL block.
const TX_LINE = /^[ \t]*(BEGIN|COMMIT|ROLLBACK|START TRANSACTION)[ \t]*;[ \t]*$/gim;

function stripTransactionLines(sql) {
  return sql.replace(TX_LINE, "-- (transaction statement removed by apply-sql)");
}

function buildTransactionSql(contents, { apply }) {
  const body = contents
    .map(({ name, sql }) => `-- ===== ${name} =====\n${stripTransactionLines(sql)}`)
    .join("\n\n");
  return `BEGIN;\n${body}\n${apply ? "COMMIT;" : "ROLLBACK;"}\n`;
}

function parseArgs(argv) {
  const opts = { apply: false, expectDb: null, files: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") opts.apply = true;
    else if (a === "--expect-db") opts.expectDb = argv[++i] || null;
    else if (a.startsWith("--expect-db=")) opts.expectDb = a.slice("--expect-db=".length) || null;
    else if (a.startsWith("--")) throw new Error(`Unknown option: ${a}`);
    else opts.files.push(a);
  }
  if (!opts.expectDb) throw new Error("--expect-db <name> is required");
  if (!opts.files.length) throw new Error("No SQL files given");
  return opts;
}

function contextAt(sql, position) {
  const pos = Number(position);
  if (!pos) return "";
  const start = Math.max(0, pos - 200);
  return `${sql.slice(start, pos - 1)}  <<<HERE>>>  ${sql.slice(pos - 1, pos + 120)}`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const contents = opts.files.map((f) => ({
    name: path.basename(f),
    sql: fs.readFileSync(path.resolve(f), "utf8"),
  }));
  const sql = buildTransactionSql(contents, opts);

  const { Client } = require("pg");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  });
  await client.connect();

  try {
    const { rows } = await client.query("SELECT current_database() AS db");
    const db = rows[0].db;
    if (db !== opts.expectDb) {
      console.error(`Refusing: connected to "${db}", expected "${opts.expectDb}". Nothing was run.`);
      process.exitCode = 2;
      return;
    }

    console.log(`Database: ${db}`);
    console.log(`Files:    ${contents.map((c) => c.name).join(", ")}`);
    console.log(`Mode:     ${opts.apply ? "APPLY (commit)" : "DRY RUN (rollback)"}`);

    let results;
    try {
      results = await client.query(sql);
    } catch (err) {
      // An error inside the explicit transaction aborts it; closing the
      // connection rolls it back.
      console.error(`FAILED, nothing applied: ${err.message}`);
      if (err.position) console.error(contextAt(sql, err.position));
      process.exitCode = 1;
      return;
    }

    for (const r of [].concat(results)) {
      if (r.command === "SELECT" && r.rows.length) {
        console.log(`SELECT returned ${r.rows.length} row(s):`);
        console.table(r.rows);
      }
    }
    console.log(opts.apply ? "OK: committed." : "OK: dry run succeeded, rolled back. Re-run with --apply.");
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  });
}

module.exports = { buildTransactionSql, stripTransactionLines, parseArgs };
