PRAGMA foreign_keys = ON;

ALTER TABLE enquiries ADD COLUMN notification_lock_until INTEGER NOT NULL DEFAULT 0;

CREATE INDEX enquiry_rate_limit_window_index
  ON enquiry_rate_limits(window_started_at);
