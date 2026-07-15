import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);

async function loadAccessPolicy() {
  const source = await readFile(
    new URL("server/admin-access-policy.ts", projectRoot),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  return import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
  );
}

test("allows the Admin bypass only in an explicit local runtime", async () => {
  const { resolveAdminAccessConfiguration } = await loadAccessPolicy();

  assert.deepEqual(resolveAdminAccessConfiguration({
    ADMIN_DEV_BYPASS: "true",
    ADMIN_DEV_LABEL: "Local owner",
    NODE_ENV: "development",
  }), {
    mode: "local",
    identityLabel: "Local owner",
    userId: "local-owner",
  });

  assert.equal(resolveAdminAccessConfiguration({
    ADMIN_DEV_BYPASS: "true",
    NODE_ENV: "development",
    VERCEL: "1",
  }).mode, "invalid");

  assert.equal(resolveAdminAccessConfiguration({
    ADMIN_DEV_BYPASS: "true",
    NODE_ENV: "production",
  }).mode, "invalid");
});

test("requires every production Clerk security setting", async () => {
  const { resolveAdminAccessConfiguration } = await loadAccessPolicy();
  const result = resolveAdminAccessConfiguration({ VERCEL: "1" });

  assert.deepEqual(result, {
    mode: "invalid",
    missing: [
      "ADMIN_USER_ID",
      "CLERK_PUBLISHABLE_KEY",
      "CLERK_SECRET_KEY",
      "CLERK_AUTHORIZED_PARTIES",
    ],
  });
});

test("normalises the Clerk owner and authorised origins", async () => {
  const { resolveAdminAccessConfiguration } = await loadAccessPolicy();
  const result = resolveAdminAccessConfiguration({
    VERCEL: "1",
    ADMIN_USER_ID: " user_owner ",
    CLERK_PUBLISHABLE_KEY: " pk_test_example ",
    CLERK_SECRET_KEY: " sk_test_example ",
    CLERK_AUTHORIZED_PARTIES: "https://webine.vercel.app/, https://webine.example ",
  });

  assert.deepEqual(result, {
    mode: "clerk",
    userId: "user_owner",
    publishableKey: "pk_test_example",
    secretKey: "sk_test_example",
    authorisedParties: [
      "https://webine.vercel.app",
      "https://webine.example",
    ],
  });
});
