import type { Client, Row } from "@libsql/client";
import { CmsRepositoryError } from "./cms-repository.js";
import { getDatabase } from "./database.js";

function asNumber(value: Row[string]) {
  return typeof value === "bigint" ? Number(value) : Number(value ?? 0);
}

function mapAsset(row: Row) {
  return {
    id: String(row.id),
    url: String(row.delivery_url),
    originalFilename: String(row.original_filename),
    mimeType: String(row.mime_type),
    byteSize: asNumber(row.byte_size),
    width: asNumber(row.width),
    height: asNumber(row.height),
    altText: String(row.alt_text ?? ""),
    caption: String(row.caption ?? ""),
    focalX: Number(row.focal_x),
    focalY: Number(row.focal_y),
    decorative: asNumber(row.decorative) === 1,
    status: String(row.status),
    version: asNumber(row.version),
    usageCount: asNumber(row.usage_count),
    publishedUsageCount: asNumber(row.published_usage_count),
    createdAt: String(row.created_at),
  };
}

const assetSelect = `SELECT assets.*,
  count(asset_usages.asset_id) AS usage_count,
  sum(CASE WHEN collection_items.status = 'published' THEN 1 ELSE 0 END) AS published_usage_count
  FROM assets
  LEFT JOIN asset_usages ON asset_usages.asset_id = assets.id
  LEFT JOIN collection_items ON collection_items.id = asset_usages.item_id`;

export async function listAssets(client: Client = getDatabase()) {
  const result = await client.execute(`${assetSelect}
    WHERE assets.status != 'archived'
    GROUP BY assets.id ORDER BY assets.created_at DESC LIMIT 200`);
  return result.rows.map(mapAsset);
}

export async function getAsset(id: string, client: Client = getDatabase()) {
  const result = await client.execute({ sql: `${assetSelect} WHERE assets.id = ? GROUP BY assets.id`, args: [id] });
  return result.rows[0] ? mapAsset(result.rows[0]) : null;
}

export async function createAsset(input: {
  id: string; provider: "external" | "vercel_blob"; providerAssetId: string; deliveryUrl: string;
  originalFilename: string; mimeType: string; byteSize: number; width: number; height: number;
  altText: string; caption: string; focalX: number; focalY: number; decorative: boolean;
}, actorId: string, requestId: string, client: Client = getDatabase()) {
  if (!input.decorative && !input.altText.trim()) {
    throw new CmsRepositoryError("ALT_TEXT_REQUIRED", "Describe the image or mark it as decorative.", 422);
  }
  if (![input.focalX, input.focalY].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
    throw new CmsRepositoryError("INVALID_FOCAL_POINT", "The focal point must stay within the image.", 422);
  }
  if (![input.byteSize, input.width, input.height].every((value) => Number.isInteger(value) && value > 0)) {
    throw new CmsRepositoryError("INVALID_ASSET_METADATA", "The image dimensions or size are invalid.", 422);
  }
  await client.batch([
    { sql: `INSERT INTO assets (id, provider, provider_asset_id, delivery_url, original_filename,
      mime_type, byte_size, width, height, alt_text, caption, focal_x, focal_y, decorative,
      status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ready', ?)`, args: [
      input.id, input.provider, input.providerAssetId, input.deliveryUrl, input.originalFilename,
      input.mimeType, input.byteSize, input.width, input.height, input.altText.trim(), input.caption.trim(),
      input.focalX, input.focalY, input.decorative ? 1 : 0, actorId,
    ] },
    { sql: `INSERT INTO audit_events (id, actor_id, action, entity_type, entity_id, summary_json, request_id)
      VALUES (?, ?, 'asset.create', 'asset', ?, '{}', ?)`, args: [crypto.randomUUID(), actorId, input.id, requestId] },
  ], "write");
  return getAsset(input.id, client);
}

export async function updateAsset(id: string, value: unknown, actorId: string, requestId: string, client: Client = getDatabase()) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new CmsRepositoryError("INVALID_ASSET", "Media details are required.", 422);
  const input = value as Record<string, unknown>;
  const current = await getAsset(id, client);
  if (!current) throw new CmsRepositoryError("NOT_FOUND", "That media asset does not exist.", 404);
  if (input.version !== current.version) throw new CmsRepositoryError("VERSION_CONFLICT", "This media item changed after it was opened.", 409);
  const decorative = input.decorative === true;
  const altText = typeof input.altText === "string" ? input.altText.trim() : "";
  if (!decorative && !altText) throw new CmsRepositoryError("ALT_TEXT_REQUIRED", "Describe the image or mark it as decorative.", 422);
  const focalX = Number(input.focalX ?? 0.5);
  const focalY = Number(input.focalY ?? 0.5);
  if (![focalX, focalY].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) throw new CmsRepositoryError("INVALID_FOCAL_POINT", "The focal point must stay within the image.", 422);
  const result = await client.execute({ sql: `UPDATE assets SET alt_text = ?, caption = ?, focal_x = ?, focal_y = ?, decorative = ?,
    version = version + 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ? AND version = ?`, args: [
    altText, typeof input.caption === "string" ? input.caption.trim() : "", focalX, focalY, decorative ? 1 : 0, id, current.version,
  ] });
  if (result.rowsAffected !== 1) throw new CmsRepositoryError("VERSION_CONFLICT", "This media item changed while it was saving.", 409);
  await client.execute({ sql: `INSERT INTO audit_events (id, actor_id, action, entity_type, entity_id, summary_json, request_id)
    VALUES (?, ?, 'asset.update', 'asset', ?, '{}', ?)`, args: [crypto.randomUUID(), actorId, id, requestId] });
  return getAsset(id, client);
}

export async function archiveAsset(id: string, actorId: string, requestId: string, client: Client = getDatabase()) {
  const current = await getAsset(id, client);
  if (!current) throw new CmsRepositoryError("NOT_FOUND", "That media asset does not exist.", 404);
  if (current.publishedUsageCount > 0) throw new CmsRepositoryError("ASSET_IN_USE", "Unpublish or replace this image before archiving it.", 409);
  await client.batch([
    { sql: `UPDATE assets SET status = 'archived', version = version + 1,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`, args: [id] },
    { sql: `INSERT INTO audit_events (id, actor_id, action, entity_type, entity_id, summary_json, request_id)
      VALUES (?, ?, 'asset.archive', 'asset', ?, '{}', ?)`, args: [crypto.randomUUID(), actorId, id, requestId] },
  ], "write");
  return { id, archived: true };
}

export async function getAssetStorageRecord(id: string, client: Client = getDatabase()) {
  const result = await client.execute({ sql: "SELECT provider, provider_asset_id, mime_type, status FROM assets WHERE id = ?", args: [id] });
  return result.rows[0] ?? null;
}
