// Loads migrations from a folder, ignoring anything that is not one.
//
// Kysely's own FileMigrationProvider imports every file it finds and then rejects whatever has no
// `up` export, which means a single co-located test file, helper or editor backup in
// `src/migrations/` fails the entire migration run — including on deploy. Filtering has to happen
// on the filename, before the import: the failure comes from the import itself, so inspecting the
// loaded module is already too late.
//
// Kept in its own module so it can be tested; `migrate.js` runs `main()` on import.
const fs = require("node:fs").promises;
const path = require("node:path");

/** Migration filenames are timestamp-prefixed, which also excludes helpers and fixtures. */
function isMigrationFile(file) {
  if (!file.endsWith(".js")) return false;
  if (file.endsWith(".test.js") || file.endsWith(".spec.js")) return false;
  return /^\d/.test(file);
}

class MigrationFolderProvider {
  constructor(folder, deps = {}) {
    this.folder = folder;
    this.readdir = deps.readdir ?? fs.readdir;
    this.load = deps.load ?? ((file) => require(file));
  }

  async getMigrations() {
    const files = (await this.readdir(this.folder)).filter(isMigrationFile).sort();

    const migrations = {};

    for (const file of files) {
      migrations[path.basename(file, ".js")] = this.load(path.join(this.folder, file));
    }

    return migrations;
  }
}

module.exports = { MigrationFolderProvider, isMigrationFile };
