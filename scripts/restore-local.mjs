import { createClient } from "@libsql/client";
import { access, copyFile, mkdir, open, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";

async function assertSqliteDatabase(path) {
  const file = await open(path, "r");
  try {
    const signature = Buffer.alloc(16);
    await file.read(signature, 0, signature.length, 0);
    if (signature.toString("utf8") !== "SQLite format 3\u0000") {
      throw new Error("The selected backup is not a SQLite database.");
    }
  } finally {
    await file.close();
  }
}

const [backupArgument, confirmation] = process.argv.slice(2);
if (!backupArgument || confirmation !== "--confirm") throw new Error("Usage: npm run db:restore -- /absolute/path/backup.sqlite --confirm");
const backupPath = resolve(backupArgument);
await access(backupPath);
await assertSqliteDatabase(backupPath);

const projectRoot = resolve(import.meta.dirname, "..");
const databaseUrl = process.env.TURSO_DATABASE_URL?.trim() || `file:${resolve(projectRoot, ".data/webine.db")}`;
if (!databaseUrl.startsWith("file:")) throw new Error("Remote Turso restores must use the provider restore workflow.");
const databasePath = resolve(databaseUrl.slice(5));
await mkdir(dirname(databasePath), { recursive: true });

const safetyDirectory = resolve(process.env.WEBINE_BACKUP_DIRECTORY?.trim() || resolve(projectRoot, ".data/backups"));
const safetyPath = resolve(safetyDirectory, `pre-restore-${new Date().toISOString().replace(/[:.]/g, "-")}.sqlite`);
await mkdir(dirname(safetyPath), { recursive: true });
const client = createClient({ url: `file:${databasePath}` });
try {
  await client.execute("PRAGMA wal_checkpoint(TRUNCATE)");
} finally {
  await client.close();
}
await copyFile(databasePath, safetyPath);
await rm(`${databasePath}-wal`, { force: true });
await rm(`${databasePath}-shm`, { force: true });
await copyFile(backupPath, databasePath);
console.log(`Restored ${backupPath}. Safety backup: ${safetyPath}`);
