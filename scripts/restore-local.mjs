import { access, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const [backupArgument, confirmation] = process.argv.slice(2);
if (!backupArgument || confirmation !== "--confirm") throw new Error("Usage: npm run db:restore -- /absolute/path/backup.sqlite --confirm");
const backupPath = resolve(backupArgument);
await access(backupPath);

const projectRoot = resolve(import.meta.dirname, "..");
const databaseUrl = process.env.TURSO_DATABASE_URL?.trim() || `file:${resolve(projectRoot, ".data/webine.db")}`;
if (!databaseUrl.startsWith("file:")) throw new Error("Remote Turso restores must use the provider restore workflow.");
const databasePath = resolve(databaseUrl.slice(5));
await mkdir(dirname(databasePath), { recursive: true });

const safetyDirectory = resolve(process.env.WEBINE_BACKUP_DIRECTORY?.trim() || resolve(projectRoot, ".data/backups"));
const safetyPath = resolve(safetyDirectory, `pre-restore-${new Date().toISOString().replace(/[:.]/g, "-")}.sqlite`);
await mkdir(dirname(safetyPath), { recursive: true });
if (spawnSync("sqlite3", [databasePath, `.backup ${JSON.stringify(safetyPath)}`]).status !== 0) throw new Error("The pre-restore safety backup failed.");
const restore = spawnSync("sqlite3", [databasePath, `.restore ${JSON.stringify(backupPath)}`], { encoding: "utf8" });
if (restore.status !== 0) throw new Error(restore.stderr.trim() || "The local database restore failed.");
console.log(`Restored ${backupPath}. Safety backup: ${safetyPath}`);
