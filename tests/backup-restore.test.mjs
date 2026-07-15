import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

function sqlite(databasePath, sql) {
  const result = spawnSync("sqlite3", [databasePath, sql], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout.trim();
}

test("backs up and restores a local database with a safety copy", async () => {
  const directory = await mkdtemp(join(tmpdir(), "webine-backup-"));
  const databasePath = join(directory, "source.sqlite");
  const backupPath = join(directory, "backup.sqlite");
  try {
    sqlite(databasePath, "CREATE TABLE sample (value TEXT NOT NULL); INSERT INTO sample VALUES ('before');");
    const environment = { ...process.env, TURSO_DATABASE_URL: `file:${databasePath}`, WEBINE_BACKUP_DIRECTORY: directory };
    const backup = spawnSync(process.execPath, [new URL("../scripts/backup-local.mjs", import.meta.url).pathname, backupPath], { env: environment, encoding: "utf8" });
    assert.equal(backup.status, 0, backup.stderr);
    sqlite(databasePath, "UPDATE sample SET value = 'after';");
    const restore = spawnSync(process.execPath, [new URL("../scripts/restore-local.mjs", import.meta.url).pathname, backupPath, "--confirm"], { env: environment, encoding: "utf8" });
    assert.equal(restore.status, 0, restore.stderr);
    assert.equal(sqlite(databasePath, "SELECT value FROM sample;"), "before");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
