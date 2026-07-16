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
  const [example, guide] = await Promise.all([
    readFile(new URL(".env.example", projectRoot), "utf8"),
    readFile(new URL("docs/vercel-deployment.md", projectRoot), "utf8"),
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
});
