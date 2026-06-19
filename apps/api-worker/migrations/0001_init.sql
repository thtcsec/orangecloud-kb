-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  tags TEXT,
  folder TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder);
CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);

-- FTS5 virtual table for full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  title,
  content,
  tags,
  folder,
  content='notes',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
  INSERT INTO notes_fts(rowid, title, content, tags, folder)
  VALUES (new.rowid, new.title, new.content, new.tags, new.folder);
END;

CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
  INSERT INTO notes_fts(notes_fts, rowid, title, content, tags, folder)
  VALUES ('delete', old.rowid, old.title, old.content, old.tags, old.folder);
END;

CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
  INSERT INTO notes_fts(notes_fts, rowid, title, content, tags, folder)
  VALUES ('delete', old.rowid, old.title, old.content, old.tags, old.folder);
  INSERT INTO notes_fts(rowid, title, content, tags, folder)
  VALUES (new.rowid, new.title, new.content, new.tags, new.folder);
END;

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_note_id ON comments(note_id);

-- Embeddings sync tracking
CREATE TABLE IF NOT EXISTS embeddings_sync (
  note_id TEXT PRIMARY KEY,
  last_synced_at TEXT,
  chunk_count INTEGER,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);
