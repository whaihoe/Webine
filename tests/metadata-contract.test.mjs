import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createRouteStructuredData } from "../shared/route-structured-data.mjs";

const projectRoot = new URL("../", import.meta.url);
const metadata = JSON.parse(
  await readFile(new URL("shared/public-route-metadata.json", projectRoot), "utf8"),
);

test("keeps public route metadata canonical, descriptive and private-route safe", () => {
  const canonicalPaths = new Set();
  const pageTypes = new Set(["WebSite", "WebPage", "AboutPage", "CollectionPage", "ContactPage"]);

  for (const route of metadata) {
    assert.equal(typeof route.path, "string");
    assert.equal(typeof route.canonicalPath, "string");
    assert.ok(route.path.startsWith("/"));
    assert.ok(route.canonicalPath.startsWith("/"));
    assert.ok(!route.canonicalPath.includes("?"));
    assert.ok(!route.canonicalPath.includes("#"));
    assert.ok(!canonicalPaths.has(route.canonicalPath), `duplicate canonical path: ${route.canonicalPath}`);
    canonicalPaths.add(route.canonicalPath);
    assert.ok(pageTypes.has(route.pageType));
    assert.ok(route.title.length >= 12 && route.title.length <= 70);
    assert.ok(route.description.length >= 30 && route.description.length <= 170);
    assert.ok(route.heading.length >= 5);
    assert.ok(route.linkLabel.length >= 3);
    assert.ok(Array.isArray(route.breadcrumbs));

    if (route.noIndex) {
      assert.ok(["/admin", "/preview"].includes(route.path));
    } else {
      assert.equal(route.canonicalPath, route.path);
    }
  }
});

test("builds truthful project and service entities through one structured-data owner", async () => {
  const projectMetadata = {
    path: "/works/example-project",
    canonicalPath: "/works/example-project",
    title: "Webine • Example Project",
    description: "A representative Webine project description.",
    pageType: "WebPage",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Works", path: "/works" },
      { name: "Example Project", path: "/works/example-project" },
    ],
    project: {
      name: "Example Project",
      description: "A representative Webine project description.",
      image: "/example-project.webp",
      dateCreated: "2026",
      genre: "Website design",
    },
  };
  const schemas = createRouteStructuredData(projectMetadata, "https://www.madebywebine.com");
  const page = schemas.find((schema) => schema["@type"] === "WebPage");
  const project = schemas.find((schema) => schema["@type"] === "CreativeWork");
  const breadcrumb = schemas.find((schema) => schema["@type"] === "BreadcrumbList");

  assert.equal(page.name, "Example Project");
  assert.equal(page.mainEntity["@id"], "https://www.madebywebine.com/works/example-project#project");
  assert.equal(project.image, "https://www.madebywebine.com/example-project.webp");
  assert.equal(project.creator["@id"], "https://www.madebywebine.com/#organization");
  assert.equal(breadcrumb.itemListElement.length, 3);

  const [runtimeOwner, buildOwner, documentOwner] = await Promise.all([
    readFile(new URL("src/seo/structured-data.ts", projectRoot), "utf8"),
    readFile(new URL("scripts/generate-route-documents.mjs", projectRoot), "utf8"),
    readFile(new URL("shared/route-document.mjs", projectRoot), "utf8"),
  ]);
  assert.match(runtimeOwner, /route-structured-data\.mjs/);
  assert.match(buildOwner, /route-document\.mjs/);
  assert.match(documentOwner, /route-structured-data\.mjs/);
  assert.doesNotMatch(documentOwner, /const services\s*=/);
});
