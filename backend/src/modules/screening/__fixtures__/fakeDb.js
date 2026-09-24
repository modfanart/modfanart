// A small in-memory stand-in for the slice of the Kysely API this module uses.
//
// The real `db` lives in src/config, whose module body connects to Postgres and calls
// process.exit(1) on failure, so importing it in a unit test is not an option. Rather than mock
// individual model methods — which would let a broken query shape pass — this fake executes the
// builder chains against plain arrays, so the tests exercise the actual service logic including
// its transaction, rollback and join behaviour.
//
// It is deliberately not a general-purpose Postgres: it supports the operators and chain shapes
// the screening services actually use, and throws on anything else so an unsupported query fails
// loudly instead of silently returning nothing.

// Columns that are `jsonb` in Postgres. node-postgres parses jsonb into JS values on read, while
// writes go through JSON.stringify (necessary for arrays, which pg would otherwise turn into a
// Postgres array literal rather than a JSON array). The fake reproduces both halves, so a service
// that writes a stage result and later reads it back sees an object, exactly as it would in
// production. Getting this wrong silently breaks resume-after-retry, since a JSON string has no
// `.status`.
const JSON_COLUMNS = new Set([
  "aiornot",
  "moderation",
  "style",
  "decision_reasons",
  "config",
  "parsed_rules",
  "rule_matches",
  "old_values",
  "new_values",
]);

function parseJsonColumns(row) {
  const out = { ...row };
  for (const column of Object.keys(out)) {
    if (!JSON_COLUMNS.has(column)) continue;
    if (typeof out[column] !== "string") continue;
    try {
      out[column] = JSON.parse(out[column]);
    } catch {
      // Leave malformed JSON as-is; Postgres would have rejected it on write.
    }
  }
  return out;
}

/** Kysely's `sql` template objects are opaque; in-memory they become a concrete timestamp. */
function materialise(value) {
  if (value === null || value === undefined) return value ?? null;
  if (typeof value === "object" && !Array.isArray(value)) {
    // sql`NOW()` and friends.
    return new Date().toISOString();
  }
  return value;
}

function materialiseValues(values) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, materialise(value)])
  );
}

function compare(actual, op, value) {
  switch (op) {
    case "=":
      return actual === value;
    case "!=":
    case "<>":
      return actual !== value;
    case "is":
      return value === null ? actual === null || actual === undefined : actual === value;
    case "is not":
      return value === null ? actual !== null && actual !== undefined : actual !== value;
    case "in":
      return Array.isArray(value) && value.includes(actual);
    default:
      throw new Error(`fakeDb: unsupported operator "${op}"`);
  }
}

let idCounter = 0;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * @param {Record<string, Array<object>>} initialTables
 */
