PRAGMA foreign_keys = ON;

CREATE TABLE collections (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE CHECK (
    substr(key, 1, 1) GLOB '[a-z]' AND
    key NOT GLOB '*[^a-z0-9_]*' AND
    length(key) BETWEEN 2 AND 50
  ),
  name_singular TEXT NOT NULL,
  name_plural TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  display_field_key TEXT NOT NULL,
  slug_field_key TEXT,
  is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1)),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE field_definitions (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  key TEXT NOT NULL CHECK (
    substr(key, 1, 1) GLOB '[a-z]' AND
    key NOT GLOB '*[^a-z0-9_]*' AND
    length(key) BETWEEN 2 AND 50
  ),
  label TEXT NOT NULL,
  help_text TEXT NOT NULL DEFAULT '',
  placeholder TEXT NOT NULL DEFAULT '',
  field_type TEXT NOT NULL CHECK (field_type IN (
    'short_text', 'long_text', 'rich_text', 'number', 'boolean',
    'date_time', 'select', 'multi_select', 'url', 'email', 'slug',
    'colour', 'image', 'gallery', 'reference', 'multi_reference',
    'field_group', 'repeatable_group', 'content_blocks'
  )),
  required INTEGER NOT NULL DEFAULT 0 CHECK (required IN (0, 1)),
  default_json TEXT CHECK (default_json IS NULL OR json_valid(default_json)),
  validation_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(validation_json)),
  options_json TEXT CHECK (options_json IS NULL OR json_valid(options_json)),
  position INTEGER NOT NULL CHECK (position >= 0),
  is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1)),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE RESTRICT,
  UNIQUE (collection_id, key),
  UNIQUE (collection_id, position)
);

CREATE TABLE collection_items (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  slug TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  data_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(data_json)),
  published_data_json TEXT CHECK (published_data_json IS NULL OR json_valid(published_data_json)),
  published_at TEXT,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE RESTRICT,
  UNIQUE (collection_id, slug)
);

CREATE TABLE item_snapshots (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('publish', 'unpublish', 'archive')),
  data_json TEXT NOT NULL CHECK (json_valid(data_json)),
  item_version INTEGER NOT NULL CHECK (item_version > 0),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (item_id) REFERENCES collection_items(id) ON DELETE RESTRICT,
  UNIQUE (item_id, item_version, snapshot_type)
);

CREATE TABLE item_references (
  source_item_id TEXT NOT NULL,
  field_definition_id TEXT NOT NULL,
  target_item_id TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (source_item_id, field_definition_id, position),
  FOREIGN KEY (source_item_id) REFERENCES collection_items(id) ON DELETE CASCADE,
  FOREIGN KEY (field_definition_id) REFERENCES field_definitions(id) ON DELETE RESTRICT,
  FOREIGN KEY (target_item_id) REFERENCES collection_items(id) ON DELETE RESTRICT,
  UNIQUE (source_item_id, field_definition_id, target_item_id)
);

CREATE INDEX collection_items_status_index
  ON collection_items(collection_id, status, updated_at DESC);
CREATE INDEX item_references_target_index
  ON item_references(target_item_id);
