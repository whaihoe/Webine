import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  renderProjectShellDocument,
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
