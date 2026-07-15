PRAGMA foreign_keys = ON;

ALTER TABLE enquiries ADD COLUMN notification_status TEXT NOT NULL DEFAULT 'pending'
  CHECK (notification_status IN ('pending', 'sent', 'failed'));
ALTER TABLE enquiries ADD COLUMN notification_attempts INTEGER NOT NULL DEFAULT 0 CHECK (notification_attempts >= 0);
ALTER TABLE enquiries ADD COLUMN last_notification_error TEXT NOT NULL DEFAULT '';
ALTER TABLE enquiries ADD COLUMN last_notified_at TEXT;

CREATE TABLE enquiry_rate_limits (
  bucket_key TEXT PRIMARY KEY,
  window_started_at INTEGER NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE enquiry_deduplication (
  submission_hash TEXT PRIMARY KEY,
  enquiry_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE
);

CREATE INDEX enquiry_deduplication_expiry_index ON enquiry_deduplication(expires_at);
CREATE INDEX enquiries_notification_index ON enquiries(notification_status, created_at DESC);
