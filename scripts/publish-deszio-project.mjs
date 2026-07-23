import { createClient } from "@libsql/client";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const mediaDir = resolve(root, "public/work/deszio-studio/case-study");
const databaseUrl = process.env.TURSO_DATABASE_URL?.trim() || `file:${resolve(root, ".data/webine.db")}`;
const isProductionDatabase = !databaseUrl.startsWith("file:");

if (isProductionDatabase && !process.argv.includes("--confirm-production")) {
  throw new Error("Pass --confirm-production before publishing Deszio Studio to the remote CMS.");
}

const client = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN?.trim(),
});
const actor = "system:deszio-case-study";
const projectId = "project_deszio_studio";
const manifest = JSON.parse(await readFile(resolve(mediaDir, "manifest.json"), "utf8"));

const schemaCheck = await client.execute("SELECT id FROM field_definitions WHERE id = 'project_about_client'");
if (schemaCheck.rows.length !== 1) {
  throw new Error("Run the CMS migrations before publishing the Deszio Studio case study.");
}

const referenceIds = ["category_web", "service_strategy", "service_design", "service_development"];
const referenceCheck = await client.execute({
  sql: `SELECT id, status FROM collection_items WHERE id IN (${referenceIds.map(() => "?").join(", ")})`,
  args: referenceIds,
});
const publishedReferences = new Set(referenceCheck.rows.filter((row) => row.status === "published").map((row) => String(row.id)));
const missingReferences = referenceIds.filter((id) => !publishedReferences.has(id));
if (missingReferences.length) {
  throw new Error(`Publish the required category and service items first: ${missingReferences.join(", ")}`);
}

const assets = [];
for (let index = 0; index < manifest.length; index += 1) {
  const entry = manifest[index];
  const path = resolve(mediaDir, entry.filename);
  const [fileStat, metadata] = await Promise.all([
    stat(path),
    sharp(path).metadata(),
  ]);
  if (!metadata.width || !metadata.height || metadata.format !== "webp") {
    throw new Error(`Invalid case-study image: ${entry.filename}`);
  }
  assets.push({
    id: `asset_deszio_${String(index + 1).padStart(2, "0")}`,
    filename: entry.filename,
    providerAssetId: `work/deszio-studio/case-study/${entry.filename}`,
    deliveryUrl: `/work/deszio-studio/case-study/${entry.filename}`,
    byteSize: fileStat.size,
    width: metadata.width,
    height: metadata.height,
    altText: entry.altText,
    caption: entry.caption,
    heading: entry.heading,
    layout: entry.layout,
  });
}

const hero = assets[0];
const hover = assets[15];
const contentBlocks = assets.slice(1).map((asset) => ({
  type: "image",
  assetId: asset.id,
  heading: asset.heading,
  text: asset.caption,
  layout: asset.layout,
}));
const projectData = {
  title: "Deszio Studio",
  slug: "deszio-studio",
  client: "Deszio Studio",
  project_kind: "client",
  project_type: "category_web",
  year: 2026,
  services: ["service_strategy", "service_design", "service_development"],
  short_summary: "A calm, responsive website for a Singapore interior design studio, designed and developed in one month to move visitors from atmosphere to consultation.",
  hero_image: hero.id,
  hover_image: hover.id,
  card_theme: "light",
  featured: true,
  featured_order: 0,
  about_client: {
    text: "Deszio Studio creates serene, sophisticated interiors that elevate everyday living through thoughtful design and careful craftsmanship. The website needed to carry that same sense of restraint and precision into a clear digital experience.",
  },
  challenge: {
    text: "The studio needed a premium digital presence that could let its interior work lead while still explaining the service clearly and keeping a direct consultation route visible.",
  },
  approach: {
    text: "Webine designed a calm single-page narrative around atmosphere, selected projects, a three-phase service process, client reassurance and a focused enquiry form. The responsive build re-composes the hierarchy for mobile rather than simply shrinking the desktop layout.",
  },
  outcome: {
    text: "The completed website is live, responsive and gives Deszio Studio a coherent digital home with a clear journey from first impression to consultation. The design and development were completed in one month.",
  },
  content_blocks: contentBlocks,
  project_url: "https://desziostudio.com/",
  accent_colour: "#e879a8",
  credits: [{ text: "Webine / Website strategy, interface design and responsive development" }],
  seo_title: "Deszio Studio website design and development",
  seo_description: "A Webine case study for the one-month design and development of Deszio Studio’s responsive interior design website.",
  social_image: hero.id,
  industry: "Interior design",
  location: "Singapore",
  duration: "1 month",
  completed_on: "2026-07-01T00:00:00.000Z",
  platform: "Responsive website",
};
const dataJson = JSON.stringify(projectData);
const currentItem = await client.execute({ sql: "SELECT version FROM collection_items WHERE id = ?", args: [projectId] });
const nextVersion = Number(currentItem.rows[0]?.version ?? 0) + 1;
const statements = [];

