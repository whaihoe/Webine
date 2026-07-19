import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.js";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

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
    root: new URL(".", projectRoot).pathname,
    cacheDir: cacheDirectory,
    configFile: false,
    plugins: [react()],
    appType: "custom",
    server: { middlewareMode: true, hmr: false, ws: false },
  });

  try {
    const [{ CollectionEditor }, { ItemEditor }, { WorkspaceShell }] = await Promise.all([
      server.ssrLoadModule("/src/components/admin/CollectionEditor.tsx"),
      server.ssrLoadModule("/src/components/admin/ItemEditor.tsx"),
      server.ssrLoadModule("/src/components/WorkspaceShell.tsx"),
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
      field("blocks", "content_blocks"),
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

    assert.match(collectionHtml, /Collection details/);
    assert.match(collectionHtml, /Add field/);
    assert.match(itemHtml, /Upload image/);
    assert.match(itemHtml, /type="datetime-local"/);
    assert.match(itemHtml, /type="color"/);
    assert.match(itemHtml, /One content entry per line/);
    assert.match(itemHtml, /Loading referenced items/);
    assert.equal((itemHtml.match(/<fieldset/g) ?? []).length, fields.length);
    assert.match(workspaceHtml, /aria-label="Webine Admin breadcrumb"/);
    assert.match(workspaceHtml, /href="\/admin">Admin<\/a>/);
    assert.match(workspaceHtml, /href="\/admin\/collections">Collections<\/a>/);
    assert.match(workspaceHtml, /href="\/admin\/collections\/projects\/items">Projects<\/a>/);
    assert.match(workspaceHtml, /aria-current="page">New item<\/span>/);
    assert.match(workspaceHtml, /href="\/">Return to website<\/a>/);
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
