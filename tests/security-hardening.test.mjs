import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { authenticateAdminRequest } from "../.test-build/server/auth.js";
import {
  assertBlobCompletionMetadata,
  parseUploadIntent,
  routeAdminRequest,
} from "../.test-build/server/api-routes/admin.js";
import { handleEnquiryRequest } from "../.test-build/server/api-routes/enquiries.js";
import { routeProjectRequest } from "../.test-build/server/api-routes/projects.js";
import { handleSiteSettingsRequest } from "../.test-build/server/api-routes/site-settings.js";
import { getCanonicalSiteOrigin } from "../.test-build/server/canonical-origin.js";
import { createEnquiry } from "../.test-build/server/enquiry-service.js";
import { getPublicProject } from "../.test-build/server/public-content.js";
import { readJsonRequest, RequestBodyError } from "../.test-build/server/responses.js";
import { verifyTurnstile } from "../.test-build/server/turnstile.js";

const projectRoot = new URL("../", import.meta.url);

function noDatabaseClient() {
  return {
    execute() { throw new Error("database should not be called"); },
    batch() { throw new Error("database should not be called"); },
  };
}

function validEnquiry(overrides = {}) {
  return {
    name: "Webine prospect",
    email: "prospect@example.com",
    company: "Example business",
    website: "https://example.com",
    serviceInterest: "New website",
    budgetRange: "Still defining",
    timeline: "Flexible",
    details: "A considered project outline with enough useful detail.",
    consent: true,
    consentVersion: "2026-07-28",
    sourcePage: "/contact",
    websiteConfirm: "",
    turnstileToken: "test-token",
    ...overrides,
  };
}

test("rejects invalid public project queries before data access", async () => {
  let calls = 0;
  const operations = {
    list: async () => { calls += 1; return []; },
    get: async () => { calls += 1; return null; },
  };
  for (const query of ["?cacheBust=1", "?featured=true&featured=true", "?featured=false", `?${"a".repeat(300)}=1`]) {
    const response = await routeProjectRequest(new Request(`https://example.com/api/projects${query}`), operations);
    assert.equal(response.status, 400);
  }
  assert.equal(calls, 0);
});

test("uses separate browser and CDN cache contracts for public content", async () => {
  const response = await routeProjectRequest(
    new Request("https://example.com/api/projects?featured=true"),
    { list: async () => [], get: async () => null },
  );
  assert.equal(response.headers.get("cache-control"), "public, max-age=60");
  assert.equal(response.headers.get("cdn-cache-control"), "public, s-maxage=300, stale-while-revalidate=3600");
  assert.equal(response.headers.get("vercel-cdn-cache-control"), "public, s-maxage=300, stale-while-revalidate=3600");
});

test("rejects site-settings query variants before loading settings", async () => {
  let called = false;
  const response = await handleSiteSettingsRequest(
    new Request("https://example.com/api/site-settings?cache=miss"),
    async () => { called = true; return {}; },
  );
  assert.equal(response.status, 400);
  assert.equal(called, false);
});

test("performs one targeted query for a missing public project", async () => {
  const statements = [];
  const project = await getPublicProject("random-project", {
    async execute(statement) {
      statements.push(statement);
      return { rows: [] };
    },
  });
  assert.equal(project, null);
  assert.equal(statements.length, 1);
  assert.match(statements[0].sql, /slug = \?/);
  assert.doesNotMatch(statements[0].sql, /FROM assets/);
});

test("enforces declared and streamed JSON limits", async () => {
  await assert.rejects(
    () => readJsonRequest(new Request("https://example.com/api/enquiries", {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": "33000" },
      body: "{}",
    }), 32 * 1024),
    (error) => error instanceof RequestBodyError && error.status === 413,
  );
  await assert.rejects(
    () => readJsonRequest(new Request("https://example.com/api/enquiries", {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": "2" },
      body: JSON.stringify({ value: "x".repeat(33_000) }),
    }), 32 * 1024),
    (error) => error instanceof RequestBodyError && error.status === 413,
  );
});

test("rejects honeypots and malformed fields before Turnstile or database work", async () => {
  let verifierCalls = 0;
  const verifyHuman = async () => { verifierCalls += 1; };
  assert.deepEqual(
    await createEnquiry({ websiteConfirm: "bot" }, new Request("http://localhost/api/enquiries"), "bot", noDatabaseClient(), verifyHuman),
    { accepted: true, duplicate: false },
  );
  await assert.rejects(
    () => createEnquiry(validEnquiry({ email: "invalid" }), new Request("http://localhost/api/enquiries"), "invalid", noDatabaseClient(), verifyHuman),
    (error) => error.code === "EMAIL_INVALID",
  );
  assert.equal(verifierCalls, 0);
});

