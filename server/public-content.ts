import type { Client, Row } from "@libsql/client";
import type { PublicProject } from "../src/content/public-projects.js";
import { contentBlockAssetIds } from "../shared/project-content-blocks.js";
import { getDatabase } from "./database.js";

type PublicAsset = PublicProject["heroImage"];

function asNumber(value: Row[string]) {
  return typeof value === "bigint"
    ? Number(value)
    : Number(value ?? 0);
}

function textFromStructured(value: unknown) {
  return value && typeof value === "object" && "text" in value
    ? String((value as { text: unknown }).text ?? "")
    : undefined;
}

function projectAccentColour(value: unknown) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)
    ? value.toLowerCase()
    : "#2563eb";
}

function mapPublicAsset(row: Row): PublicAsset {
  return {
    id: String(row.id),
    url: String(row.delivery_url),
    altText: String(row.alt_text),
    focalX: Number(row.focal_x),
    focalY: Number(row.focal_y),
    width: Number(row.width),
    height: Number(row.height),
    mimeType: String(row.mime_type),
  };
}

function referenceMap(rows: Row[]) {
  const refs = new Map<string, Map<string, string[]>>();
  rows.forEach((row) => {
    const data = JSON.parse(String(row.published_data_json)) as Record<string, unknown>;
    const label = typeof data.name === "string" ? data.name : "";
    const fields = refs.get(String(row.source_item_id)) ?? new Map<string, string[]>();
    const fieldId = String(row.field_definition_id);
    fields.set(fieldId, [...(fields.get(fieldId) ?? []), label]);
    refs.set(String(row.source_item_id), fields);
  });
  return refs;
}

function mapPublicProject(
  row: Row,
  assets: Map<string, PublicAsset>,
  refs: Map<string, Map<string, string[]>>,
) {
  const data = JSON.parse(String(row.published_data_json)) as Record<string, unknown>;
  const hero = assets.get(String(data.hero_image ?? ""));
  if (!hero || typeof row.slug !== "string" || typeof data.title !== "string") return null;

  const kind = data.project_kind === "client" || data.project_kind === "internal"
    ? data.project_kind
    : "concept";
  const references = refs.get(String(row.id));
  const project: PublicProject = {
    id: String(row.id),
    slug: row.slug,
    title: data.title,
    client: String(data.client ?? ""),
    kind,
    label: kind === "client" ? "Client project" : kind === "internal" ? "Internal project" : "Concept project",
    category: references?.get("project_type")?.[0] ?? "Project",
    year: asNumber(data.year as Row[string]),
    services: references?.get("project_services") ?? [],
    summary: String(data.short_summary ?? ""),
    heroImage: hero,
    cardTheme: data.card_theme === "dark" ? "dark" : "light",
    accentColour: projectAccentColour(data.accent_colour),
    featured: data.featured === true,
    featuredOrder: typeof data.featured_order === "number" ? data.featured_order : null,
    challenge: textFromStructured(data.challenge),
    approach: textFromStructured(data.approach),
    outcome: textFromStructured(data.outcome),
    industry: typeof data.industry === "string" ? data.industry : undefined,
    location: typeof data.location === "string" ? data.location : undefined,
    duration: typeof data.duration === "string" ? data.duration : undefined,
    completedOn: typeof data.completed_on === "string" ? data.completed_on : undefined,
    platform: typeof data.platform === "string" ? data.platform : undefined,
    aboutClient: textFromStructured(data.about_client),
    contentBlocks: Array.isArray(data.content_blocks)
      ? (data.content_blocks as Array<Record<string, unknown>>).map((block) => {
          const images = contentBlockAssetIds(block)
            .map((assetId) => assets.get(assetId))
            .filter((image): image is PublicAsset => Boolean(image));
          return images.length ? { ...block, image: images[0], images } : block;
        })
      : [],
    credits: Array.isArray(data.credits) ? data.credits as Array<Record<string, unknown>> : [],
    projectUrl: typeof data.project_url === "string" ? data.project_url : undefined,
    seoTitle: typeof data.seo_title === "string" ? data.seo_title : undefined,
    seoDescription: typeof data.seo_description === "string" ? data.seo_description : undefined,
  };
  const hover = assets.get(String(data.hover_image ?? ""));
  if (hover) project.hoverImage = hover;
  return project;
}

