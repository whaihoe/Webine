import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);

async function loadAdminApi() {
  const source = await readFile(
    new URL("src/admin/api.ts", projectRoot),
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

test("sends the active Clerk session token with Admin API requests", async () => {
  const { fetchAdminResource, mutateAdminResource } = await loadAdminApi();
  const originalFetch = globalThis.fetch;
  const requests = [];

  globalThis.fetch = async (path, options = {}) => {
    requests.push({ path, options });
    return new Response(JSON.stringify({
      data: { ok: true },
      error: null,
      meta: { requestId: "test" },
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const getToken = async () => "session-token";
    await fetchAdminResource("/api/admin/session", undefined, getToken);
    await mutateAdminResource(
      "/api/admin/enquiries/example/retry",
      "POST",
      {},
      getToken,
    );

    assert.equal(requests.length, 2);
    for (const { options } of requests) {
      const headers = new Headers(options.headers);
      assert.equal(headers.get("authorization"), "Bearer session-token");
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("keeps local Admin requests working when no Clerk token provider exists", async () => {
  const { fetchAdminResource } = await loadAdminApi();
  const originalFetch = globalThis.fetch;
  let authorization = "unexpected";

  globalThis.fetch = async (_path, options = {}) => {
    authorization = new Headers(options.headers).get("authorization");
    return new Response(JSON.stringify({
      data: { label: "Local owner" },
      error: null,
      meta: { requestId: "test" },
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    await fetchAdminResource("/api/admin/session");
    assert.equal(authorization, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
