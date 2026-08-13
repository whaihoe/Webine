/* Upload processor outputs to R2, then let the protected Worker verify and promote them. */
import { createHash, createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";

const option = (name) => { const index = process.argv.indexOf(name); return index < 0 ? "" : process.argv[index + 1] || ""; };
const required = (key) => { const value = process.env[key]?.trim(); if (!value) throw new Error(`${key} is required`); return value; };
const manifestPath = option("--manifest"); const assetId = option("--asset-id");
if (!manifestPath || !assetId) throw new Error("Usage: node scripts/persist-media-renditions.mjs --asset-id <id> --manifest <processor-manifest.json>");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (!Array.isArray(manifest.renditions) || manifest.renditions.length !== 3) throw new Error("Manifest must contain landing, works and case-study renditions.");
const endpoint = new URL(required("R2_S3_ENDPOINT")); const accessKey = required("R2_ACCESS_KEY_ID"); const secret = required("R2_SECRET_ACCESS_KEY"); const apiOrigin = required("WEBINE_ADMIN_ORIGIN").replace(/\/+$/, ""); const adminToken = required("WEBINE_ADMIN_TOKEN");
if (endpoint.protocol !== "https:" || !endpoint.hostname.endsWith(".r2.cloudflarestorage.com") || endpoint.pathname.split("/").filter(Boolean).length !== 1) throw new Error("R2_S3_ENDPOINT must be a bucket-specific Cloudflare R2 HTTPS endpoint");
const hash = (value) => createHash("sha256").update(value).digest("hex"); const hmac = (key, value) => createHmac("sha256", key).update(value).digest();
function signPut(key, body, type) { const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z"); const day = stamp.slice(0, 8); const path = `${endpoint.pathname.replace(/\/+$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`; const scope = `${day}/auto/s3/aws4_request`; const payload = hash(body); const canonicalHeaders = `content-type:${type}\nhost:${endpoint.host}\nx-amz-content-sha256:${payload}\nx-amz-date:${stamp}\n`; const canonical = `PUT\n${path}\n\n${canonicalHeaders}\ncontent-type;host;x-amz-content-sha256;x-amz-date\n${payload}`; const keyDate = hmac(`AWS4${secret}`, day); const signing = hmac(hmac(hmac(keyDate, "auto"), "s3"), "aws4_request"); return { url: new URL(path, endpoint.origin), headers: { "content-type": type, "x-amz-content-sha256": payload, "x-amz-date": stamp, Authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=${hmac(signing, `AWS4-HMAC-SHA256\n${stamp}\n${scope}\n${hash(canonical)}`).toString("hex")}` } }; }
const renditions = [];
for (const rendition of manifest.renditions) { const body = await readFile(rendition.output); const extension = rendition.mimeType === "video/mp4" ? "mp4" : "webp"; const pathname = `webine/renditions/${assetId}/${rendition.role}.${extension}`; const signed = signPut(pathname, body, rendition.mimeType); const response = await fetch(signed.url, { method: "PUT", headers: signed.headers, body }); if (!response.ok) throw new Error(`R2 upload failed for ${rendition.role}: ${response.status}`); renditions.push({ role: rendition.role, pathname }); }
const response = await fetch(`${apiOrigin}/api/admin/media/${encodeURIComponent(assetId)}/renditions`, { method: "POST", headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ renditions }) });
if (!response.ok) throw new Error(`Rendition persistence failed: ${response.status} ${await response.text()}`);
console.log(await response.text());
