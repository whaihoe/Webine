import { createClient } from "@libsql/client";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const migrationRoot = new URL("migrations/", projectRoot);

test("serves origin-correct robots and published-project sitemap files", async () => {
  const directory = await mkdtemp(join(tmpdir(), "webine-site-files-"));
  const databasePath = join(directory, "cms.sqlite");
  const client = createClient({ url: `file:${databasePath}` });
  try {
    const migrations = (await readdir(migrationRoot)).filter((name) => name.endsWith(".sql")).sort();
    for (const name of migrations) await client.executeMultiple(await readFile(new URL(name, migrationRoot), "utf8"));
    await client.close();
    process.env.TURSO_DATABASE_URL = `file:${databasePath}`;
    const robotsApi = (await import("../.test-build/api/robots.js")).default;
    const sitemapApi = (await import("../.test-build/api/sitemap.js")).default;
    const robots = await robotsApi.fetch(new Request("https://webine.example/robots.txt"));
    assert.equal(robots.status, 200);
    assert.match(await robots.text(), /Sitemap: https:\/\/webine\.example\/sitemap\.xml/);
    const sitemap = await sitemapApi.fetch(new Request("https://webine.example/sitemap.xml"));
    const xml = await sitemap.text();
    assert.equal(sitemap.headers.get("content-type"), "application/xml; charset=utf-8");
    assert.match(xml, /https:\/\/webine\.example\/works\/webine-identity-system/);
    assert.doesNotMatch(xml, /\/admin|\/preview/);
  } finally {
    try {
      await client.close();
    } catch {
      // The client may already be closed after preparing the database fixture.
    }
    await rm(directory, { recursive: true, force: true });
  }
});
