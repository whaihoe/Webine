import { createClient } from "@libsql/client";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { changeItemStatus, createItem } from "../.test-build/server/cms-repository.js";
import { archiveAsset, createAsset, getAsset } from "../.test-build/server/media-repository.js";
import { listPublicProjects } from "../.test-build/server/public-content.js";

const projectRoot = new URL("../", import.meta.url);
const migrationRoot = new URL("migrations/", projectRoot);

async function withDatabase(run) {
  const directory = await mkdtemp(join(tmpdir(), "webine-media-flow-"));
  const client = createClient({ url: `file:${join(directory, "cms.sqlite")}` });
  try {
    for (const name of (await readdir(migrationRoot)).filter((entry) => entry.endsWith(".sql")).sort()) {
      await client.executeMultiple(await readFile(new URL(name, migrationRoot), "utf8"));
    }
    await run(client);
  } finally {
    await client.close();
    await rm(directory, { recursive: true, force: true });
  }
}

test("links uploaded media through draft, publish, public query and archive protection", async () => {
  await withDatabase(async (client) => {
    const asset = await createAsset({
      id: "asset_workflow", provider: "external", providerAssetId: "workflow.png", deliveryUrl: "/workflow.png",
      originalFilename: "workflow.png", mimeType: "image/png", byteSize: 1024, width: 1200, height: 800,
      altText: "Blue interface composition", caption: "", focalX: 0.5, focalY: 0.4, decorative: false,
    }, "owner", "request_asset", client);
    assert.equal(asset.status, "ready");

    const draft = await createItem("projects", {
      title: "Workflow project", slug: "workflow-project", client: "Concept study", project_kind: "concept",
      project_type: "category_web", year: 2026, services: ["service_design"],
      short_summary: "A complete media and publishing workflow check.", hero_image: "asset_workflow",
      card_theme: "dark", accent_colour: "#14b8a6", featured: true, featured_order: 0,
    }, "owner", "request_item", client);
    assert.equal((await getAsset("asset_workflow", client)).usageCount, 1);

    const published = await changeItemStatus("projects", draft.id, { action: "publish", version: draft.version }, "owner", "request_publish", client);
    assert.equal(published.status, "published");
    const publicProjects = await listPublicProjects({ featuredOnly: true }, client);
    assert.equal(publicProjects[0].slug, "workflow-project");
    assert.equal(publicProjects[0].accentColour, "#14b8a6");
    await assert.rejects(() => archiveAsset("asset_workflow", "owner", "request_archive", client), (error) => error.code === "ASSET_IN_USE");

    const unpublished = await changeItemStatus("projects", draft.id, { action: "unpublish", version: published.version }, "owner", "request_unpublish", client);
    assert.equal(unpublished.status, "draft");
    assert.equal((await listPublicProjects({}, client)).some((project) => project.slug === "workflow-project"), false);
    const archived = await archiveAsset("asset_workflow", "owner", "request_archive_after_unpublish", client);
    assert.equal(archived.archived, true);
  });
});
