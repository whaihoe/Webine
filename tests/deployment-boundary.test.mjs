import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("keeps credentials and generated deployment state out of GitHub", async () => {
  const ignoredPaths = [
    ".env",
    ".env.development",
    ".env.local",
    ".env.production",
    ".envrc",
    ".dev.vars",
    ".direnv/allow",
    ".data/webine.db",
    "backups/webine.sqlite",
    "exports/enquiries.csv",
    "uploads/private.png",
    ".vercel/project.json",
    ".wrangler/state.json",
    ".cloudflare/secrets.json",
    ".netlify/state.json",
    ".clerk/session.json",
    ".npmrc",
    "dist/index.html",
    ".output/server/index.mjs",
  ];
  const result = spawnSync(
    "git",
    ["check-ignore", "--no-index", "--stdin"],
    {
      cwd: projectRoot,
      encoding: "utf8",
      input: `${ignoredPaths.join("\n")}\n`,
    },
  );

  assert.equal(result.status, 0, result.stderr);
  for (const path of ignoredPaths) assert.match(result.stdout, new RegExp(`^${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));

  const example = spawnSync("git", ["check-ignore", "--no-index", ".env.example"], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  assert.equal(example.status, 1, ".env.example must remain trackable");
});

test("documents every application-owned Vercel variable", async () => {
  const [example, guide, packageJson, vercel] = await Promise.all([
    readFile(new URL(".env.example", projectRoot), "utf8"),
    readFile(new URL("docs/vercel-deployment.md", projectRoot), "utf8"),
    readFile(new URL("package.json", projectRoot), "utf8"),
    readFile(new URL("vercel.json", projectRoot), "utf8"),
  ]);
  const variables = [
    "VITE_CLERK_PUBLISHABLE_KEY",
    "CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "ADMIN_USER_ID",
    "CLERK_AUTHORIZED_PARTIES",
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "BLOB_READ_WRITE_TOKEN",
    "ENQUIRY_HASH_SECRET",
    "RESEND_API_KEY",
    "ENQUIRY_NOTIFICATION_EMAIL",
    "ENQUIRY_NOTIFICATION_FROM_EMAIL",
    "ENQUIRY_NOTIFICATION_WEBHOOK_URL",
    "ENQUIRY_NOTIFICATION_TOKEN",
    "VITE_PUBLIC_CONTACT_EMAIL",
  ];

  for (const variable of variables) {
    assert.match(example, new RegExp(`^${variable}=`, "m"));
    assert.ok(
      guide.includes(`| \`${variable}\` |`),
      `${variable} is missing from the Vercel environment table`,
    );
  }
  assert.match(packageJson, /"check:production-env":\s*"node scripts\/check-production-env\.mjs"/);
  assert.match(packageJson, /"build:vercel":\s*"npm run check:production-env && npm run build"/);
  assert.match(vercel, /"buildCommand":\s*"npm run build:vercel"/);
});

test("blocks production builds when required services are not configured", () => {
  const configured = {
    ...process.env,
    VITE_CLERK_PUBLISHABLE_KEY: "pk_test_example",
    CLERK_PUBLISHABLE_KEY: "pk_test_example",
    CLERK_SECRET_KEY: "sk_test_example",
    ADMIN_USER_ID: "user_example",
    CLERK_AUTHORIZED_PARTIES: "https://webine.example.com",
    TURSO_DATABASE_URL: "libsql://webine.example.turso.io",
    TURSO_AUTH_TOKEN: "database-token",
    BLOB_READ_WRITE_TOKEN: "blob-token",
    ENQUIRY_HASH_SECRET: "a".repeat(64),
    ADMIN_DEV_BYPASS: "false",
  };
  const ready = spawnSync(
    process.execPath,
    ["scripts/check-production-env.mjs"],
    { cwd: projectRoot, encoding: "utf8", env: configured },
  );
  assert.equal(ready.status, 0, ready.stderr);

  const incomplete = { ...configured };
  delete incomplete.BLOB_READ_WRITE_TOKEN;
  const blocked = spawnSync(
    process.execPath,
    ["scripts/check-production-env.mjs"],
    { cwd: projectRoot, encoding: "utf8", env: incomplete },
  );
  assert.equal(blocked.status, 1);
  assert.match(blocked.stderr, /BLOB_READ_WRITE_TOKEN is missing/);
});

test("keeps private route documents out of caches and search indexes", async () => {
  const vercel = JSON.parse(
    await readFile(new URL("vercel.json", projectRoot), "utf8"),
  );
  const privateSources = new Map(
    vercel.headers.map((entry) => [entry.source, entry.headers]),
  );

  for (const source of ["/admin", "/admin/:path*", "/preview"]) {
    const headers = privateSources.get(source);
    assert.ok(headers, `${source} is missing private document headers`);
    const values = new Map(
      headers.map((header) => [header.key, header.value]),
    );
    assert.equal(values.get("Cache-Control"), "private, no-store");
    assert.equal(values.get("X-Robots-Tag"), "noindex, nofollow");
  }
});
