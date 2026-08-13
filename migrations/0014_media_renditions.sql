PRAGMA foreign_keys = ON;

ALTER TABLE assets ADD COLUMN display_name TEXT NOT NULL DEFAULT '';
ALTER TABLE assets ADD COLUMN processing_state TEXT NOT NULL DEFAULT 'ready' CHECK (processing_state IN ('processing', 'quarantined', 'ready', 'failed'));

UPDATE assets
SET display_name = CASE
  WHEN trim(alt_text) != '' THEN trim(alt_text)
  WHEN trim(caption) != '' THEN trim(caption)
  ELSE original_filename
END
WHERE display_name = '';

CREATE TABLE asset_renditions (
  asset_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('landing', 'works', 'case-study')),
  delivery_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size > 0),
  width INTEGER NOT NULL CHECK (width > 0),
  height INTEGER NOT NULL CHECK (height > 0),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'quarantined', 'ready', 'failed')),
  error_code TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (asset_id, role),
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE INDEX asset_renditions_status_index ON asset_renditions(asset_id, status);
