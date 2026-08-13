import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("uses static assets first and sends only protected writes through the Worker", async () => {
  const [config, worker] = await Promise.all([readFile(new URL("wrangler.toml", root), "utf8"), readFile(new URL("worker.ts", root), "utf8")]);
  assert.match(config, /directory = "\.\/dist"/);
  assert.match(config, /not_found_handling = "404-page"/);
  assert.match(config, /"\/preview\/\*"/);
  assert.doesNotMatch(config, /"\/sitemap\.xml"/);
  assert.match(worker, /environment\.ASSETS\.fetch/);
  assert.match(worker, /Rate limiting is unavailable/);
});

test("keeps private static documents out of caches and search", async () => {
  const headers = await readFile(new URL("public/_headers", root), "utf8");
  for (const path of ["/admin", "/admin/*", "/preview", "/preview/*"]) assert.ok(headers.includes(`${path}\n  Cache-Control: private, no-store\n  X-Robots-Tag: noindex, nofollow`));
});
