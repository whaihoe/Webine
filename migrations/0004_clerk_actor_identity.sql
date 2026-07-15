PRAGMA foreign_keys = ON;

ALTER TABLE audit_events RENAME COLUMN actor_email TO actor_id;
