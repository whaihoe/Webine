import type { Client, InStatement, Row } from "@libsql/client";
import {
  validateCollectionDefinition,
  validateCollectionMutation,
  validateItemData,
  type CollectionDefinition,
  type FieldDefinition,
  type FieldOption,
  type FieldValidation,
  type ValidationIssue,
} from "../src/cms/schema.js";
import { getDatabase } from "./database.js";

export class CmsRepositoryError extends Error {
  code: string;
  status: number;
  issues?: ValidationIssue[];

  constructor(code: string, message: string, status: number, issues?: ValidationIssue[]) {
    super(message);
    this.name = "CmsRepositoryError";
    this.code = code;
    this.status = status;
    this.issues = issues;
  }
}

function isDatabaseBusy(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "SQLITE_BUSY";
}

function numberValue(value: Row[string]) {
  return typeof value === "bigint" ? Number(value) : Number(value ?? 0);
}

function parseJsonObject(value: Row[string]): Record<string, unknown> {
  if (typeof value !== "string") return {};
  const parsed = JSON.parse(value) as unknown;
  return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
    ? parsed as Record<string, unknown>
    : {};
}

function parseOptions(value: Row[string]): FieldOption[] | undefined {
  if (typeof value !== "string") return undefined;
  const parsed = JSON.parse(value) as unknown;
  return Array.isArray(parsed) ? parsed as FieldOption[] : undefined;
}

function mapField(row: Row): FieldDefinition {
  return {
    key: String(row.key),
    label: String(row.label),
    helpText: String(row.help_text ?? ""),
    placeholder: String(row.placeholder ?? ""),
    fieldType: String(row.field_type) as FieldDefinition["fieldType"],
    required: numberValue(row.required) === 1,
    position: numberValue(row.position),
    isSystem: numberValue(row.is_system) === 1,
    validation: parseJsonObject(row.validation_json) as FieldValidation,
    options: parseOptions(row.options_json),
  };
}

export async function getCollectionDefinition(
  collectionKey: string,
  client: Client = getDatabase(),
): Promise<CollectionDefinition | null> {
  const collectionResult = await client.execute({
    sql: "SELECT * FROM collections WHERE key = ?",
    args: [collectionKey],
  });
  const collection = collectionResult.rows[0];
  if (!collection) return null;

  const fieldsResult = await client.execute({
    sql: "SELECT * FROM field_definitions WHERE collection_id = ? ORDER BY position ASC",
    args: [String(collection.id)],
  });

  return {
    key: String(collection.key),
    nameSingular: String(collection.name_singular),
    namePlural: String(collection.name_plural),
    description: String(collection.description ?? ""),
    displayFieldKey: String(collection.display_field_key),
    slugFieldKey: collection.slug_field_key === null
      ? undefined
      : String(collection.slug_field_key),
    isSystem: numberValue(collection.is_system) === 1,
    status: String(collection.status) as CollectionDefinition["status"],
    version: numberValue(collection.version),
    fields: fieldsResult.rows.map(mapField),
  };
}

function assertCollectionInput(value: unknown): CollectionDefinition {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new CmsRepositoryError("INVALID_COLLECTION", "Collection data is required.", 422);
  }

  const input = value as Partial<CollectionDefinition>;
  const fields = Array.isArray(input.fields) ? input.fields : [];
  const collection: CollectionDefinition = {
    key: typeof input.key === "string" ? input.key.trim() : "",
    nameSingular: typeof input.nameSingular === "string" ? input.nameSingular.trim() : "",
    namePlural: typeof input.namePlural === "string" ? input.namePlural.trim() : "",
    description: typeof input.description === "string" ? input.description.trim() : "",
    displayFieldKey: typeof input.displayFieldKey === "string" ? input.displayFieldKey.trim() : "",
    slugFieldKey: typeof input.slugFieldKey === "string" && input.slugFieldKey.trim()
      ? input.slugFieldKey.trim()
      : undefined,
    isSystem: input.isSystem === true,
    status: input.status === "archived" ? "archived" : "active",
    version: typeof input.version === "number" ? input.version : undefined,
    fields: fields.map((candidate, index) => {
      const field = candidate as Partial<FieldDefinition>;
      return {
        key: typeof field.key === "string" ? field.key.trim() : "",
        label: typeof field.label === "string" ? field.label.trim() : "",
        helpText: typeof field.helpText === "string" ? field.helpText.trim() : "",
        placeholder: typeof field.placeholder === "string" ? field.placeholder.trim() : "",
        fieldType: String(field.fieldType ?? "") as FieldDefinition["fieldType"],
        required: field.required === true,
        position: index,
        isSystem: field.isSystem === true,
        validation: typeof field.validation === "object" && field.validation !== null
          ? field.validation
          : {},
        options: Array.isArray(field.options)
          ? field.options.map((option) => ({
              key: String(option.key ?? "").trim(),
              label: String(option.label ?? "").trim(),
            }))
          : undefined,
      };
    }),
  };
  const issues = validateCollectionDefinition(collection);

  if (issues.length > 0) {
    throw new CmsRepositoryError("VALIDATION_FAILED", "Review the collection fields.", 422, issues);
  }

  return collection;
}