function createFakeDb(initialTables = {}) {
  const tables = {};
  for (const [name, rows] of Object.entries(initialTables)) {
    tables[name] = rows.map((r) => ({ ...r }));
  }

  const log = [];

  function table(name) {
    if (!tables[name]) tables[name] = [];
    return tables[name];
  }

  /** Flattens a row into both bare and `table.column` keys so either form resolves. */
  function qualify(name, row) {
    const out = { ...row };
    for (const [key, value] of Object.entries(row)) {
      out[`${name}.${key}`] = value;
    }
    return out;
  }

  function resolveColumn(row, column) {
    if (column in row) return row[column];
    // `where('contest_entries.id', ...)` against an unjoined query.
    const bare = column.includes(".") ? column.split(".").pop() : column;
    return row[bare];
  }

  function makeApi() {
    const api = {
      selectFrom(baseName) {
        const joins = [];
        const conditions = [];
        const projections = [];
        let selectAll = false;
        let limit = null;

        const chain = {
          innerJoin(joinName, leftColumn, rightColumn) {
            joins.push({ joinName, leftColumn, rightColumn });
            return chain;
          },
          select(columns) {
            for (const column of Array.isArray(columns) ? columns : [columns]) {
              if (typeof column === "function") {
                throw new Error("fakeDb: expression-builder select() is not supported");
              }
              projections.push(column);
            }
            return chain;
          },
          selectAll() {
            selectAll = true;
            return chain;
          },
          where(column, op, value) {
            if (typeof column === "function") {
              throw new Error("fakeDb: callback where() is not supported");
            }
            conditions.push({ column, op, value });
            return chain;
          },
          orderBy: () => chain,
          limit(n) {
            limit = n;
            return chain;
          },
          async execute() {
            log.push({ kind: "select", table: baseName, joins, conditions });

            let rows = table(baseName).map((r) => qualify(baseName, r));

            for (const { joinName, leftColumn, rightColumn } of joins) {
              const joinRows = table(joinName).map((r) => qualify(joinName, r));
              const next = [];

              for (const row of rows) {
                for (const joinRow of joinRows) {
                  if (resolveColumn(joinRow, leftColumn) === resolveColumn(row, rightColumn)) {
                    next.push({ ...row, ...joinRow });
                  }
                }
              }

              rows = next;
            }

            rows = rows.filter((row) =>
              conditions.every(({ column, op, value }) =>
                compare(resolveColumn(row, column), op, value)
              )
            );

            if (limit) rows = rows.slice(0, limit);

            if (selectAll || projections.length === 0) {
              // Return the base table's own shape, as `selectAll()` on an unjoined query does.
              return rows.map((row) => {
                const out = {};
                for (const [key, value] of Object.entries(row)) {
                  if (!key.includes(".")) out[key] = value;
                }
                return parseJsonColumns(out);
              });
            }

            return rows.map((row) => {
              const out = {};
              for (const projection of projections) {
                const [source, alias] = projection.split(/\s+as\s+/i);
                const key = alias ?? (source.includes(".") ? source.split(".").pop() : source);
                out[key] = resolveColumn(row, source) ?? null;
              }
              return parseJsonColumns(out);
            });
          },
          async executeTakeFirst() {
            const rows = await chain.execute();
            return rows[0];
          },
        };
        return chain;
      },

      insertInto(name) {
        let values = {};
        const chain = {
          values(v) {
            values = materialiseValues(v);
            return chain;
          },
          returningAll: () => chain,
          returning: () => chain,
          async execute() {
            const row = { id: values.id ?? nextId(name), ...values };
            table(name).push(row);
            log.push({ kind: "insert", table: name, row });
            return [parseJsonColumns(row)];
          },
          async executeTakeFirst() {
            const [row] = await chain.execute();
            return row;
          },
        };
        return chain;
      },

      updateTable(name) {
        const conditions = [];
        let values = {};
        const chain = {
          set(v) {
            values = materialiseValues(v);
            return chain;
          },
          where(column, op, value) {
            conditions.push({ column, op, value });
            return chain;
          },
          returningAll: () => chain,
          returning: () => chain,
          async execute() {
            const updated = [];
            for (const row of table(name)) {
              const passes = conditions.every(({ column, op, value }) =>
                compare(resolveColumn(row, column), op, value)
              );
              if (passes) {
                Object.assign(row, values);
                updated.push(parseJsonColumns(row));
              }
            }
            log.push({ kind: "update", table: name, conditions, values, count: updated.length });
            return updated;
          },
          async executeTakeFirst() {
            const rows = await chain.execute();
            return rows[0];
          },
        };
        return chain;
      },

      transaction() {
        return {
          async execute(callback) {
            // Snapshot so a thrown error rolls everything back, which is what the atomicity
            // assertions in the transition tests depend on.
            const snapshot = JSON.parse(JSON.stringify(tables));
            try {
              return await callback(api);
            } catch (error) {
              for (const key of Object.keys(tables)) delete tables[key];
              Object.assign(
                tables,
                Object.fromEntries(
                  Object.entries(snapshot).map(([k, v]) => [k, v.map((r) => ({ ...r }))])
                )
              );
              throw error;
            }
          },
        };
      },
    };

    return api;
  }

  const api = makeApi();

  return {
    ...api,
    _tables: tables,
    _log: log,
    /**
     * The raw stored column values, as written — jsonb columns are still strings here. Queries go
     * through the pg-like read path and come back parsed; this is the "what is actually in the
     * column" view that assertions use.
     */
    rows(name) {
      return table(name).map((r) => ({ ...r }));
    },
  };
}

module.exports = { createFakeDb };
