import assert from "node:assert/strict";
import test from "node:test";
import { resolveAdminApiModule } from "../.test-build/dev/admin-api-development-plugin.js";

test("maps local requests to the consolidated Vercel Function entrypoints", () => {
  assert.equal(resolveAdminApiModule("/api/admin/session"), "/api/admin.ts");
  assert.equal(resolveAdminApiModule("/api/admin/dashboard"), "/api/admin.ts");
  assert.equal(resolveAdminApiModule("/api/admin/collections"), "/api/admin.ts");
  assert.equal(
    resolveAdminApiModule("/api/admin/collections/projects/items/item_123"),
    "/api/admin.ts",
  );
  assert.equal(resolveAdminApiModule("/api/enquiries"), "/api/enquiries.ts");
  assert.equal(resolveAdminApiModule("/api/projects"), "/api/projects.ts");
  assert.equal(resolveAdminApiModule("/api/projects/webine-identity-system"), "/api/projects.ts");
  assert.equal(resolveAdminApiModule("/api/site-settings"), "/api/site-settings.ts");
  assert.equal(resolveAdminApiModule("/api/media/asset-123"), "/api/media.ts");
  assert.equal(resolveAdminApiModule("/robots.txt"), "/api/robots.ts");
  assert.equal(resolveAdminApiModule("/sitemap.xml"), "/api/sitemap.ts");
  assert.equal(resolveAdminApiModule("/api/unknown"), undefined);
});
