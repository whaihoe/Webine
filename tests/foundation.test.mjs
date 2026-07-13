import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("builds a local browser application", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");

  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /Webine/);
  assert.doesNotMatch(html, /openai|cloudflare|vinext|wrangler/i);
});

test("keeps every foundation route", async () => {
  const content = await readFile(
    new URL("../src/content/pageContent.ts", import.meta.url),
    "utf8",
  );

  for (const path of ["/", "/works", "/contact", "/admin", "/preview"]) {
    assert.match(content, new RegExp(`path: ["']${path.replace("/", "\\/")}["']`));
  }
});

test("includes the approved Webine logo", async () => {
  await access(new URL("../public/webine-logo-primary.png", import.meta.url));
});
