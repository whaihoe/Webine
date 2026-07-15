import { createClient, type Client, type Row } from "@libsql/client";

let database: Client | undefined;

function asNumber(value: Row[string]) {
  return typeof value === "bigint" ? Number(value) : Number(value ?? 0);
}

export function getDatabase() {
  if (database) return database;

  const url = process.env.TURSO_DATABASE_URL?.trim() || "file:.data/webine.db";
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (process.env.VERCEL === "1" && !process.env.TURSO_DATABASE_URL?.trim()) {
    throw new Error("TURSO_DATABASE_URL is required on Vercel.");
  }

  database = createClient({ url, authToken });
  return database;
}

export async function listCollections(client = getDatabase()) {
  const result = await client.execute(`
    SELECT
      collections.key,
      collections.name_singular,
      collections.name_plural,
      collections.description,
      collections.is_system,
      collections.status,
      count(collection_items.id) AS item_count,
      sum(CASE WHEN collection_items.status = 'published' THEN 1 ELSE 0 END) AS published_count
    FROM collections
    LEFT JOIN collection_items ON collection_items.collection_id = collections.id
    GROUP BY collections.id
    ORDER BY collections.is_system DESC, collections.name_plural ASC
  `);

  return result.rows.map((row) => ({
    key: String(row.key),
    nameSingular: String(row.name_singular),
    namePlural: String(row.name_plural),
    description: String(row.description),
    isSystem: asNumber(row.is_system) === 1,
    status: String(row.status) as "active" | "archived",
    itemCount: asNumber(row.item_count),
    publishedCount: asNumber(row.published_count),
  }));
}

export async function getDashboard(client = getDatabase()) {
  const result = await client.execute(`
    SELECT
      sum(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS drafts,
      sum(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
      count(*) AS total
    FROM collection_items
    WHERE collection_id = 'collection_projects'
      AND status != 'archived'
  `);
  const row = result.rows[0];

  return {
    draftProjects: asNumber(row?.drafts),
    publishedProjects: asNumber(row?.published),
    totalProjects: asNumber(row?.total),
  };
}

export async function listCollectionItems(
  collectionKey: string,
  client = getDatabase(),
) {
  const collectionResult = await client.execute({
    sql: "SELECT id, display_field_key FROM collections WHERE key = ? AND status = 'active'",
    args: [collectionKey],
  });
  const collection = collectionResult.rows[0];

  if (!collection) return null;

  const result = await client.execute({
    sql: `
      SELECT id, slug, status, data_json, version, updated_at
      FROM collection_items
      WHERE collection_id = ? AND status != 'archived'
      ORDER BY updated_at DESC
      LIMIT 100
    `,
    args: [String(collection.id)],
  });

  return result.rows.map((row) => {
    const data = JSON.parse(String(row.data_json)) as Record<string, unknown>;
    const displayValue = data[String(collection.display_field_key)];

    return {
      id: String(row.id),
      slug: row.slug === null ? null : String(row.slug),
      status: String(row.status) as "draft" | "published" | "archived",
      version: asNumber(row.version),
      updatedAt: String(row.updated_at),
      label: typeof displayValue === "string" && displayValue.trim()
        ? displayValue
        : "Untitled item",
    };
  });
}
