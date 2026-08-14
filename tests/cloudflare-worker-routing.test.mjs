import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("uses static assets first and sends only protected writes through the Worker", async () => {
  const [config, worker] = await Promise.all([readFile(new URL("wrangler.toml", root), "utf8"), readFile(new URL("worker.ts", root), "utf8")]);
  assert.match(config, /directory = "\.\/dist"/);
  assert.match(config, /not_found_handling = "404-page"/);
  assert.match(config, /run_worker_first = \["\/api\/admin\/\*", "\/api\/enquiries", "\/admin\/\*", "\/preview\/\*"\]/);
  assert.match(worker, /privateApplicationDocument/);
  assert.doesNotMatch(config, /"\/sitemap\.xml"/);
  assert.match(worker, /environment\.ASSETS\.fetch/);
  assert.match(worker, /Rate limiting is unavailable/);
});

test("uses an isolated path-preserving apex redirect Worker", async () => {
  const [config, worker] = await Promise.all([
    readFile(new URL("wrangler.apex.toml", root), "utf8"),
    readFile(new URL("apex-redirect-worker.ts", root), "utf8"),
  ]);
  assert.match(config, /name = "webine-apex-redirect"/);
  assert.match(config, /pattern = "madebywebine\.com"/);
  assert.match(config, /custom_domain = true/);
  assert.match(worker, /canonicalHostname = "www\.madebywebine\.com"/);
  assert.match(worker, /destination\.hostname = canonicalHostname/);
  assert.match(worker, /status: 308/);
  assert.doesNotMatch(worker, /MEDIA_BUCKET|CONTENT_BUCKET|TURSO/);
});

test("keeps private static documents out of caches and search", async () => {
  const headers = await readFile(new URL("public/_headers", root), "utf8");
  for (const path of ["/admin", "/admin/*", "/preview", "/preview/*"]) assert.ok(headers.includes(`${path}\n  Cache-Control: private, no-store\n  X-Robots-Tag: noindex, nofollow`));
});
