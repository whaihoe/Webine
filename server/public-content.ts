import type { Client, Row } from "@libsql/client";
import type { PublicProject } from "../src/content/public-projects.js";
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
  };
}

export async function listPublicProjects(
  options: { featuredOnly?: boolean } = {},
  client: Client = getDatabase(),
) {
  const [itemsResult, assetsResult, referencesResult] = await Promise.all([
    client.execute(`SELECT id, slug, published_data_json FROM collection_items
      WHERE collection_id = 'collection_projects' AND status = 'published' AND published_data_json IS NOT NULL`),
    client.execute("SELECT id, delivery_url, alt_text, focal_x, focal_y, width, height FROM assets WHERE status = 'ready'"),
    client.execute(`SELECT item_references.source_item_id, item_references.field_definition_id,
      collection_items.published_data_json FROM item_references
      JOIN collection_items ON collection_items.id = item_references.target_item_id
      WHERE collection_items.status = 'published' ORDER BY item_references.position ASC`),
  ]);

  const assets = new Map(
    assetsResult.rows.map((row) => [String(row.id), mapPublicAsset(row)]),
  );
  const refs = new Map<string, Map<string, string[]>>();

  referencesResult.rows.forEach((row) => {
    const data = JSON.parse(String(row.published_data_json)) as Record<string, unknown>;
    const label = typeof data.name === "string" ? data.name : "";
    const fields = refs.get(String(row.source_item_id)) ?? new Map<string, string[]>();
    const fieldId = String(row.field_definition_id);
    fields.set(fieldId, [...(fields.get(fieldId) ?? []), label]);
    refs.set(String(row.source_item_id), fields);
  });

  const projects = itemsResult.rows.flatMap((row) => {
    const data = JSON.parse(String(row.published_data_json)) as Record<string, unknown>;
    const hero = assets.get(String(data.hero_image ?? ""));

    if (!hero || typeof row.slug !== "string" || typeof data.title !== "string") {
      return [];
    }

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
      label: kind === "client"
        ? "Client project"
        : kind === "internal"
          ? "Internal project"
          : "Concept project",
      category: references?.get("project_type")?.[0] ?? "Project",
      year: asNumber(data.year as Row[string]),
      services: references?.get("project_services") ?? [],
      summary: String(data.short_summary ?? ""),
      heroImage: hero,
      cardTheme: data.card_theme === "dark" ? "dark" : "light",
      accentColour: projectAccentColour(data.accent_colour),
      featured: data.featured === true,
      featuredOrder: typeof data.featured_order === "number"
        ? data.featured_order
        : null,
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
            const image = block.type === "image"
              ? assets.get(String(block.assetId ?? ""))
              : undefined;
            return image ? { ...block, image } : block;
          })
        : [],
      credits: Array.isArray(data.credits)
        ? data.credits as Array<Record<string, unknown>>
        : [],
      projectUrl: typeof data.project_url === "string" ? data.project_url : undefined,
      seoTitle: typeof data.seo_title === "string" ? data.seo_title : undefined,
      seoDescription: typeof data.seo_description === "string" ? data.seo_description : undefined,
    };

    const hover = assets.get(String(data.hover_image ?? ""));
    if (hover) {
      project.hoverImage = hover;
    }

    return [project];
  });

  return projects
    .filter((project) => !options.featuredOnly || project.featured)
    .sort((a, b) =>
      (a.featuredOrder ?? Number.MAX_SAFE_INTEGER)
        - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER)
      || b.year - a.year
      || a.title.localeCompare(b.title));
}

export async function getPublicProject(slug: string, client: Client = getDatabase()) {
  return (await listPublicProjects({}, client))
    .find((project) => project.slug === slug) ?? null;
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
