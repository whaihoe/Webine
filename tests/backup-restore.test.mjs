import assert from "node:assert/strict";
import { createClient } from "@libsql/client";
import { mkdtemp, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { removeTemporaryDirectory } from "./test-utils.mjs";

test("backs up and restores a local database with a safety copy", async () => {
  const directory = await mkdtemp(join(tmpdir(), "webine-backup-"));
  const databasePath = join(directory, "source.sqlite");
  const backupPath = join(directory, "backup.sqlite");
  try {
    const initialClient = createClient({ url: `file:${databasePath}` });
    await initialClient.executeMultiple(
      "CREATE TABLE sample (value TEXT NOT NULL); INSERT INTO sample VALUES ('before');",
    );
    await initialClient.close();
    const environment = { ...process.env, TURSO_DATABASE_URL: `file:${databasePath}`, WEBINE_BACKUP_DIRECTORY: directory };
    const backup = spawnSync(process.execPath, [fileURLToPath(new URL("../scripts/backup-local.mjs", import.meta.url)), backupPath], { env: environment, encoding: "utf8" });
    assert.equal(backup.status, 0, backup.stderr);
    const changedClient = createClient({ url: `file:${databasePath}` });
    await changedClient.execute("UPDATE sample SET value = 'after'");
    await changedClient.close();
    const restore = spawnSync(process.execPath, [fileURLToPath(new URL("../scripts/restore-local.mjs", import.meta.url)), backupPath, "--confirm"], { env: environment, encoding: "utf8" });
    assert.equal(restore.status, 0, restore.stderr);
    const restoredClient = createClient({ url: `file:${databasePath}` });
    const restored = await restoredClient.execute("SELECT value FROM sample");
    await restoredClient.close();
    assert.equal(restored.rows[0].value, "before");
    assert.ok((await readdir(directory)).some((name) => name.startsWith("pre-restore-")));
  } finally {
    await removeTemporaryDirectory(directory);
  }
});
