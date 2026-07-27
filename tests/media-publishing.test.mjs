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
    await rm(directory, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 100,
    });
  }
}

test("links uploaded media through draft, publish, public query and archive protection", async () => {
  await withDatabase(async (client) => {
    const asset = await createAsset({
      id: "asset_workflow", provider: "external", providerAssetId: "workflow.png", deliveryUrl: "/workflow.png",
      originalFilename: "workflow.png", mimeType: "image/png", byteSize: 1024, width: 1200, height: 800,
      altText: "Blue interface composition", caption: "", focalX: 0.5, focalY: 0.4, decorative: false,
    }, "owner", "request_asset", client);
    const portraitAsset = await createAsset({
      id: "asset_portrait", provider: "external", providerAssetId: "portrait.png", deliveryUrl: "/portrait.png",
      originalFilename: "portrait.png", mimeType: "image/png", byteSize: 1024, width: 800, height: 1200,
      altText: "Portrait interface composition", caption: "", focalX: 0.5, focalY: 0.5, decorative: false,
    }, "owner", "request_portrait_asset", client);
    const wideAsset = await createAsset({
      id: "asset_wide", provider: "external", providerAssetId: "wide.png", deliveryUrl: "/wide.png",
      originalFilename: "wide.png", mimeType: "image/png", byteSize: 1024, width: 1600, height: 800,
      altText: "Wide interface composition", caption: "", focalX: 0.5, focalY: 0.5, decorative: false,
    }, "owner", "request_wide_asset", client);
    const squareAsset = await createAsset({
      id: "asset_square", provider: "external", providerAssetId: "square.png", deliveryUrl: "/square.png",
      originalFilename: "square.png", mimeType: "image/png", byteSize: 1024, width: 1000, height: 1000,
      altText: "Square interface composition", caption: "", focalX: 0.5, focalY: 0.5, decorative: false,
    }, "owner", "request_square_asset", client);
    const videoAsset = await createAsset({
      id: "asset_video", provider: "external", providerAssetId: "motion.mp4", deliveryUrl: "/motion.mp4",
      originalFilename: "motion.mp4", mimeType: "video/mp4", byteSize: 2048, width: 1920, height: 1080,
      altText: "Interface interaction sequence", caption: "", focalX: 0.5, focalY: 0.5, decorative: false,
    }, "owner", "request_video_asset", client);
    assert.equal(asset.status, "ready");
    assert.equal(portraitAsset.status, "ready");
    assert.equal(wideAsset.status, "ready");
    assert.equal(squareAsset.status, "ready");
    assert.equal(videoAsset.status, "ready");

    await assert.rejects(
      () => createItem("projects", {
        title: "Too many images", slug: "too-many-images", client: "Concept study", project_kind: "concept",
        project_type: "category_web", year: 2026, services: ["service_design"],
        short_summary: "Image block validation.", hero_image: "asset_workflow",
        content_blocks: [{
          type: "image",
          assetIds: ["asset_workflow", "asset_portrait", "asset_wide", "asset_square"],
        }],
      }, "owner", "request_too_many", client),
      (error) => error.code === "VALIDATION_FAILED"
        && error.issues.some((issue) => issue.code === "TOO_MANY_IMAGES"),
    );
    await assert.rejects(
      () => createItem("projects", {
        title: "Wrong video media", slug: "wrong-video-media", client: "Concept study", project_kind: "concept",
        project_type: "category_web", year: 2026, services: ["service_design"],
        short_summary: "Video block validation.", hero_image: "asset_workflow",
        content_blocks: [{ type: "video", assetId: "asset_workflow" }],
      }, "owner", "request_wrong_video", client),
      (error) => error.code === "VALIDATION_FAILED"
        && error.issues.some((issue) => issue.code === "VIDEO_REQUIRED"),
    );
    await assert.rejects(
      () => createItem("projects", {
        title: "Incomplete bento", slug: "incomplete-bento", client: "Concept study", project_kind: "concept",
        project_type: "category_web", year: 2026, services: ["service_design"],
        short_summary: "Bento block validation.", hero_image: "asset_workflow",
        content_blocks: [{ type: "bento", assetIds: ["asset_portrait"] }],
      }, "owner", "request_incomplete_bento", client),
      (error) => error.code === "VALIDATION_FAILED"
        && error.issues.some((issue) => issue.code === "MEDIA_REQUIRED"),
    );

    const draft = await createItem("projects", {
      title: "Workflow project", slug: "workflow-project", client: "Concept study", project_kind: "concept",
      project_type: "category_web", year: 2026, services: ["service_design"],
      short_summary: "A complete media and publishing workflow check.", hero_image: "asset_workflow",
      hover_image: "asset_video",
      card_theme: "dark", accent_colour: "#14b8a6", featured: true, featured_order: 0,
      content_blocks: [
        { type: "image", assetIds: ["asset_workflow", "asset_portrait", "asset_video"], layout: "wide" },
        { type: "bento", assetIds: ["asset_portrait", "asset_wide"] },
        { type: "video", assetId: "asset_video" },
      ],
    }, "owner", "request_item", client);
    assert.equal((await getAsset("asset_workflow", client)).usageCount, 2);
    assert.equal((await getAsset("asset_portrait", client)).usageCount, 2);
    assert.equal((await getAsset("asset_wide", client)).usageCount, 1);
    assert.equal((await getAsset("asset_video", client)).usageCount, 3);

    const published = await changeItemStatus("projects", draft.id, { action: "publish", version: draft.version }, "owner", "request_publish", client);
    assert.equal(published.status, "published");
    const publicProjects = await listPublicProjects({ featuredOnly: true }, client);
    assert.equal(publicProjects[0].slug, "workflow-project");
    assert.equal(publicProjects[0].accentColour, "#14b8a6");
    assert.equal(publicProjects[0].contentBlocks[0].images.length, 3);
    assert.equal(publicProjects[0].contentBlocks[0].images[2].mimeType, "video/mp4");
    assert.equal(publicProjects[0].contentBlocks[1].images.length, 2);
    assert.equal(publicProjects[0].contentBlocks[2].images[0].mimeType, "video/mp4");
    assert.equal(publicProjects[0].hoverImage.mimeType, "video/mp4");
    await assert.rejects(() => archiveAsset("asset_workflow", "owner", "request_archive", client), (error) => error.code === "ASSET_IN_USE");

    const unpublished = await changeItemStatus("projects", draft.id, { action: "unpublish", version: published.version }, "owner", "request_unpublish", client);
    assert.equal(unpublished.status, "draft");
    assert.equal((await listPublicProjects({}, client)).some((project) => project.slug === "workflow-project"), false);
    const archived = await archiveAsset("asset_workflow", "owner", "request_archive_after_unpublish", client);
    assert.equal(archived.archived, true);
  });
});
