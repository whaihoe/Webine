PRAGMA foreign_keys = ON;

ALTER TABLE assets ADD COLUMN delivery_url TEXT NOT NULL DEFAULT '';
ALTER TABLE assets ADD COLUMN decorative INTEGER NOT NULL DEFAULT 0 CHECK (decorative IN (0, 1));

CREATE INDEX assets_created_index ON assets(created_at DESC);
