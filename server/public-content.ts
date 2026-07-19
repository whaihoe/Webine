import type { Client, Row } from "@libsql/client";
import { getDatabase } from "./database.js";

export type PublicProject = {
  id: string;
  slug: string;
  title: string;
  client: string;
  kind: "client" | "concept" | "internal";
  label: string;
  category: string;
  year: number;
  services: string[];
  summary: string;
  heroImage: { id: string; url: string; altText: string; focalX: number; focalY: number; width: number; height: number };
  hoverImage?: { id: string; url: string; altText: string; focalX: number; focalY: number; width: number; height: number };
  cardTheme: "light" | "dark";
  featured: boolean;
  featuredOrder: number | null;
  challenge?: string;
  approach?: string;
  outcome?: string;
  industry?: string;
  location?: string;
  duration?: string;
  completedOn?: string;
  platform?: string;
  aboutClient?: string;
  contentBlocks: Array<Record<string, unknown>>;
  projectUrl?: string;
  credits: Array<Record<string, unknown>>;
  seoTitle?: string;
  seoDescription?: string;
};

function asNumber(value: Row[string]) { return typeof value === "bigint" ? Number(value) : Number(value ?? 0); }
function textFromStructured(value: unknown) { return value && typeof value === "object" && "text" in value ? String((value as { text: unknown }).text ?? "") : undefined; }

export async function listPublicProjects(options: { featuredOnly?: boolean } = {}, client: Client = getDatabase()) {
  const [itemsResult, assetsResult, referencesResult] = await Promise.all([
    client.execute(`SELECT id, slug, published_data_json FROM collection_items
      WHERE collection_id = 'collection_projects' AND status = 'published' AND published_data_json IS NOT NULL`),
    client.execute("SELECT id, delivery_url, alt_text, focal_x, focal_y, width, height FROM assets WHERE status = 'ready'"),
    client.execute(`SELECT item_references.source_item_id, item_references.field_definition_id,
      collection_items.published_data_json FROM item_references
      JOIN collection_items ON collection_items.id = item_references.target_item_id
      WHERE collection_items.status = 'published' ORDER BY item_references.position ASC`),
  ]);
  const assets = new Map(assetsResult.rows.map((row) => [String(row.id), {
    id: String(row.id), url: String(row.delivery_url), altText: String(row.alt_text), focalX: Number(row.focal_x), focalY: Number(row.focal_y), width: Number(row.width), height: Number(row.height),
  }]));
  const refs = new Map<string, Map<string, string[]>>();
  referencesResult.rows.forEach((row) => {
    const data = JSON.parse(String(row.published_data_json)) as Record<string, unknown>;
    const label = typeof data.name === "string" ? data.name : "";
    const fields = refs.get(String(row.source_item_id)) ?? new Map<string, string[]>();
    fields.set(String(row.field_definition_id), [...(fields.get(String(row.field_definition_id)) ?? []), label]);
    refs.set(String(row.source_item_id), fields);
  });
  const projects = itemsResult.rows.flatMap((row) => {
    const data = JSON.parse(String(row.published_data_json)) as Record<string, unknown>;
    const hero = assets.get(String(data.hero_image ?? ""));
    if (!hero || typeof row.slug !== "string" || typeof data.title !== "string") return [];
    const kind = data.project_kind === "client" || data.project_kind === "internal" ? data.project_kind : "concept";
    const project: PublicProject = {
      id: String(row.id), slug: row.slug, title: data.title, client: String(data.client ?? ""), kind,
      label: kind === "client" ? "Client project" : kind === "internal" ? "Internal project" : "Concept project",
      category: refs.get(String(row.id))?.get("project_type")?.[0] ?? "Project",
      year: asNumber(data.year as Row[string]), services: refs.get(String(row.id))?.get("project_services") ?? [],
      summary: String(data.short_summary ?? ""), heroImage: hero, cardTheme: data.card_theme === "dark" ? "dark" : "light",
      featured: data.featured === true, featuredOrder: typeof data.featured_order === "number" ? data.featured_order : null,
      challenge: textFromStructured(data.challenge), approach: textFromStructured(data.approach), outcome: textFromStructured(data.outcome),
      industry: typeof data.industry === "string" ? data.industry : undefined,
      location: typeof data.location === "string" ? data.location : undefined,
      duration: typeof data.duration === "string" ? data.duration : undefined,
      completedOn: typeof data.completed_on === "string" ? data.completed_on : undefined,
      platform: typeof data.platform === "string" ? data.platform : undefined,
      aboutClient: textFromStructured(data.about_client),
      contentBlocks: Array.isArray(data.content_blocks) ? (data.content_blocks as Array<Record<string, unknown>>).map((block) => {
        const image = block.type === "image" ? assets.get(String(block.assetId ?? "")) : undefined;
        return image ? { ...block, image } : block;
      }) : [],
      credits: Array.isArray(data.credits) ? data.credits as Array<Record<string, unknown>> : [],
      projectUrl: typeof data.project_url === "string" ? data.project_url : undefined,
      seoTitle: typeof data.seo_title === "string" ? data.seo_title : undefined,
      seoDescription: typeof data.seo_description === "string" ? data.seo_description : undefined,
    };
    const hover = assets.get(String(data.hover_image ?? "")); if (hover) project.hoverImage = hover;
    return [project];
  });
  return projects.filter((project) => !options.featuredOnly || project.featured).sort((a, b) =>
    (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER) || b.year - a.year || a.title.localeCompare(b.title));
}

export async function getPublicProject(slug: string, client: Client = getDatabase()) {
  return (await listPublicProjects({}, client)).find((project) => project.slug === slug) ?? null;
}

export async function getPublishedSiteSettings(client: Client = getDatabase()) {
  const result = await client.execute("SELECT published_data_json FROM collection_items WHERE id = 'item_site_settings' AND status = 'published' AND published_data_json IS NOT NULL");
  const value = result.rows[0]?.published_data_json;
  return typeof value === "string" ? JSON.parse(value) as Record<string, unknown> : {};
}