test("fails Turnstile closed and checks hostname and action", async () => {
  const environment = {
    VERCEL: "1",
    TURNSTILE_SECRET_KEY: "test-secret",
    TURNSTILE_ALLOWED_HOSTNAMES: "madebywebine.com,www.madebywebine.com",
    TURNSTILE_EXPECTED_ACTION: "contact_enquiry",
  };
  await assert.rejects(
    () => verifyTurnstile("", new Request("https://www.madebywebine.com/api/enquiries"), environment),
    (error) => error.code === "TURNSTILE_REQUIRED",
  );
  await assert.rejects(
    () => verifyTurnstile("token", new Request("https://www.madebywebine.com/api/enquiries"), environment, async () => Response.json({ success: true, hostname: "evil.example", action: "contact_enquiry" })),
    (error) => error.code === "TURNSTILE_INVALID",
  );
  await verifyTurnstile(
    "token",
    new Request("https://www.madebywebine.com/api/enquiries"),
    environment,
    async () => Response.json({ success: true, hostname: "www.madebywebine.com", action: "contact_enquiry" }),
  );
  await assert.rejects(
    () => verifyTurnstile("token", new Request("https://www.madebywebine.com/api/enquiries"), environment, async () => {
      throw new DOMException("The operation timed out.", "TimeoutError");
    }),
    (error) => error.code === "TURNSTILE_INVALID",
  );
});

test("valid Turnstile verification reaches the application limiter", async () => {
  let databaseCalls = 0;
  await assert.rejects(
    () => createEnquiry(
      validEnquiry(),
      new Request("https://www.madebywebine.com/api/enquiries"),
      "valid-human",
      {
        async batch() { databaseCalls += 1; throw new Error("limiter reached"); },
        async execute() { databaseCalls += 1; throw new Error("limiter reached"); },
      },
      async () => {},
    ),
    /limiter reached/,
  );
  assert.equal(databaseCalls, 1);
});

test("rate-limited enquiry responses include Retry-After", async () => {
  const request = new Request("https://www.madebywebine.com/api/enquiries", {
    method: "POST",
    headers: { origin: "https://www.madebywebine.com", "content-type": "application/json" },
    body: JSON.stringify(validEnquiry()),
  });
  const response = await handleEnquiryRequest(request, async () => {
    const { CmsRepositoryError } = await import("../.test-build/server/cms-repository.js");
    throw new CmsRepositoryError("RATE_LIMITED", "Wait and try again.", 429);
  });
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "900");
});

test("rejects missing Admin credential carriers before Clerk", async () => {
  const result = await authenticateAdminRequest(
    new Request("https://www.madebywebine.com/api/admin/session"),
    {
      VERCEL: "1",
      ADMIN_USER_ID: "user_owner",
      CLERK_PUBLISHABLE_KEY: "pk_test_example",
      CLERK_SECRET_KEY: "sk_test_example",
      CLERK_AUTHORIZED_PARTIES: "https://www.madebywebine.com",
    },
  );
  assert.equal(result.ok, false);
  assert.equal(result.code, "ADMIN_SIGN_IN_REQUIRED");
});

test("rejects unknown Admin paths without authentication", async () => {
  const response = await routeAdminRequest(new Request("https://www.madebywebine.com/api/admin/not-a-route"));
  assert.equal(response.status, 404);
});

test("rejects invalid Admin methods before authentication", async () => {
  const response = await routeAdminRequest(new Request("https://www.madebywebine.com/api/admin/session", { method: "DELETE" }));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET");
});

