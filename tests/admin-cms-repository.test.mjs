import { createClient } from "@libsql/client";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  CmsRepositoryError,
  changeItemStatus,
  createCollection,
  createItem,
  getCollectionDefinition,
  getItem,
  purgeItem,
  updateCollection,
  updateItem,
} from "../.test-build/server/cms-repository.js";
import { listCollectionItems } from "../.test-build/server/database.js";

const projectRoot = new URL("../", import.meta.url);
const migrationRoot = new URL("migrations/", projectRoot);

async function withDatabase(run) {
  const directory = await mkdtemp(join(tmpdir(), "webine-admin-cms-"));
  const client = createClient({ url: `file:${join(directory, "cms.sqlite")}` });

  try {
    const migrationNames = (await readdir(migrationRoot))
      .filter((name) => name.endsWith(".sql"))
      .sort();
    for (const name of migrationNames) {
      await client.executeMultiple(await readFile(new URL(name, migrationRoot), "utf8"));
    }
    await run(client, join(directory, "cms.sqlite"));
  } finally {
    await client.close();
    await rm(directory, { recursive: true, force: true });
  }
}

const notesCollection = {
  key: "notes",
  nameSingular: "Note",
  namePlural: "Notes",
  description: "Structured studio notes.",
  displayFieldKey: "title",
  slugFieldKey: "slug",
  isSystem: false,
  status: "active",
  fields: [
    {
      key: "title",
      label: "Title",
      fieldType: "short_text",
      required: true,
      position: 0,
      isSystem: false,
      validation: { maxLength: 100 },
    },
    {
      key: "slug",
      label: "Slug",
      fieldType: "slug",
      required: true,
      position: 1,
      isSystem: false,
      validation: { unique: true },
    },
  ],
};

test("creates and updates a custom collection through the repository contract", async () => {
  await withDatabase(async (client) => {
    const created = await createCollection(notesCollection, "user_owner", "request_create", client);
    assert.equal(created.key, "notes");
    assert.equal(created.version, 1);
    assert.equal(created.fields.length, 2);

    const updated = await updateCollection("notes", {
      ...created,
      description: "Notes and working observations.",
      fields: [
        created.fields[1],
        created.fields[0],
        {
          key: "category",
          label: "Category",
          fieldType: "select",
          required: false,
          position: 2,
          isSystem: false,
          validation: {},
          options: [
            { key: "research", label: "Research" },
            { key: "delivery", label: "Delivery" },
          ],
        },
      ],
    }, "user_owner", "request_update", client);

    assert.equal(updated.version, 2);
    assert.deepEqual(updated.fields.map((field) => field.key), [
      "slug",
      "title",
      "category",
    ]);

    await assert.rejects(
      () => createCollection(notesCollection, "user_owner", "request_duplicate", client),
      (error) => error instanceof CmsRepositoryError && error.code === "COLLECTION_KEY_EXISTS",
    );
  });
});

test("saves incomplete drafts, validates entered values and rejects stale writes", async () => {
  await withDatabase(async (client) => {
    await createCollection(notesCollection, "user_owner", "request_collection", client);
    const created = await createItem("notes", { title: "First note" }, "user_owner", "request_item", client);
    assert.equal(created.status, "draft");
    assert.equal(created.slug, null);

    await assert.rejects(
      () => updateItem("notes", created.id, {
        version: created.version,
        data: { title: 42 },
      }, "user_owner", "request_invalid", client),
      (error) => error instanceof CmsRepositoryError && error.code === "VALIDATION_FAILED",
    );

    const updated = await updateItem("notes", created.id, {
      version: created.version,
      data: { title: "First note", slug: "first-note" },
    }, "user_owner", "request_update", client);
    assert.equal(updated.version, 2);
    assert.equal(updated.slug, "first-note");
    assert.deepEqual((await getItem("notes", created.id, client)).data, {
      title: "First note",
      slug: "first-note",
    });

    await assert.rejects(
      () => updateItem("notes", created.id, {
        version: 1,
        data: { title: "Stale edit" },
      }, "user_owner", "request_stale", client),
      (error) => error instanceof CmsRepositoryError && error.code === "VERSION_CONFLICT",
    );

    const audits = await client.execute("SELECT action FROM audit_events ORDER BY created_at");
    assert.deepEqual(audits.rows.map((row) => row.action), [
      "collection.create",
      "item.create",
      "item.update",
    ]);
  });
});

