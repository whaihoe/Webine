import { createClient } from "@libsql/client";
import { access, copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const databaseUrl = process.env.TURSO_DATABASE_URL?.trim() || `file:${resolve(projectRoot, ".data/webine.db")}`;
if (!databaseUrl.startsWith("file:")) throw new Error("Remote Turso backups must use the provider backup workflow.");

const databasePath = resolve(databaseUrl.slice(5));
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = resolve(process.argv[2] || resolve(projectRoot, `.data/backups/webine-${timestamp}.sqlite`));
if (databasePath === backupPath) throw new Error("The backup destination must differ from the database path.");
await access(databasePath);
await mkdir(dirname(backupPath), { recursive: true });
const client = createClient({ url: `file:${databasePath}` });
try {
  await client.execute("PRAGMA wal_checkpoint(TRUNCATE)");
} finally {
  await client.close();
}
await copyFile(databasePath, backupPath);
console.log(backupPath);
