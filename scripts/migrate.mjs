import { createClient } from "@libsql/client";
import { mkdir, readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const databaseUrl = process.env.TURSO_DATABASE_URL?.trim() ||
  `file:${resolve(projectRoot, ".data/webine.db")}`;

if (databaseUrl.startsWith("file:")) {
  await mkdir(dirname(databaseUrl.slice(5)), { recursive: true });
}

const client = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN?.trim(),
});

await client.execute(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`);

const appliedResult = await client.execute("SELECT name FROM schema_migrations");
const applied = new Set(appliedResult.rows.map((row) => String(row.name)));
const migrationDirectory = resolve(projectRoot, "migrations");
const migrationNames = (await readdir(migrationDirectory))
  .filter((name) => name.endsWith(".sql"))
  .sort();

for (const name of migrationNames) {
  if (applied.has(name)) continue;

  const sql = await readFile(resolve(migrationDirectory, name), "utf8");
  await client.executeMultiple(sql);
  await client.execute({
    sql: "INSERT INTO schema_migrations (name) VALUES (?)",
    args: [name],
  });
  console.log(`Applied ${name}`);
}

await client.close();
