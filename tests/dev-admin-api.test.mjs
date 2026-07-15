import assert from "node:assert/strict";
import test from "node:test";
import { resolveAdminApiModule } from "../.test-build/dev/admin-api-development-plugin.js";

test("maps local Admin requests to the same Vercel Function modules", () => {
  assert.equal(resolveAdminApiModule("/api/admin/session"), "/api/admin/session.ts");
  assert.equal(resolveAdminApiModule("/api/admin/dashboard"), "/api/admin/dashboard.ts");
  assert.equal(resolveAdminApiModule("/api/admin/collections"), "/api/admin/collections/index.ts");
  assert.equal(
    resolveAdminApiModule("/api/admin/collections/projects"),
    "/api/admin/collections/[collectionKey]/index.ts",
  );
  assert.equal(
    resolveAdminApiModule("/api/admin/collections/projects/items"),
    "/api/admin/collections/[collectionKey]/items.ts",
  );
  assert.equal(
    resolveAdminApiModule("/api/admin/collections/projects/items/item_123"),
    "/api/admin/collections/[collectionKey]/items/[itemId].ts",
  );
  assert.equal(resolveAdminApiModule("/api/enquiries"), "/api/enquiries.ts");
  assert.equal(resolveAdminApiModule("/api/site-settings"), "/api/site-settings.ts");
  assert.equal(resolveAdminApiModule("/api/admin/enquiries"), "/api/admin/enquiries/index.ts");
  assert.equal(
    resolveAdminApiModule("/api/admin/enquiries/enquiry-123/retry"),
    "/api/admin/enquiries/[enquiryId]/retry.ts",
  );
  assert.equal(resolveAdminApiModule("/robots.txt"), "/api/robots.ts");
  assert.equal(resolveAdminApiModule("/sitemap.xml"), "/api/sitemap.ts");
  assert.equal(resolveAdminApiModule("/api/admin/unknown"), undefined);
});
