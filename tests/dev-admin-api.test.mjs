import assert from "node:assert/strict";
import test from "node:test";
import { resolveAdminApiModule } from "../.test-build/dev/admin-api-development-plugin.js";

test("maps only protected writes to the local Worker adapter", () => {
  assert.equal(resolveAdminApiModule("/api/admin/session"), "/dev/worker-development-handler.ts");
  assert.equal(resolveAdminApiModule("/api/admin/dashboard"), "/dev/worker-development-handler.ts");
  assert.equal(resolveAdminApiModule("/api/admin/collections"), "/dev/worker-development-handler.ts");
  assert.equal(
    resolveAdminApiModule("/api/admin/collections/projects/items/item_123"),
    "/dev/worker-development-handler.ts",
  );
  assert.equal(resolveAdminApiModule("/api/enquiries"), "/dev/worker-development-handler.ts");
  assert.equal(resolveAdminApiModule("/api/projects"), undefined);
  assert.equal(resolveAdminApiModule("/api/projects/webine-identity-system"), undefined);
  assert.equal(resolveAdminApiModule("/api/site-settings"), undefined);
  assert.equal(resolveAdminApiModule("/api/media/asset-123"), "/dev/worker-development-handler.ts");
  assert.equal(resolveAdminApiModule("/robots.txt"), undefined);
  assert.equal(resolveAdminApiModule("/sitemap.xml"), undefined);
  assert.equal(resolveAdminApiModule("/api/unknown"), undefined);
});
