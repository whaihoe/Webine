import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { authenticateAdminRequest } from "../.test-build/server/auth.js";
import { parseUploadIntent, routeAdminRequest } from "../.test-build/server/api-routes/admin.js";
import { handleEnquiryRequest } from "../.test-build/server/api-routes/enquiries.js";
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
    NODE_ENV: "production",
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
    (error) => error.code === "TURNSTILE_UNAVAILABLE",
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

test("passes the Worker Turnstile bindings through the enquiry handler", async () => {
  const environment = {
    NODE_ENV: "production",
    TURNSTILE_SECRET_KEY: "worker-secret",
    TURNSTILE_ALLOWED_HOSTNAMES: "www.madebywebine.com",
    TURNSTILE_EXPECTED_ACTION: "contact_enquiry",
  };
  const request = new Request("https://www.madebywebine.com/api/enquiries", {
    method: "POST",
    headers: { origin: "https://www.madebywebine.com", "content-type": "application/json" },
    body: JSON.stringify(validEnquiry()),
  });
  let verificationEnvironment;
  const response = await handleEnquiryRequest(request, async (_input, verificationRequest, _requestId, _client, verifyHuman) => {
    await verifyHuman("token", verificationRequest);
    return { accepted: true, duplicate: false };
  }, environment, async (_token, _request, receivedEnvironment) => {
    verificationEnvironment = receivedEnvironment;
  });
  assert.equal(response.status, 201);
  assert.equal(verificationEnvironment, environment);
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
      NODE_ENV: "production",
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

test("routes legacy underscore media IDs to the protected archive handler", async () => {
  const names = [
    "NODE_ENV",
    "ADMIN_USER_ID",
    "CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "CLERK_AUTHORIZED_PARTIES",
  ];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  Object.assign(process.env, {
    NODE_ENV: "production",
    ADMIN_USER_ID: "user_owner",
    CLERK_PUBLISHABLE_KEY: "pk_test_example",
    CLERK_SECRET_KEY: "sk_test_example",
    CLERK_AUTHORIZED_PARTIES: "https://www.madebywebine.com",
  });
  try {
    const response = await routeAdminRequest(new Request(
      "https://www.madebywebine.com/api/admin/media/asset_deszio_12",
      { method: "DELETE", headers: { origin: "https://www.madebywebine.com" } },
    ));
    assert.equal(response.status, 401);
    assert.equal((await response.json()).error.code, "ADMIN_SIGN_IN_REQUIRED");
  } finally {
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    }
  }
});

test("rejects invalid Admin methods before authentication", async () => {
  const response = await routeAdminRequest(new Request("https://www.madebywebine.com/api/admin/session", { method: "DELETE" }));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET");
});

test("keeps Clerk party and owner checks after the carrier precheck", async () => {
  const environment = {
    NODE_ENV: "production",
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

test("binds R2 upload intent to the authorised asset path", () => {
  const assetId = "123e4567-e89b-12d3-a456-426614174000";
  const pathname = `webine/media/${assetId}/example.webp`;
  assert.equal(parseUploadIntent(JSON.stringify({ assetId, mimeType: "image/webp", byteSize: 100 }), pathname).assetId, assetId);
  assert.throws(
    () => parseUploadIntent(JSON.stringify({ assetId: crypto.randomUUID(), mimeType: "image/webp", byteSize: 100 }), pathname),
    (error) => error.code === "MEDIA_UPLOAD_INVALID",
  );
});

test("CSP removes broad HTTPS sources and does not permit an injected Insights script", async () => {
  const headers = await readFile(new URL("public/_headers", projectRoot), "utf8");
  assert.doesNotMatch(headers, /script-src[^;]*\shttps:\s/);
  assert.doesNotMatch(headers, /connect-src[^;]*\shttps:\s/);
  assert.match(headers, /connect-src[^;]*https:\/\/0dd328bb4a534518c56dafc370b5c134\.r2\.cloudflarestorage\.com/);
  assert.doesNotMatch(headers, /script-src[^;]*https:\/\/static\.cloudflareinsights\.com/);
  assert.match(headers, /challenges\.cloudflare\.com/);
});

test("uses the production canonical origin and static robots file", async () => {
  assert.equal(
    getCanonicalSiteOrigin(new Request("https://attacker.example/sitemap.xml"), { NODE_ENV: "production" }),
    "https://www.madebywebine.com",
  );
  assert.equal(getCanonicalSiteOrigin(new Request("https://preview.madebywebine.com/sitemap.xml"), {
    NODE_ENV: "development",
    VITE_SITE_URL: "https://preview.madebywebine.com",
  }), "https://preview.madebywebine.com");
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