test("keeps Clerk party and owner checks after the carrier precheck", async () => {
  const environment = {
    VERCEL: "1",
    ADMIN_USER_ID: "user_owner",
    CLERK_PUBLISHABLE_KEY: "pk_test_example",
    CLERK_SECRET_KEY: "sk_test_example",
    CLERK_AUTHORIZED_PARTIES: "https://www.madebywebine.com",
  };
  let clerkCalls = 0;
  const clerkFactory = () => ({
    async authenticateRequest() {
      clerkCalls += 1;
      return { isAuthenticated: true, toAuth: () => ({ userId: "user_owner" }) };
    },
  });
  const valid = await authenticateAdminRequest(
    new Request("https://www.madebywebine.com/api/admin/session", { headers: { cookie: "__session=test" } }),
    environment,
    clerkFactory,
  );
  assert.equal(valid.ok, true);
  assert.equal(clerkCalls, 1);

  const wrongParty = await authenticateAdminRequest(
    new Request("https://preview.example/api/admin/session", { headers: { authorization: "Bearer test" } }),
    environment,
    clerkFactory,
  );
  assert.equal(wrongParty.code, "ADMIN_ORIGIN_NOT_ALLOWED");
  assert.equal(clerkCalls, 1);

  const wrongUser = await authenticateAdminRequest(
    new Request("https://www.madebywebine.com/api/admin/session", { headers: { authorization: "Bearer test" } }),
    environment,
    () => ({
      async authenticateRequest() {
        return { isAuthenticated: true, toAuth: () => ({ userId: "user_other" }) };
      },
    }),
  );
  assert.equal(wrongUser.code, "ADMIN_NOT_ALLOWED");
});

test("binds Blob upload intent and completion metadata", () => {
  const assetId = "123e4567-e89b-12d3-a456-426614174000";
  const pathname = `webine/media/${assetId}/example.webp`;
  assert.equal(parseUploadIntent(JSON.stringify({ assetId, mimeType: "image/webp", byteSize: 100 }), pathname).assetId, assetId);
  assert.throws(
    () => parseUploadIntent(JSON.stringify({ assetId: crypto.randomUUID(), mimeType: "image/webp", byteSize: 100 }), pathname),
    (error) => error.code === "MEDIA_UPLOAD_INVALID",
  );
  const metadata = { pathname, url: "https://store.public.blob.vercel-storage.com/example.webp", contentType: "image/webp", size: 100 };
  assert.equal(assertBlobCompletionMetadata(pathname, metadata.url, metadata), 15 * 1024 * 1024);
  assert.throws(
    () => assertBlobCompletionMetadata(pathname, "https://other.public.blob.vercel-storage.com/example.webp", metadata),
    (error) => error.code === "MEDIA_PROVIDER_INVALID",
  );
  assert.throws(
    () => assertBlobCompletionMetadata(pathname, metadata.url, { ...metadata, size: 20 * 1024 * 1024 }),
    (error) => error.code === "MEDIA_INVALID",
  );
});

test("report-only CSP removes broad HTTPS script and connection sources", async () => {
  const configuration = JSON.parse(await readFile(new URL("vercel.json", projectRoot), "utf8"));
  const globalHeaders = configuration.headers.find((entry) => entry.source === "/(.*)").headers;
  const reportOnly = globalHeaders.find((header) => header.key === "Content-Security-Policy-Report-Only").value;
  assert.doesNotMatch(reportOnly, /script-src[^;]*\shttps:\s/);
  assert.doesNotMatch(reportOnly, /connect-src[^;]*\shttps:\s/);
  assert.match(reportOnly, /https:\/\/challenges\.cloudflare\.com/);
  assert.match(reportOnly, /clerk/);
});

test("uses the production canonical origin and static robots file", async () => {
  assert.equal(
    getCanonicalSiteOrigin(new Request("https://attacker.example/sitemap.xml"), { NODE_ENV: "production" }),
    "https://www.madebywebine.com",
  );
  assert.equal(
    getCanonicalSiteOrigin(new Request("https://attacker.example/sitemap.xml"), {
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      VERCEL_BRANCH_URL: "webine-git-security-webine.vercel.app",
    }),
    "https://webine-git-security-webine.vercel.app",
  );
  const robots = await readFile(new URL("public/robots.txt", projectRoot), "utf8");
  assert.match(robots, /Sitemap: https:\/\/www\.madebywebine\.com\/sitemap\.xml/);
  assert.match(robots, /Disallow: \/api\/enquiries/);
});

test("removes production media and robots Function entrypoints", async () => {
  for (const path of ["api/media.ts", "api/robots.ts"]) {
    await assert.rejects(() => readFile(new URL(path, projectRoot), "utf8"), /ENOENT/);
  }
  const developmentHandler = await readFile(new URL("dev/media-development-handler.ts", projectRoot), "utf8");
  assert.match(developmentHandler, /routeMediaRequest/);
});
