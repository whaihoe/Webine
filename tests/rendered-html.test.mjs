import assert from "node:assert/strict";
import test from "node:test";

const routes = [
  { path: "/", title: "Webine | Foundation", heading: "Make the ordinary unmistakable." },
  { path: "/works", title: "Works | Webine", heading: "Work with a clear point of view." },
  { path: "/contact", title: "Contact | Webine", heading: "Start something worth remembering." },
  { path: "/admin", title: "Admin Foundation | Webine", heading: "Content operations start here." },
  { path: "/preview", title: "Content Preview | Webine", heading: "Review before publishing." },
];

async function render(path) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

for (const route of routes) {
  test(`server-renders ${route.path}`, async () => {
    const response = await render(route.path);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();
    assert.match(html, new RegExp(`<title>${route.title}</title>`, "i"));
    assert.match(html, new RegExp(route.heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(html, /Primary navigation/);
    assert.match(html, /webine-logo-primary\.png/);
  });
}

test("returns a real 404 for an unknown route", async () => {
  const response = await render("/missing-route");
  assert.equal(response.status, 404);

  const html = await response.text();
  assert.match(html, /This page has not taken shape\./);
});
