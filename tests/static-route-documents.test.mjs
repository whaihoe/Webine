import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const siteOrigin = "https://www.madebywebine.com";

function contentFor(html, expression) {
  const match = html.match(expression);
  assert.ok(match, `Expected ${expression} in generated document`);
  return match[1];
}

function escapedAttribute(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function structuredDataFor(html) {
  return JSON.parse(contentFor(html, /<script type="application\/ld\+json" data-route-structured-data="true">([\s\S]*?)<\/script>/));
}

test("builds route-specific canonical metadata into public documents", async () => {
  const routes = JSON.parse(
    await readFile(new URL("shared/public-route-metadata.json", projectRoot), "utf8"),
  ).filter((route) => !route.noIndex);

  for (const route of routes) {
    const documentPath = route.path === "/"
      ? new URL("dist/index.html", projectRoot)
      : new URL(`dist${route.path}/index.html`, projectRoot);
    const html = await readFile(documentPath, "utf8");
    const canonical = new URL(route.canonicalPath, siteOrigin).href;

    assert.equal(contentFor(html, /<title>([^<]+)<\/title>/), escapedAttribute(route.title));
    assert.equal((html.match(/<title>/g) ?? []).length, 1);
    assert.equal((html.match(/<\/title>/g) ?? []).length, 1);
    assert.equal(contentFor(html, /<meta name="description" content="([^"]+)"/), escapedAttribute(route.description));
    assert.equal(contentFor(html, /<meta property="og:title" content="([^"]+)"/), escapedAttribute(route.title));
    assert.equal(contentFor(html, /<meta property="og:url" content="([^"]+)"/), canonical);
    assert.equal(contentFor(html, /<link rel="canonical" href="([^"]+)"/), canonical);
    assert.equal(contentFor(html, /<meta name="robots" content="([^"]+)"/), "index, follow");
    assert.match(html, /data-static-route-fallback="true"/);
    assert.match(html, new RegExp(`<h1>${escapedAttribute(route.heading).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</h1>`));
    assert.match(html, /<a href="\/services">Services<\/a>/);
    assert.doesNotMatch(contentFor(html, /<nav aria-label="Primary navigation">([\s\S]*?)<\/nav>/), /\/contact|\/privacy/);
    assert.match(html, /<a href="\/contact">Start a project<\/a>/);
    assert.match(html, /<footer><a href="\/privacy">Privacy<\/a><\/footer>/);
    assert.doesNotMatch(html, /<div id="root"><\/div>/);
    const schemas = structuredDataFor(html);
    assert.equal((html.match(/data-route-structured-data="true"/g) ?? []).length, 1);
    assert.doesNotMatch(html, /<\/script>\[\]<\/script>/);
    assert.equal(schemas[0]["@type"], "Organization");
    assert.equal(schemas[0]["@id"], `${siteOrigin}/#organization`);
    assert.equal(schemas[0].logo, `${siteOrigin}/webine-icon-512.png`);
    assert.equal(schemas[1].url, canonical);
    assert.equal(schemas[1]["@id"], `${canonical}#webpage`);
    assert.equal(schemas[1]["@type"], route.pageType === "WebSite" ? "WebPage" : route.pageType);
    if (route.path === "/") assert.ok(schemas.some((schema) => schema["@id"] === `${siteOrigin}/#website` && schema["@type"] === "WebSite"));
    if (route.path === "/services") assert.doesNotMatch(html, /services#website-design/);
    assert.doesNotMatch(html, /webine\.vercel\.app/);
  }
});

test("generates noindex documents for private application routes", async () => {
  for (const route of ["/admin", "/preview"]) {
    const html = await readFile(new URL(`dist${route}/index.html`, projectRoot), "utf8");
    assert.equal(contentFor(html, /<meta name="robots" content="([^"]+)"/), "noindex, nofollow");
    assert.equal((html.match(/<title>/g) ?? []).length, 1);
    assert.equal((html.match(/<\/title>/g) ?? []).length, 1);
    assert.match(html, /<div id="root"><\/div>/);
    assert.doesNotMatch(html, /data-static-route-fallback="true"/);
    assert.doesNotMatch(html, /application\/ld\+json/);
    assert.doesNotMatch(html, /\[\]<\/script>/);
  }
});

test("uses a project shell without a conflicting collection canonical", async () => {
  const html = await readFile(new URL("dist/works/project/index.html", projectRoot), "utf8");
  assert.equal(contentFor(html, /<title>([^<]+)<\/title>/), "Webine Works | Website Design Case Studies");
  assert.equal((html.match(/<title>/g) ?? []).length, 1);
  assert.equal((html.match(/<\/title>/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<link rel="canonical"/);
  assert.doesNotMatch(html, /<meta property="og:url"/);
  assert.doesNotMatch(html, /application\/ld\+json/);
  assert.doesNotMatch(html, /\[\]<\/script>/);
  assert.equal(contentFor(html, /<meta name="robots" content="([^"]+)"/), "index, follow");
});

test("routes static documents and the sitemap without indexing private paths", async () => {
  const [vercel, robots, sitemap] = await Promise.all([
    readFile(new URL("vercel.json", projectRoot), "utf8"),
    readFile(new URL("public/robots.txt", projectRoot), "utf8"),
    readFile(new URL("server/api-routes/sitemap.ts", projectRoot), "utf8"),
  ]);

  const configuration = JSON.parse(vercel);
  const rewrites = new Map(configuration.rewrites.map((rewrite) => [rewrite.source, rewrite.destination]));
  for (const route of ["/about", "/services", "/works", "/contact", "/privacy"]) {
    assert.equal(rewrites.get(route), `${route}/index.html`);
  }
  assert.equal(rewrites.get("/works/:slug"), "/api/projects?__webine_document=:slug");
  assert.equal(rewrites.get("/admin"), "/admin/index.html");
  assert.equal(rewrites.get("/preview"), "/preview/index.html");
  assert.match(robots, /Sitemap: https:\/\/www\.madebywebine\.com\/sitemap\.xml/);
  assert.match(sitemap, /publicRouteMetadata/);
  assert.doesNotMatch(sitemap, /"\/admin"|"\/preview"/);
});
