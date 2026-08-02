import { createClient } from "@libsql/client";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { removeTemporaryDirectory } from "./test-utils.mjs";

const projectRoot = new URL("../", import.meta.url);
const migrationRoot = new URL("migrations/", projectRoot);

test("serves origin-correct robots and published-project sitemap files", async () => {
  const directory = await mkdtemp(join(tmpdir(), "webine-site-files-"));
  const databasePath = join(directory, "cms.sqlite");
  const client = createClient({ url: `file:${databasePath}` });
  let closeDatabase = async () => {};
  const previousVercelEnvironment = process.env.VERCEL_ENV;
  try {
    const migrations = (await readdir(migrationRoot)).filter((name) => name.endsWith(".sql")).sort();
    for (const name of migrations) await client.executeMultiple(await readFile(new URL(name, migrationRoot), "utf8"));
    await client.close();
    process.env.TURSO_DATABASE_URL = `file:${databasePath}`;
    process.env.VERCEL_ENV = "production";
    const sitemapApi = (await import("../.test-build/api/sitemap.js")).default;
    ({ closeDatabase } = await import("../.test-build/server/database.js"));
    const sitemap = await sitemapApi.fetch(new Request("https://webine.example/sitemap.xml"));
    const xml = await sitemap.text();
    assert.equal(sitemap.headers.get("content-type"), "application/xml; charset=utf-8");
    assert.match(xml, /https:\/\/www\.madebywebine\.com\/works\/webine-identity-system/);
    assert.doesNotMatch(xml, /\/admin|\/preview/);
  } finally {
    if (previousVercelEnvironment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousVercelEnvironment;
    await closeDatabase();
    try {
      await client.close();
    } catch {
      // The client may already be closed after preparing the database fixture.
    }
    await removeTemporaryDirectory(directory);
  }
});
