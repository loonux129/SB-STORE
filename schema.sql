CREATE TABLE IF NOT EXISTS app_data (
  owner_email TEXT PRIMARY KEY NOT NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
