import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);

const { MigrationFolderProvider, isMigrationFile } = require("./migration-provider.js");

const migrationsDir = join(import.meta.dirname, "../migrations");

describe("isMigrationFile", () => {
  it("accepts timestamp-prefixed migrations", () => {
    expect(isMigrationFile("20260816000000_create_ai_screening.js")).toBe(true);
    expect(isMigrationFile("001_baseline.js")).toBe(true);
  });

  it("rejects co-located tests — this is what broke the migration run", () => {
    expect(isMigrationFile("migrations.compile.test.js")).toBe(false);
    expect(isMigrationFile("20260816000000_create_ai_screening.test.js")).toBe(false);
    expect(isMigrationFile("something.spec.js")).toBe(false);
  });

  it("rejects helpers, fixtures and non-JS files", () => {
    expect(isMigrationFile("helpers.js")).toBe(false);
    expect(isMigrationFile("README.md")).toBe(false);
    expect(isMigrationFile("schema.sql")).toBe(false);
    expect(isMigrationFile("index.d.ts")).toBe(false);
  });
});

describe("MigrationFolderProvider", () => {
  it("never imports a file it filtered out", async () => {
    const loaded = [];
    const provider = new MigrationFolderProvider("/migrations", {
      readdir: async () => [
        "20260101000000_second.js",
        "001_first.js",
        "migrations.compile.test.js",
        "notes.md",
      ],
      load: (file) => {
        loaded.push(file);
        return { up: async () => {}, down: async () => {} };
      },
    });

    const migrations = await provider.getMigrations();

    expect(Object.keys(migrations)).toEqual(["001_first", "20260101000000_second"]);
    expect(loaded.some((file) => file.includes("test"))).toBe(false);
  });

  it("returns migrations in filename order, which is the order they must apply in", async () => {
    const provider = new MigrationFolderProvider("/migrations", {
      readdir: async () => [
        "20260816000001_screening_hardening.js",
        "001_baseline.js",
        "20260816000000_create_ai_screening.js",
      ],
      load: () => ({ up: async () => {}, down: async () => {} }),
    });

    expect(Object.keys(await provider.getMigrations())).toEqual([
      "001_baseline",
      "20260816000000_create_ai_screening",
      "20260816000001_screening_hardening",
    ]);
  });

  it("loads the real migration folder, and every entry has up and down", async () => {
    const provider = new MigrationFolderProvider(migrationsDir);
    const migrations = await provider.getMigrations();

    expect(Object.keys(migrations).length).toBeGreaterThan(0);

    for (const [name, migration] of Object.entries(migrations)) {
      expect(typeof migration.up, `${name}.up`).toBe("function");
      expect(typeof migration.down, `${name}.down`).toBe("function");
    }
  });

  it("skips the test files that actually sit in src/migrations", async () => {
    // Guards the specific regression: a real .test.js file is present in that folder, and the
    // provider must not hand it to the migrator.
    const testFiles = readdirSync(migrationsDir).filter((file) => file.endsWith(".test.js"));
    expect(testFiles.length).toBeGreaterThan(0);

    const names = Object.keys(
      await new MigrationFolderProvider(migrationsDir).getMigrations()
    );

    for (const file of testFiles) {
      expect(names).not.toContain(file.replace(/\.js$/, ""));
    }
    expect(names.some((name) => name.endsWith(".test"))).toBe(false);
  });
});
