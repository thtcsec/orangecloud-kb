import type { Note, NoteInput, NoteListQuery } from "@kb/shared";
import type { Env } from "../env";
import { escapeFtsQuery, generateId, nowIso } from "../lib/utils";

export async function listNotes(db: D1Database, query: NoteListQuery): Promise<Note[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (query.folder) {
    conditions.push("folder = ?");
    params.push(query.folder);
  }
  if (query.status) {
    conditions.push("status = ?");
    params.push(query.status);
  }
  if (query.tag) {
    conditions.push("(',' || COALESCE(tags, '') || ',') LIKE ?");
    params.push(`%,${query.tag},%`);
  }

  let sql: string;
  if (query.q?.trim()) {
    const ftsQuery = escapeFtsQuery(query.q);
    if (ftsQuery) {
      sql = `
        SELECT n.* FROM notes n
        INNER JOIN notes_fts fts ON fts.rowid = n.rowid
        WHERE notes_fts MATCH ?
        ${conditions.length ? `AND ${conditions.join(" AND ")}` : ""}
        ORDER BY n.updated_at DESC
      `;
      params.unshift(ftsQuery);
    } else {
      sql = buildListSql(conditions);
    }
  } else {
    sql = buildListSql(conditions);
  }

  const result = await db.prepare(sql).bind(...params).all<Note>();
  return result.results ?? [];
}

function buildListSql(conditions: string[]): string {
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return `SELECT * FROM notes ${where} ORDER BY updated_at DESC`;
}

export async function getNoteById(db: D1Database, id: string): Promise<Note | null> {
  return db.prepare("SELECT * FROM notes WHERE id = ?").bind(id).first<Note>();
}

export async function createNote(db: D1Database, input: NoteInput): Promise<Note> {
  const id = generateId();
  const timestamp = nowIso();
  const note: Note = {
    id,
    title: input.title.trim(),
    content: input.content,
    author: input.author.trim(),
    tags: input.tags?.trim() || null,
    folder: input.folder?.trim() || null,
    status: input.status ?? "draft",
    created_at: timestamp,
    updated_at: timestamp,
  };

  await db
    .prepare(
      `INSERT INTO notes (id, title, content, author, tags, folder, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      note.id,
      note.title,
      note.content,
      note.author,
      note.tags,
      note.folder,
      note.status,
      note.created_at,
      note.updated_at,
    )
    .run();

  return note;
}

export async function updateNote(
  db: D1Database,
  id: string,
  input: Partial<NoteInput>,
): Promise<Note | null> {
  const existing = await getNoteById(db, id);
  if (!existing) return null;

  const updated: Note = {
    ...existing,
    title: input.title?.trim() ?? existing.title,
    content: input.content ?? existing.content,
    author: input.author?.trim() ?? existing.author,
    tags: input.tags !== undefined ? input.tags.trim() || null : existing.tags,
    folder: input.folder !== undefined ? input.folder.trim() || null : existing.folder,
    status: input.status ?? existing.status,
    updated_at: nowIso(),
  };

  await db
    .prepare(
      `UPDATE notes SET title = ?, content = ?, author = ?, tags = ?, folder = ?, status = ?, updated_at = ?
       WHERE id = ?`,
    )
    .bind(
      updated.title,
      updated.content,
      updated.author,
      updated.tags,
      updated.folder,
      updated.status,
      updated.updated_at,
      id,
    )
    .run();

  return updated;
}

export async function deleteNote(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare("DELETE FROM notes WHERE id = ?").bind(id).run();
  return (result.meta.changes ?? 0) > 0;
}

export async function getFolders(db: D1Database): Promise<string[]> {
  const result = await db
    .prepare("SELECT DISTINCT folder FROM notes WHERE folder IS NOT NULL AND folder != '' ORDER BY folder")
    .all<{ folder: string }>();
  return (result.results ?? []).map((r) => r.folder);
}

export async function getTags(db: D1Database): Promise<string[]> {
  const result = await db.prepare("SELECT tags FROM notes WHERE tags IS NOT NULL").all<{ tags: string }>();
  const tagSet = new Set<string>();
  for (const row of result.results ?? []) {
    for (const tag of row.tags.split(",")) {
      const trimmed = tag.trim();
      if (trimmed) tagSet.add(trimmed);
    }
  }
  return [...tagSet].sort();
}

export async function getStats(db: D1Database): Promise<{
  total: number;
  published: number;
  drafts: number;
  comments: number;
}> {
  const [notes, published, drafts, comments] = await Promise.all([
    db.prepare("SELECT COUNT(*) as count FROM notes").first<{ count: number }>(),
    db.prepare("SELECT COUNT(*) as count FROM notes WHERE status = 'published'").first<{ count: number }>(),
    db.prepare("SELECT COUNT(*) as count FROM notes WHERE status = 'draft'").first<{ count: number }>(),
    db.prepare("SELECT COUNT(*) as count FROM comments").first<{ count: number }>(),
  ]);

  return {
    total: notes?.count ?? 0,
    published: published?.count ?? 0,
    drafts: drafts?.count ?? 0,
    comments: comments?.count ?? 0,
  };
}

export type NotesServiceEnv = Pick<Env, "DB">;