export async function listPublicProjects(
  options: { featuredOnly?: boolean } = {},
  client: Client = getDatabase(),
) {
  const [itemsResult, assetsResult, referencesResult] = await Promise.all([
    client.execute(`SELECT id, slug, published_data_json FROM collection_items
      WHERE collection_id = 'collection_projects' AND status = 'published' AND published_data_json IS NOT NULL`),
    client.execute("SELECT id, delivery_url, alt_text, focal_x, focal_y, width, height, mime_type FROM assets WHERE status = 'ready'"),
    client.execute(`SELECT item_references.source_item_id, item_references.field_definition_id,
      collection_items.published_data_json FROM item_references
      JOIN collection_items ON collection_items.id = item_references.target_item_id
      WHERE collection_items.status = 'published' ORDER BY item_references.position ASC`),
  ]);

  const assets = new Map(
    assetsResult.rows.map((row) => [String(row.id), mapPublicAsset(row)]),
  );
  const refs = referenceMap(referencesResult.rows);
  const projects = itemsResult.rows
    .map((row) => mapPublicProject(row, assets, refs))
    .filter((project): project is PublicProject => Boolean(project));

  return projects
    .filter((project) => !options.featuredOnly || project.featured)
    .sort((a, b) => {
      if (a.featuredOrder === null || b.featuredOrder === null) {
        if (a.featuredOrder !== null) return -1;
        if (b.featuredOrder !== null) return 1;
      }
      return (b.featuredOrder ?? 0) - (a.featuredOrder ?? 0)
        || b.year - a.year
        || a.title.localeCompare(b.title);
    });
}

export async function getPublicProject(slug: string, client: Client = getDatabase()) {
  const itemResult = await client.execute({
    sql: `SELECT id, slug, published_data_json FROM collection_items
      WHERE collection_id = 'collection_projects' AND status = 'published'
      AND published_data_json IS NOT NULL AND slug = ? LIMIT 1`,
    args: [slug],
  });
  const row = itemResult.rows[0];
  if (!row) return null;

  const data = JSON.parse(String(row.published_data_json)) as Record<string, unknown>;
  const assetIds = new Set<string>();
  [data.hero_image, data.hover_image].forEach((value) => {
    if (typeof value === "string" && value) assetIds.add(value);
  });
  if (Array.isArray(data.content_blocks)) {
    data.content_blocks.forEach((block) => {
      if (!block || typeof block !== "object") return;
      contentBlockAssetIds(block as Record<string, unknown>).forEach((id) => assetIds.add(id));
    });
  }

  const assetIdList = [...assetIds];
  const [assetsResult, referencesResult] = await Promise.all([
    assetIdList.length === 0
      ? Promise.resolve({ rows: [] as Row[] })
      : client.execute({
          sql: `SELECT id, delivery_url, alt_text, focal_x, focal_y, width, height, mime_type
            FROM assets WHERE status = 'ready' AND id IN (${assetIdList.map(() => "?").join(", ")})`,
          args: assetIdList,
        }),
    client.execute({
      sql: `SELECT item_references.source_item_id, item_references.field_definition_id,
        collection_items.published_data_json FROM item_references
        JOIN collection_items ON collection_items.id = item_references.target_item_id
        WHERE item_references.source_item_id = ? AND collection_items.status = 'published'
        ORDER BY item_references.position ASC`,
      args: [String(row.id)],
    }),
  ]);
  const assets = new Map(
    assetsResult.rows.map((assetRow) => [String(assetRow.id), mapPublicAsset(assetRow)]),
  );
  return mapPublicProject(row, assets, referenceMap(referencesResult.rows));
}

export async function getPublishedSiteSettings(client: Client = getDatabase()) {
  const result = await client.execute(
    "SELECT published_data_json FROM collection_items WHERE id = 'item_site_settings' AND status = 'published' AND published_data_json IS NOT NULL",
  );
  const value = result.rows[0]?.published_data_json;
  return typeof value === "string"
    ? JSON.parse(value) as Record<string, unknown>
    : {};
}
