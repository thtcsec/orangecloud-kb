import type { SearchResult } from "@kb/shared";
import type { Env } from "../env";
import { chunkText, parseVectorId, vectorId } from "../lib/chunking";
import { nowIso } from "../lib/utils";
import type { Note } from "@kb/shared";

interface EmbeddingResponse {
  data: number[][];
}

export async function generateEmbeddings(env: Env, texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const batchSize = 32;
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = (await env.AI.run(env.EMBEDDING_MODEL, {
      text: batch,
    })) as unknown as EmbeddingResponse;

    if (!response?.data?.length) {
      throw new Error("Failed to generate embeddings");
    }
    embeddings.push(...response.data);
  }

  return embeddings;
}

export async function syncNoteEmbeddings(env: Env, note: Note): Promise<number> {
  const chunkSize = Number.parseInt(env.CHUNK_SIZE, 10) || 500;
  const chunkOverlap = Number.parseInt(env.CHUNK_OVERLAP, 10) || 50;
  const chunks = chunkText(note.content, chunkSize, chunkOverlap);

  await deleteNoteVectors(env, note.id);

  if (chunks.length === 0) {
    await env.DB.prepare(
      "INSERT INTO embeddings_sync (note_id, last_synced_at, chunk_count) VALUES (?, ?, ?) ON CONFLICT(note_id) DO UPDATE SET last_synced_at = excluded.last_synced_at, chunk_count = excluded.chunk_count",
    )
      .bind(note.id, nowIso(), 0)
      .run();
    return 0;
  }

  const header = [
    note.title,
    note.folder ? `Folder: ${note.folder}` : null,
    note.tags ? `Tags: ${note.tags}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  // Embed title/folder/tags with each chunk so semantic queries hit metadata too
  const texts = chunks.map((c) => `${header}\n\n${c.text}`);
  const embeddings = await generateEmbeddings(env, texts);

  const vectors = chunks.map((chunk, i) => ({
    id: vectorId(note.id, chunk.index),
    values: embeddings[i],
    metadata: {
      note_id: note.id,
      title: note.title,
      folder: note.folder ?? "",
      tags: note.tags ?? "",
      chunk_index: chunk.index,
      text: chunk.text.slice(0, 1000),
    },
  }));

  await env.VECTORIZE.upsert(vectors);

  await env.DB.prepare(
    "INSERT INTO embeddings_sync (note_id, last_synced_at, chunk_count) VALUES (?, ?, ?) ON CONFLICT(note_id) DO UPDATE SET last_synced_at = excluded.last_synced_at, chunk_count = excluded.chunk_count",
  )
    .bind(note.id, nowIso(), chunks.length)
    .run();

  return chunks.length;
}

export async function deleteNoteVectors(env: Env, noteId: string): Promise<void> {
  const sync = await env.DB.prepare("SELECT chunk_count FROM embeddings_sync WHERE note_id = ?")
    .bind(noteId)
    .first<{ chunk_count: number | null }>();

  const ids: string[] = [];
  const count = sync?.chunk_count ?? 0;
  for (let i = 0; i < count; i++) {
    ids.push(vectorId(noteId, i));
  }

  if (ids.length > 0) {
    await env.VECTORIZE.deleteByIds(ids);
  }

  await env.DB.prepare("DELETE FROM embeddings_sync WHERE note_id = ?").bind(noteId).run();
}

export async function semanticSearch(
  env: Env,
  query: string,
  topK = 5,
): Promise<SearchResult[]> {
  const [embedding] = await generateEmbeddings(env, [query]);
  if (!embedding) return [];

  const results = await env.VECTORIZE.query(embedding, {
    topK,
    returnMetadata: "all",
  });

  return (results.matches ?? []).map((match) => {
    const metadata = (match.metadata ?? {}) as Record<string, string | number>;
    const parsed = parseVectorId(match.id);
    return {
      note_id: String(metadata.note_id ?? parsed?.noteId ?? ""),
      title: String(metadata.title ?? ""),
      folder: metadata.folder ? String(metadata.folder) : null,
      tags: metadata.tags ? String(metadata.tags) : null,
      chunk_index: Number(metadata.chunk_index ?? parsed?.chunkIndex ?? 0),
      text: String(metadata.text ?? ""),
      score: match.score ?? 0,
    };
  });
}

export async function buildKnowledgeContext(env: Env): Promise<string> {
  const result = await env.DB.prepare(
    "SELECT id, title, folder, tags, content FROM notes WHERE status = 'published' ORDER BY folder, title",
  ).all<Pick<Note, "id" | "title" | "folder" | "tags" | "content">>();

  return (result.results ?? [])
    .map((note) => {
      const header = [
        `# ${note.title}`,
        `ID: ${note.id}`,
        note.folder ? `Folder: ${note.folder}` : null,
        note.tags ? `Tags: ${note.tags}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      return `${header}\n\n${note.content}\n\n---\n`;
    })
    .join("\n");
}
