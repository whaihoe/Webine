import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = new URL("../", import.meta.url);

function field(key, fieldType, extras = {}) {
  return {
    key,
    label: key.replace(/_/g, " "),
    fieldType,
    required: false,
    position: 0,
    isSystem: false,
    validation: {},
    ...extras,
  };
}

test("renders the collection builder and every generated item control", async () => {
  const cacheDirectory = await mkdtemp(join(tmpdir(), "webine-vite-test-"));
  const server = await createServer({
    root: fileURLToPath(new URL(".", projectRoot)),
    cacheDir: cacheDirectory,
    configFile: false,
    plugins: [react()],
    appType: "custom",
    server: { middlewareMode: true, hmr: false, ws: false },
  });

  try {
    const [{ CollectionEditor }, { ItemEditor }, { WorkspaceShell }, { ProjectStoryBlock }] = await Promise.all([
      server.ssrLoadModule("/src/components/admin/CollectionEditor.tsx"),
      server.ssrLoadModule("/src/components/admin/ItemEditor.tsx"),
      server.ssrLoadModule("/src/components/WorkspaceShell.tsx"),
      server.ssrLoadModule("/src/components/projects/ProjectStoryBlock.tsx"),
    ]);
    const fields = [
      field("title", "short_text", { required: true }),
      field("summary", "long_text"),
      field("story", "rich_text"),
      field("score", "number"),
      field("featured", "boolean"),
      field("launch_at", "date_time"),
      field("category", "select", { options: [{ key: "work", label: "Work" }] }),
      field("tags", "multi_select", { options: [{ key: "design", label: "Design" }] }),
      field("website", "url"),
      field("email", "email"),
      field("slug", "slug"),
      field("accent", "colour"),
      field("hero_image", "image"),
      field("gallery", "gallery"),
      field("related", "reference", { validation: { targetCollection: "projects" } }),
      field("related_many", "multi_reference", { validation: { targetCollection: "projects" } }),
      field("metadata", "field_group"),
      field("credits", "repeatable_group"),
      field("content_blocks", "content_blocks"),
    ].map((entry, position) => ({ ...entry, position }));
    const collection = {
      key: "render_test",
      nameSingular: "Render test",
      namePlural: "Render tests",
      description: "Generated form coverage.",
      displayFieldKey: "title",
      slugFieldKey: "slug",
      isSystem: false,
      status: "active",
      version: 1,
      fields,
    };

    const collectionHtml = renderToStaticMarkup(
      React.createElement(StaticRouter, { location: "/admin/collections/new" }, React.createElement(CollectionEditor)),
    );
    const itemHtml = renderToStaticMarkup(
      React.createElement(StaticRouter, { location: "/admin/collections/render_test/items/new" }, React.createElement(ItemEditor, { collection })),
    );
    const imageBlockHtml = renderToStaticMarkup(
      React.createElement(StaticRouter, { location: "/admin/collections/render_test/items/item_case" }, React.createElement(ItemEditor, {
        collection,
        item: {
          id: "item_case",
          slug: null,
          status: "draft",
          version: 1,
          updatedAt: "2026-07-19T00:00:00.000Z",
          data: { content_blocks: [{ type: "image", assetId: "asset_case", heading: "Project goal", text: "Caption", layout: "full" }] },
        },
      })),
    );
    const workspaceHtml = renderToStaticMarkup(
      React.createElement(
        StaticRouter,
        { location: "/admin/collections/projects/items/new" },
        React.createElement(
          WorkspaceShell,
          { title: "Webine Admin" },
          React.createElement("p", null, "Editor content"),
        ),
      ),
    );
    const bentoHtml = renderToStaticMarkup(
      React.createElement(ProjectStoryBlock, {
        block: { type: "bento", heading: "Responsive compositions", text: "Mixed project views." },
        blockIndex: 0,
        images: [
          { id: "wide", url: "/wide.png", altText: "Wide view", width: 1800, height: 900 },
          { id: "portrait", url: "/portrait.png", altText: "Portrait view", width: 800, height: 1200 },
          { id: "square", url: "/square.png", altText: "Square view", width: 1000, height: 1000 },
        ],
      }),
    );

    assert.match(collectionHtml, /Collection details/);
    assert.match(collectionHtml, /Add field/);
    assert.match(itemHtml, /Upload image/);
    assert.match(itemHtml, /type="datetime-local"/);
    assert.match(itemHtml, /type="color"/);
    assert.match(itemHtml, /One content entry per line/);
    assert.match(itemHtml, /Loading referenced items/);
    assert.match(imageBlockHtml, /Image section heading/);
    assert.match(imageBlockHtml, /Optional image caption/);
    assert.match(imageBlockHtml, /option value="bento">Bento/);
    assert.match(imageBlockHtml, /Image layout/);
    assert.match(imageBlockHtml, /option value="full" selected="">Full width/);
    assert.match(bentoHtml, /data-block-type="bento"/);
    assert.match(bentoHtml, /data-image-count="3"/);
    assert.match(bentoHtml, /data-image-shape="wide"/);
    assert.match(bentoHtml, /data-image-shape="portrait"/);
    assert.match(bentoHtml, /data-image-shape="square"/);
    assert.match(bentoHtml, /style="aspect-ratio:1800 \/ 900"/);
    assert.match(bentoHtml, /style="aspect-ratio:800 \/ 1200"/);
    assert.match(bentoHtml, /style="aspect-ratio:1000 \/ 1000"/);
    assert.equal((itemHtml.match(/<fieldset/g) ?? []).length, fields.length);
    assert.match(workspaceHtml, /aria-label="Webine Admin breadcrumb"/);
    assert.match(workspaceHtml, /href="\/admin"[^>]*>Admin<\/a>/);
    assert.match(workspaceHtml, /href="\/admin\/collections"[^>]*>Collections<\/a>/);
    assert.match(workspaceHtml, /href="\/admin\/collections\/projects\/items"[^>]*>Projects<\/a>/);
    assert.match(workspaceHtml, /aria-current="page">New item<\/span>/);
    assert.match(workspaceHtml, /href="\/"[^>]*>Return to website<\/a>/);
  } finally {
    await server.close();
    await rm(cacheDirectory, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100,
    });
  }
});
