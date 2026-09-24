require("dotenv").config({ quiet: process.env.DB_QUIET === "true" });

const { Kysely, PostgresDialect } = require("kysely");
const { Pool } = require("pg");

const useSSL = process.env.DB_SSL === "true";

// The pool narrates every acquire, which is fine for a server log but buries the output of anything
// run from a terminal. Opt-in only, so server and CI behaviour is unchanged; errors stay loud.
const quiet = process.env.DB_QUIET === "true";
const log = quiet ? () => {} : console.log;

log(`🐘 Connecting to PostgreSQL (${useSSL ? "SSL enabled" : "SSL disabled"})`);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

pool.on("connect", () => log("✅ New database client connected"));

pool.on("acquire", () => log("🔗 Database connection acquired from pool"));

pool.on("error", (err) =>
  console.error("❌ Database pool error:", err.message)
);

(async () => {
  let client;

  try {
    client = await pool.connect();

    log("🎉 Successfully connected to PostgreSQL database!");

    const res = await client.query("SELECT current_database(), version()");

    log(`📍 Connected to: ${res.rows[0].current_database}`);
    log(`🐘 Version: ${res.rows[0].version.split(",")[0]}`);
  } catch (err) {
    console.error("❌ Failed to connect to database!", err.message);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
})();

const db = new Kysely({
  dialect: new PostgresDialect({
    pool,
  }),
});

module.exports = { db, pool };
