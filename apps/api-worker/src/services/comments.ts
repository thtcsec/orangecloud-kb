import type { Comment, CommentInput } from "@kb/shared";
import { nowIso } from "../lib/utils";

export async function listComments(db: D1Database, noteId: string): Promise<Comment[]> {
  const result = await db
    .prepare("SELECT * FROM comments WHERE note_id = ? ORDER BY created_at ASC")
    .bind(noteId)
    .all<Comment>();
  return result.results ?? [];
}

export async function createComment(
  db: D1Database,
  noteId: string,
  input: CommentInput,
): Promise<Comment> {
  const timestamp = nowIso();
  const result = await db
    .prepare("INSERT INTO comments (note_id, author, content, created_at) VALUES (?, ?, ?, ?)")
    .bind(noteId, input.author.trim(), input.content, timestamp)
    .run();

  return {
    id: result.meta.last_row_id as number,
    note_id: noteId,
    author: input.author.trim(),
    content: input.content,
    created_at: timestamp,
  };
}
