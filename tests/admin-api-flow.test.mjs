import { createClient } from "@libsql/client";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const migrationRoot = new URL("migrations/", projectRoot);

async function responseData(response) {
  const envelope = await response.json();
  return { response, envelope };
}

test("runs the protected collection and draft flow through Admin API handlers", async () => {
  const directory = await mkdtemp(join(tmpdir(), "webine-admin-api-"));
  const databasePath = join(directory, "cms.sqlite");
  const client = createClient({ url: `file:${databasePath}` });

  try {
    const migrationNames = (await readdir(migrationRoot))
      .filter((name) => name.endsWith(".sql"))
      .sort();
    for (const name of migrationNames) {
      await client.executeMultiple(await readFile(new URL(name, migrationRoot), "utf8"));
    }
    await client.close();

    process.env.TURSO_DATABASE_URL = `file:${databasePath}`;
    process.env.ADMIN_DEV_BYPASS = "true";
    process.env.ADMIN_DEV_LABEL = "Test owner";
    process.env.NODE_ENV = "test";
    delete process.env.VERCEL;

    const collectionsApi = (await import("../.test-build/api/admin/collections/index.js")).default;
    const collectionApi = (await import("../.test-build/api/admin/collections/[collectionKey]/index.js")).default;
    const itemsApi = (await import("../.test-build/api/admin/collections/[collectionKey]/items.js")).default;
    const itemApi = (await import("../.test-build/api/admin/collections/[collectionKey]/items/[itemId].js")).default;

    const collection = {
      key: "journal",
      nameSingular: "Journal entry",
      namePlural: "Journal entries",
      description: "Studio journal.",
      displayFieldKey: "title",
      isSystem: false,
      status: "active",
      fields: [{
        key: "title",
        label: "Title",
        fieldType: "short_text",
        required: true,
        position: 0,
        isSystem: false,
        validation: { maxLength: 100 },
      }],
    };

    const rejected = await collectionsApi.fetch(new Request(
      "http://localhost/api/admin/collections",
      { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(collection) },
    ));
    assert.equal(rejected.status, 403);

    const created = await responseData(await collectionsApi.fetch(new Request(
      "http://localhost/api/admin/collections",
      {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost" },
        body: JSON.stringify(collection),
      },
    )));
    assert.equal(created.response.status, 201);
    assert.equal(created.envelope.data.key, "journal");

    const definition = await responseData(await collectionApi.fetch(
      new Request("http://localhost/api/admin/collections/journal"),
    ));
    assert.equal(definition.response.status, 200);
    assert.equal(definition.envelope.data.fields[0].key, "title");

    const draft = await responseData(await itemsApi.fetch(new Request(
      "http://localhost/api/admin/collections/journal/items",
      {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost" },
        body: JSON.stringify({ title: "Field notes" }),
      },
    )));
    assert.equal(draft.response.status, 201);
    assert.equal(draft.envelope.data.data.title, "Field notes");

    const updated = await responseData(await itemApi.fetch(new Request(
      `http://localhost/api/admin/collections/journal/items/${draft.envelope.data.id}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json", origin: "http://localhost" },
        body: JSON.stringify({ version: 1, data: { title: "Updated field notes" } }),
      },
    )));
    assert.equal(updated.response.status, 200);
    assert.equal(updated.envelope.data.version, 2);
    assert.equal(updated.envelope.data.data.title, "Updated field notes");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
