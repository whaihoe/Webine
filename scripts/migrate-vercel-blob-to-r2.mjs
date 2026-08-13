/* One-way and resumable. Never deletes or mutates the source Blob. */
import { createHash, createHmac } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createClient } from "@libsql/client";

const dryRun = process.argv.includes("--dry-run");
const applyDatabase = process.argv.includes("--apply-db");
const statePath = process.env.WEBINE_MEDIA_MIGRATION_STATE || ".data/vercel-blob-r2-migration.json";
const required = (key) => { const value = process.env[key]?.trim(); if (!value) throw new Error(`${key} is required`); return value; };
const blobToken = process.env.VERCEL_BLOB_READ_WRITE_TOKEN?.trim() || required("BLOB_READ_WRITE_TOKEN");
const endpoint = dryRun ? null : new URL(required("R2_S3_ENDPOINT"));
if (endpoint && (endpoint.protocol !== "https:" || !endpoint.hostname.endsWith(".r2.cloudflarestorage.com") || endpoint.pathname.split("/").filter(Boolean).length !== 1)) throw new Error("R2_S3_ENDPOINT must be a bucket-specific Cloudflare R2 HTTPS endpoint");
const accessKey = dryRun ? "" : required("R2_ACCESS_KEY_ID");
const secret = dryRun ? "" : required("R2_SECRET_ACCESS_KEY");
let state = { version: 1, migrated: {} }; try { state = JSON.parse(await readFile(statePath, "utf8")); } catch { /* first run */ }
if (!dryRun) await mkdir(dirname(statePath), { recursive: true });
const hash = (value) => createHash("sha256").update(value).digest("hex"); const hmac = (key, value) => createHmac("sha256", key).update(value).digest();
function signedPut(key, body, contentType) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z"); const day = stamp.slice(0, 8); const path = `${endpoint.pathname.replace(/\/+$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`; const scope = `${day}/auto/s3/aws4_request`; const payload = hash(body);
  const headers = `content-type:${contentType}\nhost:${endpoint.host}\nx-amz-content-sha256:${payload}\nx-amz-date:${stamp}\n`; const canonical = `PUT\n${path}\n\n${headers}\ncontent-type;host;x-amz-content-sha256;x-amz-date\n${payload}`; const signingKey = hmac(hmac(hmac(hmac(`AWS4${secret}`, day), "auto"), "s3"), "aws4_request");
  return { url: new URL(path, endpoint.origin), headers: { "content-type": contentType, "x-amz-content-sha256": payload, "x-amz-date": stamp, Authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=${hmac(signingKey, `AWS4-HMAC-SHA256\n${stamp}\n${scope}\n${hash(canonical)}`).toString("hex")}` } };
}
let cursor; do {
  const response = await fetch(`https://blob.vercel-storage.com/?${new URLSearchParams({ prefix: "webine/media/", ...(cursor ? { cursor } : {}) })}`, { headers: { Authorization: `Bearer ${blobToken}` } }); if (!response.ok) throw new Error(`Vercel Blob listing failed: ${response.status}`); const page = await response.json();
  for (const blob of page.blobs ?? []) { if (state.migrated[blob.pathname] && !dryRun) continue; if (!Number.isInteger(blob.size) || blob.size < 1 || blob.size > 30 * 1024 * 1024) throw new Error(`Unexpected source size for ${blob.pathname}`); const source = await fetch(blob.url, { redirect: "error" }); if (!source.ok) throw new Error(`Could not read ${blob.pathname}`); const body = Buffer.from(await source.arrayBuffer()); if (body.byteLength !== blob.size) throw new Error(`Source size changed while reading ${blob.pathname}`); const sha256 = hash(body);
    if (!dryRun) { const target = signedPut(blob.pathname, body, blob.contentType || "application/octet-stream"); const put = await fetch(target.url, { method: "PUT", headers: target.headers, body }); if (!put.ok) throw new Error(`R2 write failed for ${blob.pathname}: ${put.status}`); }
    state.migrated[blob.pathname] = { sourceUrl: blob.url, byteSize: body.byteLength, sha256, migratedAt: new Date().toISOString(), dryRun }; if (!dryRun) await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`); console.log(`${dryRun ? "Would migrate" : "Migrated"} ${blob.pathname} ${sha256}`);
  } cursor = page.cursor;
} while (cursor);

if (applyDatabase) {
  if (dryRun) throw new Error("--apply-db cannot be combined with --dry-run");
  const publicBase = required("R2_PUBLIC_BASE_URL").replace(/\/+$/, "");
  const databaseUrl = required("TURSO_DATABASE_URL");
  const database = createClient({ url: databaseUrl, authToken: process.env.TURSO_AUTH_TOKEN?.trim() });
  const report = [];
  for (const [pathname, mapping] of Object.entries(state.migrated)) {
    const current = await database.execute({ sql: "SELECT id, provider, provider_asset_id FROM assets WHERE provider_asset_id = ?", args: [pathname] });
    for (const row of current.rows) {
      if (String(row.provider) !== "vercel_blob") continue;
      const result = await database.execute({ sql: "UPDATE assets SET provider = 'r2', delivery_url = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ? AND provider = 'vercel_blob' AND provider_asset_id = ?", args: [`${publicBase}/${pathname.split("/").map(encodeURIComponent).join("/")}`, String(row.id), pathname] });
      report.push({ id: String(row.id), pathname, sha256: mapping.sha256, updated: result.rowsAffected === 1 });
    }
  }
  await database.close();
  state.databaseReconciliation = { completedAt: new Date().toISOString(), report };
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
  console.log(JSON.stringify({ reconciled: report.filter((entry) => entry.updated).length, alreadyR2: report.filter((entry) => !entry.updated).length }, null, 2));
}
