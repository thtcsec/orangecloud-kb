CREATE TABLE IF NOT EXISTS note_audit (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'published', 'unpublished')),
  author TEXT,
  status TEXT,
  summary TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_note_audit_note_id ON note_audit(note_id, created_at DESC);
