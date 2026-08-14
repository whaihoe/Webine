import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("uses one asset-first Cloudflare Worker without Vercel runtime files", async () => {
  const [worker, wrangler, headers, packageJson, env, adminRoutes] = await Promise.all([
    readFile(new URL("worker.ts", root), "utf8"),
    readFile(new URL("wrangler.toml", root), "utf8"),
    readFile(new URL("public/_headers", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
    readFile(new URL(".env.example", root), "utf8"),
    readFile(new URL("server/api-routes/admin.ts", root), "utf8"),
  ]);
  await assert.rejects(access(new URL("vercel.json", root)));
  assert.match(wrangler, /not_found_handling = "404-page"/);
  assert.match(wrangler, /"\/api\/admin\/\*"/);
  assert.match(wrangler, /"\/admin\/\*"/);
  assert.match(wrangler, /binding = "MEDIA_BUCKET"/);
  assert.match(wrangler, /binding = "CONTENT_BUCKET"/);
  assert.match(worker, /environment\.ASSETS\.fetch/);
  assert.match(headers, /\/admin\/\*/);
  assert.doesNotMatch(packageJson, /@vercel\/blob/);
  assert.match(env, /VITE_CONTENT_BASE_URL/);
  assert.doesNotMatch(env, /BLOB_READ_WRITE_TOKEN/);
  assert.match(adminRoutes, /status: "ready",\s+processingState: "ready"/);
  assert.doesNotMatch(adminRoutes, /processingState: "quarantined"/);
});
