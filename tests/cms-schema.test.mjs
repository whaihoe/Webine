import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);
const migrationRoot = new URL("migrations/", projectRoot);

function runSql(databasePath, sql, json = false) {
  const result = spawnSync(
    "sqlite3",
    [...(json ? ["-json"] : []), databasePath],
    { input: sql, encoding: "utf8" },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || "SQLite command failed.");
  }

  return result.stdout.trim();
}

async function getMigrations() {
  const names = (await readdir(migrationRoot))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  return Promise.all(names.map(async (name) => ({
    name,
    sql: await readFile(new URL(name, migrationRoot), "utf8"),
  })));
}

async function withTemporaryDatabase(run) {
  const directory = await mkdtemp(join(tmpdir(), "webine-cms-"));
  const databasePath = join(directory, "cms.sqlite");

  try {
    await run(databasePath);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("creates the complete CMS schema from a clean database", async () => {
  const migrations = await getMigrations();

  await withTemporaryDatabase(async (databasePath) => {
    migrations.forEach((migration) => runSql(databasePath, migration.sql));

    const tables = JSON.parse(runSql(
      databasePath,
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;",
      true,
    ));
    const tableNames = tables.map((table) => table.name);

    for (const table of [
      "collections",
      "field_definitions",
      "collection_items",
      "item_snapshots",
      "item_references",
      "assets",
      "asset_usages",
      "audit_events",
      "enquiries",
      "enquiry_deduplication",
      "enquiry_rate_limits",
      "idempotency_keys",
    ]) {
      assert.ok(tableNames.includes(table), `${table} should exist`);
    }

    const systemCollections = JSON.parse(runSql(
      databasePath,
      "SELECT key FROM collections WHERE is_system = 1 ORDER BY key;",
      true,
    )).map((collection) => collection.key);
    assert.deepEqual(systemCollections, [
      "categories",
      "projects",
      "services",
      "site_settings",
    ]);

    const projectFieldCount = Number(runSql(
      databasePath,
      "SELECT count(*) FROM field_definitions WHERE collection_id = 'collection_projects';",
    ));
    assert.equal(projectFieldCount, 28);

    const caseStudyFields = JSON.parse(runSql(
      databasePath,
      "SELECT key FROM field_definitions WHERE id IN ('project_industry', 'project_location', 'project_duration', 'project_completed_on', 'project_platform', 'project_about_client') ORDER BY position;",
      true,
    )).map((field) => field.key);
    assert.deepEqual(caseStudyFields, [
      "industry",
      "location",
      "duration",
      "completed_on",
      "platform",
      "about_client",
    ]);

    const singletonCount = Number(runSql(
      databasePath,
      "SELECT count(*) FROM collection_items WHERE id = 'item_site_settings';",
    ));
    assert.equal(singletonCount, 1);

    const siteSettings = JSON.parse(runSql(
      databasePath,
      "SELECT status, data_json, published_data_json FROM collection_items WHERE id = 'item_site_settings';",
      true,
    ))[0];
    assert.equal(siteSettings.status, "published");
    assert.equal(
      JSON.parse(siteSettings.data_json).home_hero_heading_before,
      "Make the ordinary",
    );
    assert.equal(
      JSON.parse(siteSettings.published_data_json).contact_heading,
      "Have something worth making unmistakable?",
    );
    assert.equal(Number(runSql(
      databasePath,
      "SELECT required FROM field_definitions WHERE id = 'settings_contact_email';",
    )), 0);

    assert.throws(() => runSql(
      databasePath,
      "INSERT INTO collection_items (id, collection_id, data_json, created_by, updated_by) VALUES ('bad', 'collection_projects', 'not-json', 'test', 'test');",
    ), /CHECK constraint failed/);
  });
});

test("upgrades an existing core database without losing content", async () => {
  const migrations = await getMigrations();

  await withTemporaryDatabase(async (databasePath) => {
    runSql(databasePath, migrations[0].sql);
    runSql(
      databasePath,
      "INSERT INTO collections (id, key, name_singular, name_plural, display_field_key) VALUES ('custom_notes', 'notes', 'Note', 'Notes', 'title');",
    );

    migrations.slice(1).forEach((migration) =>
      runSql(databasePath, migration.sql),
    );

    const customCollection = JSON.parse(runSql(
      databasePath,
      "SELECT key, is_system FROM collections WHERE id = 'custom_notes';",
      true,
    ));
    assert.deepEqual(customCollection, [{ key: "notes", is_system: 0 }]);
  });
});

test("does not replace Site Settings that were edited before the defaults migration", async () => {
  const migrations = await getMigrations();

  await withTemporaryDatabase(async (databasePath) => {
    migrations.slice(0, -1).forEach((migration) =>
      runSql(databasePath, migration.sql),
    );
    runSql(
      databasePath,
      `UPDATE collection_items
       SET data_json = '{"home_hero_heading_before":"Owner wording"}'
       WHERE id = 'item_site_settings';`,
    );
    runSql(databasePath, migrations.at(-1).sql);

    const settings = JSON.parse(runSql(
      databasePath,
      "SELECT status, data_json FROM collection_items WHERE id = 'item_site_settings';",
      true,
    ))[0];
    assert.equal(settings.status, "draft");
    assert.equal(
      JSON.parse(settings.data_json).home_hero_heading_before,
      "Owner wording",
    );
  });
});

test("validates collection changes and item data on the server boundary", async () => {
  const source = await readFile(
    new URL("src/cms/schema.ts", projectRoot),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const cms = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
  );

  const collection = {
    key: "projects",
    nameSingular: "Project",
    namePlural: "Projects",
    displayFieldKey: "title",
    slugFieldKey: "slug",
    isSystem: true,
    status: "active",
    fields: [
      {
        key: "title",
        label: "Title",
        fieldType: "short_text",
        required: true,
        position: 0,
        isSystem: true,
        validation: { maxLength: 120 },
      },
      {
        key: "slug",
        label: "Slug",
        fieldType: "slug",
        required: true,
        position: 1,
        isSystem: true,
        validation: { unique: true },
      },
      {
        key: "hero_image",
        label: "Hero image",
        fieldType: "image",
        required: true,
        position: 2,
        isSystem: true,
        validation: { requireAltText: true },
      },
    ],
  };

  assert.deepEqual(cms.validateCollectionDefinition(collection), []);
  assert.deepEqual(
    cms.validateItemData(
      collection,
      { title: "Northstar", slug: "northstar", hero_image: "asset_1" },
      { assets: { asset_1: { status: "ready", altText: "Project homepage" } } },
    ),
    [],
  );

  const invalidItem = cms.validateItemData(
    collection,
    { title: "Northstar", slug: "North Star", hero_image: "asset_1", extra: true },
    { assets: { asset_1: { status: "ready", altText: "" } } },
  );
  assert.deepEqual(
    new Set(invalidItem.map((entry) => entry.code)),
    new Set(["INVALID_SLUG", "ALT_TEXT_REQUIRED", "UNKNOWN_FIELD"]),
  );

  const archivedSystemCollection = {
    ...collection,
    status: "archived",
  };
  const mutationIssues = cms.validateCollectionMutation(
    collection,
    archivedSystemCollection,
    { itemCount: 1, valuesByField: {} },
  );
  assert.ok(mutationIssues.some((entry) => entry.code === "SYSTEM_COLLECTION"));
  assert.ok(cms.canArchiveReferencedEntity(1).some(
    (entry) => entry.code === "PUBLISHED_USAGE",
  ));
});