for (const asset of assets) {
  statements.push({
    sql: `INSERT INTO assets (id, provider, provider_asset_id, delivery_url, original_filename,
      mime_type, byte_size, width, height, alt_text, caption, focal_x, focal_y, decorative,
      status, created_by) VALUES (?, 'external', ?, ?, ?, 'image/webp', ?, ?, ?, ?, ?, 0.5, 0.5, 0, 'ready', ?)
      ON CONFLICT(id) DO UPDATE SET provider_asset_id = excluded.provider_asset_id,
      delivery_url = excluded.delivery_url, original_filename = excluded.original_filename,
      byte_size = excluded.byte_size, width = excluded.width, height = excluded.height,
      alt_text = excluded.alt_text, caption = excluded.caption, status = 'ready',
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), version = assets.version + 1`,
    args: [asset.id, asset.providerAssetId, asset.deliveryUrl, asset.filename, asset.byteSize, asset.width, asset.height, asset.altText, asset.caption, actor],
  });
}

statements.push({
  sql: `INSERT INTO collection_items (id, collection_id, slug, status, data_json, published_data_json,
    published_at, created_by, updated_by) VALUES (?, 'collection_projects', 'deszio-studio', 'published', ?, ?,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), ?, ?)
    ON CONFLICT(id) DO UPDATE SET slug = excluded.slug, status = 'published', data_json = excluded.data_json,
    published_data_json = excluded.published_data_json, published_at = excluded.published_at,
    updated_by = excluded.updated_by, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    version = collection_items.version + 1`,
  args: [projectId, dataJson, dataJson, actor, actor],
});
statements.push(
  { sql: "DELETE FROM asset_usages WHERE item_id = ?", args: [projectId] },
  { sql: "DELETE FROM item_references WHERE source_item_id = ?", args: [projectId] },
);

const directAssetUsages = [
  [hero.id, "project_hero_image", ""],
  [hover.id, "project_hover_image", ""],
  [hero.id, "project_social_image", ""],
];
for (const [assetId, fieldId, usagePath] of directAssetUsages) {
  statements.push({
    sql: "INSERT INTO asset_usages (asset_id, item_id, field_definition_id, usage_path) VALUES (?, ?, ?, ?)",
    args: [assetId, projectId, fieldId, usagePath],
  });
}
for (let index = 1; index < assets.length; index += 1) {
  statements.push({
    sql: "INSERT INTO asset_usages (asset_id, item_id, field_definition_id, usage_path) VALUES (?, ?, 'project_blocks', ?)",
    args: [assets[index].id, projectId, `content_blocks.${index - 1}.assetId`],
  });
}
statements.push(
  { sql: "INSERT INTO item_references (source_item_id, field_definition_id, target_item_id, position) VALUES (?, 'project_type', 'category_web', 0)", args: [projectId] },
  { sql: "INSERT INTO item_references (source_item_id, field_definition_id, target_item_id, position) VALUES (?, 'project_services', 'service_strategy', 0)", args: [projectId] },
  { sql: "INSERT INTO item_references (source_item_id, field_definition_id, target_item_id, position) VALUES (?, 'project_services', 'service_design', 1)", args: [projectId] },
  { sql: "INSERT INTO item_references (source_item_id, field_definition_id, target_item_id, position) VALUES (?, 'project_services', 'service_development', 2)", args: [projectId] },
  {
    sql: `INSERT OR IGNORE INTO item_snapshots (id, item_id, snapshot_type, data_json, item_version, created_by)
      VALUES (?, ?, 'publish', ?, ?, ?)`,
    args: [crypto.randomUUID(), projectId, dataJson, nextVersion, actor],
  },
  {
    sql: `INSERT INTO audit_events (id, actor_id, action, entity_type, entity_id, summary_json, request_id)
      VALUES (?, ?, 'item.publish', 'collection_item', ?, ?, ?)`,
    args: [crypto.randomUUID(), actor, projectId, JSON.stringify({ source: "deszio-case-study-script", assets: assets.length }), crypto.randomUUID()],
  },
);

await client.batch(statements, "write");
const verification = await client.execute({
  sql: `SELECT collection_items.status, collection_items.version,
    (SELECT count(*) FROM asset_usages WHERE item_id = collection_items.id) AS asset_count,
    (SELECT count(*) FROM item_references WHERE source_item_id = collection_items.id) AS reference_count
    FROM collection_items WHERE collection_items.id = ?`,
  args: [projectId],
});
await client.close();

const result = verification.rows[0];
if (result?.status !== "published" || Number(result.asset_count) !== 20 || Number(result.reference_count) !== 4) {
  throw new Error("The Deszio Studio CMS publication did not pass its verification checks.");
}

console.log(`Published Deszio Studio with ${assets.length} media assets at item version ${result.version}.`);