test("protects system schemas from incompatible collection edits", async () => {
  await withDatabase(async (client) => {
    const projects = await getCollectionDefinition("projects", client);
    await assert.rejects(
      () => updateCollection("projects", {
        ...projects,
        status: "archived",
      }, "user_owner", "request_system", client),
      (error) => error instanceof CmsRepositoryError &&
        error.issues.some((issue) => issue.code === "SYSTEM_COLLECTION"),
    );
  });
});

test("allows only one concurrent save for the same item version", async () => {
  await withDatabase(async (client, databasePath) => {
    const secondClient = createClient({ url: `file:${databasePath}` });
    try {
      await createCollection(notesCollection, "user_owner", "request_collection", client);
      const created = await createItem("notes", { title: "Concurrent note", slug: "concurrent-note" }, "user_owner", "request_item", client);
      const attempts = await Promise.allSettled([
        updateItem("notes", created.id, { version: created.version, data: { title: "First writer", slug: "concurrent-note" } }, "user_owner", "request_first", client),
        updateItem("notes", created.id, { version: created.version, data: { title: "Second writer", slug: "concurrent-note" } }, "user_owner", "request_second", secondClient),
      ]);
      assert.equal(attempts.filter((attempt) => attempt.status === "fulfilled").length, 1);
      const rejected = attempts.find((attempt) => attempt.status === "rejected");
      assert.ok(rejected && rejected.status === "rejected");
      assert.equal(rejected.reason?.code, "VERSION_CONFLICT");
      const audits = await client.execute("SELECT count(*) AS total FROM audit_events WHERE action = 'item.update'");
      assert.equal(Number(audits.rows[0].total), 1);
    } finally {
      await secondClient.close();
    }
  });
});

test("archives published items before allowing a permanent purge", async () => {
  await withDatabase(async (client) => {
    await createCollection(notesCollection, "user_owner", "request_collection", client);
    const draft = await createItem(
      "notes",
      { title: "Disposable note", slug: "disposable-note" },
      "user_owner",
      "request_item",
      client,
    );
    const published = await changeItemStatus(
      "notes",
      draft.id,
      { action: "publish", version: draft.version },
      "user_owner",
      "request_publish",
      client,
    );

    await assert.rejects(
      () => purgeItem(
        "notes",
        published.id,
        { version: published.version },
        "user_owner",
        "request_early_purge",
        client,
      ),
      (error) => error instanceof CmsRepositoryError &&
        error.code === "ARCHIVE_REQUIRED",
    );

    const archived = await changeItemStatus(
      "notes",
      published.id,
      { action: "archive", version: published.version },
      "user_owner",
      "request_archive",
      client,
    );
    assert.equal(archived.status, "archived");
    assert.equal(
      (await listCollectionItems("notes", client)).find((item) => item.id === archived.id).status,
      "archived",
    );
    assert.deepEqual(
      await purgeItem(
        "notes",
        archived.id,
        { version: archived.version },
        "user_owner",
        "request_purge",
        client,
      ),
      { id: archived.id, purged: true },
    );
    assert.equal(await getItem("notes", archived.id, client), null);

    const audit = await client.execute({
      sql: "SELECT action FROM audit_events WHERE entity_id = ? ORDER BY created_at",
      args: [archived.id],
    });
    assert.ok(audit.rows.some((row) => row.action === "item.purge"));
  });
});
