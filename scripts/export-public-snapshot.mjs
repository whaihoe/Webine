import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getPublishedSiteSettings, listPublicProjects } from "../.test-build/server/public-content.js";
import { closeDatabase } from "../.test-build/server/database.js";

const outputDirectory = process.env.WEBINE_SNAPSHOT_EXPORT_DIRECTORY?.trim() || ".data/public-snapshot";
const version = crypto.randomUUID();

try {
  const [projects, siteSettings] = await Promise.all([
    listPublicProjects(),
    getPublishedSiteSettings(),
  ]);
  const publicSnapshot = JSON.stringify({
    data: { projects, siteSettings },
    error: null,
    meta: { requestId: "published-snapshot" },
  });
  const current = JSON.stringify({ version, publishedAt: new Date().toISOString() });
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(join(outputDirectory, "public.json"), `${publicSnapshot}\n`);
  await writeFile(join(outputDirectory, "current.json"), `${current}\n`);
  await writeFile(join(outputDirectory, "manifest.json"), `${JSON.stringify({ version, projectCount: projects.length }, null, 2)}\n`);
  console.log(JSON.stringify({ outputDirectory, version, projectCount: projects.length }, null, 2));
} finally {
  await closeDatabase();
}