function fieldInsert(field: FieldDefinition, collectionId: string): InStatement {
  return {
    sql: `INSERT INTO field_definitions (
      id, collection_id, key, label, help_text, placeholder, field_type,
      required, validation_json, options_json, position, is_system
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(), collectionId, field.key, field.label,
      field.helpText ?? "", field.placeholder ?? "", field.fieldType,
      field.required ? 1 : 0, JSON.stringify(field.validation),
      field.options ? JSON.stringify(field.options) : null,
      field.position, field.isSystem ? 1 : 0,
    ],
  };
}

function auditStatement(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  requestId: string,
): InStatement {
  return {
    sql: `INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, summary_json, request_id
    ) VALUES (?, ?, ?, ?, ?, '{}', ?)`,
    args: [crypto.randomUUID(), actorId, action, entityType, entityId, requestId],
  };
}

export async function createCollection(
  value: unknown,
  actorId: string,
  requestId: string,
  client: Client = getDatabase(),
) {
  const collection = assertCollectionInput(value);
  collection.isSystem = false;
  collection.status = "active";
  collection.fields = collection.fields.map((field) => ({ ...field, isSystem: false }));
  const collectionId = crypto.randomUUID();
  const statements: InStatement[] = [
    {
      sql: `INSERT INTO collections (
        id, key, name_singular, name_plural, description, display_field_key,
        slug_field_key, is_system, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'active')`,
      args: [
        collectionId, collection.key, collection.nameSingular,
        collection.namePlural, collection.description ?? "",
        collection.displayFieldKey, collection.slugFieldKey ?? null,
      ],
    },
    ...collection.fields.map((field) => fieldInsert(field, collectionId)),
    auditStatement(actorId, "collection.create", "collection", collectionId, requestId),
  ];

  try {
    await client.batch(statements, "write");
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      throw new CmsRepositoryError("COLLECTION_KEY_EXISTS", "That collection key is already in use.", 409);
    }
    throw error;
  }

  return getCollectionDefinition(collection.key, client);
}

async function getMutationContext(collectionId: string, client: Client) {
  const result = await client.execute({
    sql: "SELECT data_json FROM collection_items WHERE collection_id = ?",
    args: [collectionId],
  });
  const valuesByField: Record<string, unknown[]> = {};

  result.rows.forEach((row) => {
    const data = parseJsonObject(row.data_json);
    Object.entries(data).forEach(([key, value]) => {
      (valuesByField[key] ??= []).push(value);
    });
  });

  return { itemCount: result.rows.length, valuesByField };
}

export async function updateCollection(
  collectionKey: string,
  value: unknown,
  actorId: string,
  requestId: string,
  client: Client = getDatabase(),
) {
  const current = await getCollectionDefinition(collectionKey, client);
  if (!current) throw new CmsRepositoryError("NOT_FOUND", "That collection does not exist.", 404);

  const next = assertCollectionInput(value);
  if (next.version !== current.version) {
    throw new CmsRepositoryError("VERSION_CONFLICT", "This collection changed after it was opened. Reload before saving.", 409);
  }

  const idResult = await client.execute({ sql: "SELECT id FROM collections WHERE key = ?", args: [collectionKey] });
  const collectionId = String(idResult.rows[0].id);
  const context = await getMutationContext(collectionId, client);
  const issues = validateCollectionMutation(current, next, context);
  if (issues.length > 0) {
    throw new CmsRepositoryError("VALIDATION_FAILED", "Review the collection changes.", 422, issues);
  }

  const existingResult = await client.execute({
    sql: "SELECT id, key FROM field_definitions WHERE collection_id = ?",
    args: [collectionId],
  });
  const existingIds = new Map(existingResult.rows.map((row) => [String(row.key), String(row.id)]));
  const nextKeys = new Set(next.fields.map((field) => field.key));
  const statements: InStatement[] = [
    {
      sql: `UPDATE collections SET
        name_singular = ?, name_plural = ?, description = ?, display_field_key = ?,
        slug_field_key = ?, status = ?, version = version + 1,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = ? AND version = ?`,
      args: [
        next.nameSingular, next.namePlural, next.description ?? "",
        next.displayFieldKey, next.slugFieldKey ?? null, next.status,
        collectionId, current.version ?? 1,
      ],
    },
    {
      sql: "UPDATE field_definitions SET position = position + 1000 WHERE collection_id = ?",
      args: [collectionId],
    },
  ];

  next.fields.forEach((field) => {
    const fieldId = existingIds.get(field.key);
    if (!fieldId) {
      statements.push(fieldInsert(field, collectionId));
      return;
    }
    statements.push({
      sql: `UPDATE field_definitions SET
        label = ?, help_text = ?, placeholder = ?, field_type = ?, required = ?,
        validation_json = ?, options_json = ?, position = ?, version = version + 1,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = ?`,
      args: [
        field.label, field.helpText ?? "", field.placeholder ?? "", field.fieldType,
        field.required ? 1 : 0, JSON.stringify(field.validation),
        field.options ? JSON.stringify(field.options) : null,
        field.position, fieldId,
      ],
    });
  });

  existingIds.forEach((fieldId, key) => {
    if (!nextKeys.has(key)) {
      statements.push({ sql: "DELETE FROM field_definitions WHERE id = ?", args: [fieldId] });
    }
  });
  statements.push(auditStatement(actorId, "collection.update", "collection", collectionId, requestId));
  const results = await client.batch(statements, "write");

  if (results[0].rowsAffected !== 1) {
    throw new CmsRepositoryError("VERSION_CONFLICT", "This collection changed while it was saving. Reload before trying again.", 409);
  }

  return getCollectionDefinition(next.key, client);
}

export async function getItem(
  collectionKey: string,
  itemId: string,
  client: Client = getDatabase(),
) {
  const result = await client.execute({
    sql: `SELECT collection_items.* FROM collection_items
      JOIN collections ON collections.id = collection_items.collection_id
      WHERE collections.key = ? AND collection_items.id = ?`,
    args: [collectionKey, itemId],
  });
  const row = result.rows[0];
  if (!row) return null;

  return {
    id: String(row.id),
    slug: row.slug === null ? null : String(row.slug),
    status: String(row.status),
    version: numberValue(row.version),
    data: parseJsonObject(row.data_json),
    updatedAt: String(row.updated_at),
  };
}

async function validateItem(
  collectionKey: string,
  data: unknown,
  client: Client,
  requireRequiredFields = false,
) {
  const collection = await getCollectionDefinition(collectionKey, client);
  if (!collection) throw new CmsRepositoryError("NOT_FOUND", "That collection does not exist.", 404);
  const [assetResult, referenceResult] = await Promise.all([
    client.execute("SELECT id, status, alt_text, decorative FROM assets"),
    client.execute(`SELECT collection_items.id, collection_items.status, collections.key AS collection_key
      FROM collection_items JOIN collections ON collections.id = collection_items.collection_id`),
  ]);
  const assets = Object.fromEntries(assetResult.rows.map((row) => [
    String(row.id),
    { status: String(row.status), altText: String(row.alt_text ?? ""), decorative: numberValue(row.decorative) === 1 },
  ]));
  const references = Object.fromEntries(referenceResult.rows.map((row) => [
    String(row.id),
    { status: String(row.status), collectionKey: String(row.collection_key) },
  ]));
  const issues = validateItemData(collection, data, {
    requireRequiredFields,
    assets,
    references,
  });
  if (collectionKey === "projects" && data && typeof data === "object" && !Array.isArray(data)) {
    const blocks = (data as Record<string, unknown>).content_blocks;
    if (Array.isArray(blocks)) blocks.forEach((block, index) => {
      if (!block || typeof block !== "object" || (block as Record<string, unknown>).type !== "image") return;
      const assetId = (block as Record<string, unknown>).assetId;
      if (typeof assetId !== "string" || assets[assetId]?.status !== "ready") {
        issues.push({ path: `content_blocks.${index}.assetId`, code: "ASSET_NOT_READY", message: "Select an uploaded image for this block." });
      }
    });
  }
  if (issues.length > 0) {
    throw new CmsRepositoryError("VALIDATION_FAILED", "Review the item fields.", 422, issues);
  }
  return collection;
}

function itemSlug(collection: CollectionDefinition, data: Record<string, unknown>) {
  const value = collection.slugFieldKey ? data[collection.slugFieldKey] : undefined;
  return typeof value === "string" && value ? value : null;
}

async function itemRelationshipStatements(
  collectionId: string,
  itemId: string,
  collection: CollectionDefinition,
  data: Record<string, unknown>,
  client: Client,
) {
  const fieldResult = await client.execute({
    sql: "SELECT id, key FROM field_definitions WHERE collection_id = ?",
    args: [collectionId],
  });
  const fieldIds = new Map(fieldResult.rows.map((row) => [String(row.key), String(row.id)]));
  const statements: InStatement[] = [
    { sql: "DELETE FROM asset_usages WHERE item_id = ?", args: [itemId] },
    { sql: "DELETE FROM item_references WHERE source_item_id = ?", args: [itemId] },
  ];

  collection.fields.forEach((field) => {
    const fieldId = fieldIds.get(field.key);
    if (!fieldId) return;
    const raw = data[field.key];
    const values = Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : [];
    values.forEach((targetId, index) => {
      if (typeof targetId !== "string") return;
      if (field.fieldType === "image" || field.fieldType === "gallery") {
        statements.push({
          sql: "INSERT INTO asset_usages (asset_id, item_id, field_definition_id, usage_path) VALUES (?, ?, ?, ?)",
          args: [targetId, itemId, fieldId, field.fieldType === "gallery" ? String(index) : ""],
        });
      }
      if (field.fieldType === "reference" || field.fieldType === "multi_reference") {
        statements.push({
          sql: "INSERT INTO item_references (source_item_id, field_definition_id, target_item_id, position) VALUES (?, ?, ?, ?)",
          args: [itemId, fieldId, targetId, index],
        });
      }
    });
    if (field.fieldType === "content_blocks" && Array.isArray(raw)) {
      raw.forEach((block, index) => {
        if (!block || typeof block !== "object" || (block as Record<string, unknown>).type !== "image") return;
        const assetId = (block as Record<string, unknown>).assetId;
        if (typeof assetId === "string") statements.push({
          sql: "INSERT INTO asset_usages (asset_id, item_id, field_definition_id, usage_path) VALUES (?, ?, ?, ?)",
          args: [assetId, itemId, fieldId, `content_blocks.${index}.assetId`],
        });
      });
    }
  });
  return statements;
}

export async function createItem(
  collectionKey: string,
  data: unknown,
  actorId: string,
  requestId: string,
  client: Client = getDatabase(),
) {
  const collection = await validateItem(collectionKey, data, client);
  const collectionResult = await client.execute({ sql: "SELECT id FROM collections WHERE key = ?", args: [collectionKey] });
  const collectionId = String(collectionResult.rows[0].id);
  const itemId = crypto.randomUUID();
  const record = data as Record<string, unknown>;
  const relationships = await itemRelationshipStatements(collectionId, itemId, collection, record, client);

  try {
    await client.batch([
      {
        sql: `INSERT INTO collection_items (
          id, collection_id, slug, status, data_json, created_by, updated_by
        ) VALUES (?, ?, ?, 'draft', ?, ?, ?)`,
        args: [itemId, collectionId, itemSlug(collection, record), JSON.stringify(record), actorId, actorId],
      },
      ...relationships,
      auditStatement(actorId, "item.create", "collection_item", itemId, requestId),
    ], "write");
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      throw new CmsRepositoryError("SLUG_EXISTS", "That slug is already in use in this collection.", 409);
    }
    throw error;
  }

  return getItem(collectionKey, itemId, client);
}

export async function updateItem(
  collectionKey: string,
  itemId: string,
  value: unknown,
  actorId: string,
  requestId: string,
  client: Client = getDatabase(),
) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new CmsRepositoryError("INVALID_ITEM", "Item data is required.", 422);
  }
  const input = value as { data?: unknown; version?: unknown };
  if (typeof input.version !== "number") {
    throw new CmsRepositoryError("VERSION_REQUIRED", "The item version is required.", 422);
  }
  const current = await getItem(collectionKey, itemId, client);
  if (!current) throw new CmsRepositoryError("NOT_FOUND", "That item does not exist.", 404);
  if (current.version !== input.version) {
    throw new CmsRepositoryError("VERSION_CONFLICT", "This item changed after it was opened. Reload before saving.", 409);
  }
  const collection = await validateItem(collectionKey, input.data, client);
  const record = input.data as Record<string, unknown>;
  const collectionResult = await client.execute({ sql: "SELECT id FROM collections WHERE key = ?", args: [collectionKey] });
  const relationships = await itemRelationshipStatements(String(collectionResult.rows[0].id), itemId, collection, record, client);
  let transaction: Awaited<ReturnType<Client["transaction"]>> | undefined;
  try {
    transaction = await client.transaction("write");
    const update = await transaction.execute({
      sql: `UPDATE collection_items SET slug = ?, data_json = ?, updated_by = ?,
        version = version + 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = ? AND version = ?`,
      args: [itemSlug(collection, record), JSON.stringify(record), actorId, itemId, input.version],
    });
    if (update.rowsAffected !== 1) {
      throw new CmsRepositoryError("VERSION_CONFLICT", "This item changed while it was saving. Reload before trying again.", 409);
    }
    for (const statement of [...relationships, auditStatement(actorId, "item.update", "collection_item", itemId, requestId)]) {
      await transaction.execute(statement);
    }
    await transaction.commit();
  } catch (error) {
    await transaction?.rollback();
    if (error instanceof CmsRepositoryError) throw error;
    if (isDatabaseBusy(error)) throw new CmsRepositoryError("VERSION_CONFLICT", "This item is already being saved. Reload before trying again.", 409);
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      throw new CmsRepositoryError("SLUG_EXISTS", "That slug is already in use in this collection.", 409);
    }
    throw error;
  }
  return getItem(collectionKey, itemId, client);
}

export async function changeItemStatus(
  collectionKey: string,
  itemId: string,
  value: unknown,
  actorId: string,
  requestId: string,
  client: Client = getDatabase(),
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new CmsRepositoryError("INVALID_ACTION", "Choose a publishing action.", 422);
  const { action, version } = value as { action?: unknown; version?: unknown };
  if (!(["publish", "unpublish", "archive"] as unknown[]).includes(action) || typeof version !== "number") throw new CmsRepositoryError("INVALID_ACTION", "Choose a valid action and item version.", 422);
  const current = await getItem(collectionKey, itemId, client);
  if (!current) throw new CmsRepositoryError("NOT_FOUND", "That item does not exist.", 404);
  if (current.version !== version) throw new CmsRepositoryError("VERSION_CONFLICT", "This item changed after it was opened.", 409);
  const record = current.data as Record<string, unknown>;
  if (action === "publish") await validateItem(collectionKey, record, client, true);
  if (action === "archive") {
    const inbound = await client.execute({ sql: `SELECT count(*) AS total FROM item_references
      JOIN collection_items ON collection_items.id = item_references.source_item_id
      WHERE target_item_id = ? AND collection_items.status = 'published'`, args: [itemId] });
    if (numberValue(inbound.rows[0]?.total) > 0) throw new CmsRepositoryError("ITEM_IN_USE", "Remove this item from published content before archiving it.", 409);
  }
  const nextStatus = action === "publish" ? "published" : action === "archive" ? "archived" : "draft";
  const snapshotType = action === "publish" ? "publish" : action === "archive" ? "archive" : "unpublish";
  const updateSql = action === "publish"
    ? `UPDATE collection_items SET status = 'published', published_data_json = data_json,
        published_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), updated_by = ?, version = version + 1,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ? AND version = ?`
    : `UPDATE collection_items SET status = ?, updated_by = ?, version = version + 1,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ? AND version = ?`;
  const updateArgs = action === "publish" ? [actorId, itemId, version] : [nextStatus, actorId, itemId, version];
  let transaction: Awaited<ReturnType<Client["transaction"]>> | undefined;
  try {
    transaction = await client.transaction("write");
    const update = await transaction.execute({ sql: updateSql, args: updateArgs });
    if (update.rowsAffected !== 1) throw new CmsRepositoryError("VERSION_CONFLICT", "This item changed while the action was running.", 409);
    await transaction.execute({ sql: `INSERT INTO item_snapshots (id, item_id, snapshot_type, data_json, item_version, created_by)
      VALUES (?, ?, ?, ?, ?, ?)`, args: [crypto.randomUUID(), itemId, snapshotType, JSON.stringify(record), version, actorId] });
    await transaction.execute(auditStatement(actorId, `item.${action}`, "collection_item", itemId, requestId));
    await transaction.commit();
  } catch (error) {
    await transaction?.rollback();
    if (isDatabaseBusy(error)) throw new CmsRepositoryError("VERSION_CONFLICT", "This item is already being changed. Reload before trying again.", 409);
    throw error;
  }
  return getItem(collectionKey, itemId, client);
}

export async function purgeItem(
  collectionKey: string,
  itemId: string,
  value: unknown,
  actorId: string,
  requestId: string,
  client: Client = getDatabase(),
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CmsRepositoryError("INVALID_ACTION", "Confirm the item version before deleting it.", 422);
  }

  const { version } = value as { version?: unknown };
  if (typeof version !== "number") {
    throw new CmsRepositoryError("VERSION_REQUIRED", "The item version is required.", 422);
  }

  const current = await getItem(collectionKey, itemId, client);
  if (!current) throw new CmsRepositoryError("NOT_FOUND", "That item does not exist.", 404);
  if (current.version !== version) {
    throw new CmsRepositoryError("VERSION_CONFLICT", "This item changed after it was opened.", 409);
  }
  if (current.status === "published") {
    throw new CmsRepositoryError("ARCHIVE_REQUIRED", "Archive this published item before deleting it permanently.", 409);
  }
  if (itemId === "item_site_settings") {
    throw new CmsRepositoryError("SYSTEM_ITEM_PROTECTED", "Site Settings cannot be deleted.", 409);
  }

  const inbound = await client.execute({
    sql: "SELECT count(*) AS total FROM item_references WHERE target_item_id = ?",
    args: [itemId],
  });
  if (numberValue(inbound.rows[0]?.total) > 0) {
    throw new CmsRepositoryError("ITEM_IN_USE", "Remove this item from other content before deleting it permanently.", 409);
  }

  let transaction: Awaited<ReturnType<Client["transaction"]>> | undefined;
  try {
    transaction = await client.transaction("write");
    await transaction.execute({
      sql: "DELETE FROM item_snapshots WHERE item_id = ?",
      args: [itemId],
    });
    const deleted = await transaction.execute({
      sql: "DELETE FROM collection_items WHERE id = ? AND version = ? AND status != 'published'",
      args: [itemId, version],
    });
    if (deleted.rowsAffected !== 1) {
      throw new CmsRepositoryError("VERSION_CONFLICT", "This item changed while it was being deleted.", 409);
    }
    await transaction.execute(auditStatement(
      actorId,
      "item.purge",
      "collection_item",
      itemId,
      requestId,
    ));
    await transaction.commit();
  } catch (error) {
    await transaction?.rollback();
    if (error instanceof CmsRepositoryError) throw error;
    if (isDatabaseBusy(error)) {
      throw new CmsRepositoryError("VERSION_CONFLICT", "This item is already being changed. Reload before trying again.", 409);
    }
    throw error;
  }

  return { id: itemId, purged: true };
}
