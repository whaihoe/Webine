import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("keeps the Vercel deployment below the Hobby function entrypoint limit", async () => {
  const apiRoot = new URL("api/", projectRoot);
  const functionFiles = (await readdir(apiRoot))
    .filter((name) => name.endsWith(".ts"))
    .sort();

  assert.deepEqual(functionFiles, [
    "admin.ts",
    "enquiries.ts",
    "media.ts",
    "projects.ts",
    "robots.ts",
    "site-settings.ts",
    "sitemap.ts",
  ]);
  assert.ok(functionFiles.length <= 12);
});

test("restores public API paths after Vercel rewrites", async () => {
  const { restoreRewrittenRequest } = await import(
    "../.test-build/server/api-route-request.js"
  );

  const admin = restoreRewrittenRequest(
    new Request(
      "https://webine.example/api/admin?__webine_route=preview/projects/item_123",
    ),
    "/api/admin",
  );
  assert.equal(
    admin.url,
    "https://webine.example/api/admin/preview/projects/item_123",
  );

  const project = restoreRewrittenRequest(
    new Request("https://webine.example/api/projects?__webine_route=webine-identity-system"),
    "/api/projects",
  );
  assert.equal(
    project.url,
    "https://webine.example/api/projects/webine-identity-system",
  );

  const media = restoreRewrittenRequest(
    new Request("https://webine.example/api/media?__webine_route=asset-123"),
    "/api/media",
  );
  assert.equal(media.url, "https://webine.example/api/media/asset-123");
});

test("rewrites existing public API URLs to the consolidated functions", async () => {
  const configuration = JSON.parse(
    await readFile(new URL("vercel.json", projectRoot), "utf8"),
  );

  assert.deepEqual(configuration.rewrites.slice(2, 5), [
    {
      source: "/api/admin/:path*",
      destination: "/api/admin?__webine_route=:path*",
    },
    {
      source: "/api/projects/:path*",
      destination: "/api/projects?__webine_route=:path*",
    },
    {
      source: "/api/media/:path*",
      destination: "/api/media?__webine_route=:path*",
    },
  ]);
});
