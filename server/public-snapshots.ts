import { getPublishedSiteSettings, listPublicProjects } from "./public-content.js";

export type ContentBucket = { put(key: string, value: string, options?: { httpMetadata?: { contentType: string; cacheControl: string } }): Promise<unknown> };
export type SnapshotEnvironment = { CONTENT_BUCKET?: ContentBucket };
const envelope = (data: unknown) => JSON.stringify({ data, error: null, meta: { requestId: "published-snapshot" } });

/** Immutable objects are written before stable names, so a reader gets a complete prior or new snapshot. */
export async function publishPublicSnapshots(environment: SnapshotEnvironment, version = crypto.randomUUID()) {
  if (!environment.CONTENT_BUCKET) throw new Error("CONTENT_BUCKET is required to publish public content snapshots.");
  const [projects, settings] = await Promise.all([listPublicProjects(), getPublishedSiteSettings()]);
  const versioned = { httpMetadata: { contentType: "application/json; charset=utf-8", cacheControl: "public, max-age=31536000, immutable" } };
  const snapshot = envelope({ projects, siteSettings: settings });
  await environment.CONTENT_BUCKET.put(`content/versions/${version}/public.json`, snapshot, versioned);
  const current = { httpMetadata: { contentType: "application/json; charset=utf-8", cacheControl: "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" } };
  await Promise.all([
    environment.CONTENT_BUCKET.put("content/public.json", snapshot, current),
    environment.CONTENT_BUCKET.put("content/current.json", JSON.stringify({ version, publishedAt: new Date().toISOString() }), current),
  ]);
  return { version, projectCount: projects.length };
}
