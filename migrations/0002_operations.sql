PRAGMA foreign_keys = ON;

CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('vercel_blob', 'cloudflare_images', 'r2', 'external')),
  provider_asset_id TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size > 0),
  width INTEGER NOT NULL CHECK (width > 0),
  height INTEGER NOT NULL CHECK (height > 0),
  alt_text TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  focal_x REAL NOT NULL DEFAULT 0.5 CHECK (focal_x BETWEEN 0 AND 1),
  focal_y REAL NOT NULL DEFAULT 0.5 CHECK (focal_y BETWEEN 0 AND 1),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed', 'archived')),
  created_by TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (provider, provider_asset_id)
);

CREATE TABLE asset_usages (
  asset_id TEXT NOT NULL,
  item_id TEXT,
  field_definition_id TEXT,
  usage_path TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (asset_id, item_id, field_definition_id, usage_path),
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE RESTRICT,
  FOREIGN KEY (item_id) REFERENCES collection_items(id) ON DELETE CASCADE,
  FOREIGN KEY (field_definition_id) REFERENCES field_definitions(id) ON DELETE RESTRICT,
  CHECK (item_id IS NOT NULL OR field_definition_id IS NULL)
);

CREATE TABLE audit_events (
  id TEXT PRIMARY KEY,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(summary_json)),
  request_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  service_interest TEXT NOT NULL DEFAULT '',
  budget_range TEXT NOT NULL DEFAULT '',
  timeline TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed', 'spam')),
  source_page TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE idempotency_keys (
  scope TEXT NOT NULL,
  key TEXT NOT NULL,
  response_json TEXT CHECK (response_json IS NULL OR json_valid(response_json)),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'complete', 'failed')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (scope, key)
);

CREATE INDEX assets_status_index ON assets(status, updated_at DESC);
CREATE INDEX asset_usages_item_index ON asset_usages(item_id);
CREATE UNIQUE INDEX asset_usages_unique_index ON asset_usages(
  asset_id,
  ifnull(item_id, ''),
  ifnull(field_definition_id, ''),
  usage_path
);
CREATE INDEX audit_events_entity_index ON audit_events(entity_type, entity_id, created_at DESC);
CREATE INDEX enquiries_status_index ON enquiries(status, created_at DESC);
