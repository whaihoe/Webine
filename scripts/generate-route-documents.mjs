import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  renderProjectShellDocument,
  renderProjectRouteDocument,
  renderRouteDocument,
} from "../shared/route-document.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const distRoot = join(projectRoot, "dist");
const routes = JSON.parse(
  await readFile(join(projectRoot, "shared/public-route-metadata.json"), "utf8"),
);

const template = await readFile(join(distRoot, "index.html"), "utf8");
for (const route of routes) {
  const outputPath = route.path === "/"
    ? join(distRoot, "index.html")
    : join(distRoot, route.path.slice(1), "index.html");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderRouteDocument(template, route, routes));
}

await mkdir(join(distRoot, "works", "project"), { recursive: true });
const worksRoute = routes.find((route) => route.path === "/works");
if (!worksRoute) throw new Error("Missing Works route metadata");
await writeFile(
  join(distRoot, "works", "project", "index.html"),
  renderProjectShellDocument(template, worksRoute, routes),
);

const contentBaseUrl = process.env.VITE_CONTENT_BASE_URL?.replace(/\/+$/, "");
const requireContentSnapshot = process.argv.includes("--require-content");
let projects = [];
if (contentBaseUrl) {
  try {
    const response = await fetch(`${contentBaseUrl}/content/public.json`, {
      headers: { Accept: "application/json" },
      redirect: "error",
    });
    if (!response.ok) throw new Error(`snapshot returned ${response.status}`);
    const envelope = await response.json();
    projects = Array.isArray(envelope?.data?.projects) ? envelope.data.projects : [];
    for (const project of projects) {
      if (!project || typeof project.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) continue;
      const outputPath = join(distRoot, "works", project.slug, "index.html");
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, renderProjectRouteDocument(template, project));
    }
  } catch (error) {
    if (requireContentSnapshot) throw new Error(`Published Project documents could not be generated: ${error instanceof Error ? error.message : String(error)}`);
  }
} else if (requireContentSnapshot) {
  throw new Error("VITE_CONTENT_BASE_URL is required to generate published Project documents.");
}

const escapeXml = (value) => value.replace(/[<>&'"]/g, (character) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
})[character] ?? character);
const sitemapPaths = [
  ...routes.filter((route) => !route.noIndex).map((route) => route.canonicalPath),
  ...projects.filter((project) => typeof project?.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)).map((project) => `/works/${project.slug}`),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths.map((path) => `  <url><loc>${escapeXml(new URL(path, "https://www.madebywebine.com").href)}</loc></url>`).join("\n")}\n</urlset>\n`;
await writeFile(join(distRoot, "sitemap.xml"), sitemap);
