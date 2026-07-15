import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(import.meta.dirname, "..");
const databaseUrl = process.env.TURSO_DATABASE_URL?.trim() || `file:${resolve(projectRoot, ".data/webine.db")}`;
if (!databaseUrl.startsWith("file:")) throw new Error("Remote Turso backups must use the provider backup workflow.");

const databasePath = resolve(databaseUrl.slice(5));
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = resolve(process.argv[2] || resolve(projectRoot, `.data/backups/webine-${timestamp}.sqlite`));
await mkdir(dirname(backupPath), { recursive: true });
const command = `.backup ${JSON.stringify(backupPath)}`;
const result = spawnSync("sqlite3", [databasePath, command], { encoding: "utf8" });
if (result.status !== 0) throw new Error(result.stderr.trim() || "The local database backup failed.");
console.log(backupPath);
