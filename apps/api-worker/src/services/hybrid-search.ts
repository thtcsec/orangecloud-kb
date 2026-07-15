import type { SearchResult } from "@kb/shared";
import type { Env } from "../env";
import { escapeFtsQuery, escapeLike } from "../lib/utils";

const RRF_K = 60;
const MAX_CHUNKS_PER_NOTE = 2;

interface FtsNoteRow {
  id: string;
  title: string;
  folder: string | null;
  tags: string | null;
  content: string;
  rank: number;
}

export function normalizeQuery(query: string): string {
  return query.replace(/\s+/g, " ").trim();
}

export async function keywordSearch(
  db: D1Database,
  query: string,
  limit = 10,
): Promise<SearchResult[]> {
  const q = normalizeQuery(query);
  if (!q) return [];

  const ftsQuery = escapeFtsQuery(q);
  let rows: FtsNoteRow[] = [];

  if (ftsQuery) {
    const result = await db
      .prepare(
        `SELECT n.id, n.title, n.folder, n.tags, n.content, notes_fts.rank AS rank
         FROM notes_fts
         INNER JOIN notes n ON n.rowid = notes_fts.rowid
         WHERE notes_fts MATCH ? AND n.status = 'published'
         ORDER BY notes_fts.rank
         LIMIT ?`,
      )
      .bind(ftsQuery, limit)
      .all<FtsNoteRow>();
    rows = result.results ?? [];
  }

  // Fallback / complement: LIKE across title, tags, content when FTS is thin
  if (rows.length < Math.min(3, limit)) {
    const like = `%${escapeLike(q)}%`;
    const fallback = await db
      .prepare(
        `SELECT id, title, folder, tags, content, 0 AS rank
         FROM notes
         WHERE status = 'published'
           AND (
             title LIKE ? ESCAPE '\\'
             OR COALESCE(tags, '') LIKE ? ESCAPE '\\'
             OR content LIKE ? ESCAPE '\\'
           )
         ORDER BY updated_at DESC
         LIMIT ?`,
      )
      .bind(like, like, like, limit)
      .all<FtsNoteRow>();

    const seen = new Set(rows.map((r) => r.id));
    for (const row of fallback.results ?? []) {
      if (!seen.has(row.id)) {
        rows.push(row);
        seen.add(row.id);
      }
      if (rows.length >= limit) break;
    }
  }

  return rows.slice(0, limit).map((row, index) => ({
    note_id: row.id,
    title: row.title,
    folder: row.folder,
    tags: row.tags,
    chunk_index: 0,
    text: extractSnippet(row.content, q, 700),
    score: boostByMetadata(normalizeRankScore(row.rank, index), row, q),
  }));
}

function extractSnippet(content: string, query: string, maxLen: number): string {
  const lower = content.toLowerCase();
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);

  let bestIndex = 0;
  let bestScore = -1;

  for (const term of terms) {
    let from = 0;
    while (from < lower.length) {
      const idx = lower.indexOf(term, from);
      if (idx === -1) break;
      // Prefer denser term clusters near headings-ish positions
      const window = lower.slice(Math.max(0, idx - 40), idx + 80);
      const score = terms.reduce((acc, t) => (window.includes(t) ? acc + 1 : acc), 0);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = Math.max(0, idx - 120);
      }
      from = idx + term.length;
    }
  }

  const snippet = content.slice(bestIndex, bestIndex + maxLen).trim();
  return bestIndex > 0 ? `…${snippet}` : snippet;
}

function normalizeRankScore(rank: number, index: number): number {
  if (Number.isFinite(rank) && rank !== 0) {
    return 1 / (1 + Math.abs(rank));
  }
  return 1 / (index + 1);
}

function boostByMetadata(score: number, row: FtsNoteRow, query: string): number {
  const q = query.toLowerCase();
  let boosted = score;
  if (row.title.toLowerCase().includes(q)) boosted += 0.25;
  if ((row.tags ?? "").toLowerCase().includes(q)) boosted += 0.15;
  if ((row.folder ?? "").toLowerCase().includes(q)) boosted += 0.08;
  return boosted;
}

export function reciprocalRankFusion(lists: SearchResult[][], topK: number): SearchResult[] {
  const merged = new Map<string, SearchResult>();

  for (const list of lists) {
    list.forEach((item, rank) => {
      const key = `${item.note_id}::${item.chunk_index}`;
      const rrfScore = 1 / (RRF_K + rank + 1);
      const existing = merged.get(key);

      if (existing) {
        existing.score += rrfScore;
        if (item.text.length > existing.text.length) {
          existing.text = item.text;
        }
      } else {
        merged.set(key, { ...item, score: rrfScore });
      }
    });
  }

  return diversifyByNote([...merged.values()].sort((a, b) => b.score - a.score), topK);
}

/** Prefer covering more notes; keep at most N chunks per note. */
function diversifyByNote(sorted: SearchResult[], topK: number): SearchResult[] {
  const perNote = new Map<string, number>();
  const out: SearchResult[] = [];

  for (const item of sorted) {
    const count = perNote.get(item.note_id) ?? 0;
    if (count >= MAX_CHUNKS_PER_NOTE) continue;
    perNote.set(item.note_id, count + 1);
    out.push(item);
    if (out.length >= topK) break;
  }

  // If still short, fill remaining without per-note cap
  if (out.length < topK) {
    const keys = new Set(out.map((i) => `${i.note_id}::${i.chunk_index}`));
    for (const item of sorted) {
      const key = `${item.note_id}::${item.chunk_index}`;
      if (keys.has(key)) continue;
      out.push(item);
      keys.add(key);
      if (out.length >= topK) break;
    }
  }

  return out;
}

export async function hybridSearch(env: Env, query: string, topK = 5): Promise<SearchResult[]> {
  const q = normalizeQuery(query);
  if (!q) return [];

  // Pull a wider candidate pool, then diversify
  const fetchCount = Math.max(topK * 3, 12);

  const [keywordResults, semanticResults] = await Promise.all([
    keywordSearch(env.DB, q, fetchCount),
    semanticSearchSafe(env, q, fetchCount),
  ]);

  if (semanticResults.length === 0) {
    return diversifyByNote(keywordResults, topK);
  }
  if (keywordResults.length === 0) {
    return diversifyByNote(semanticResults, topK);
  }

  return reciprocalRankFusion([semanticResults, keywordResults], topK);
}

async function semanticSearchSafe(env: Env, query: string, topK: number): Promise<SearchResult[]> {
  try {
    const { semanticSearch } = await import("./rag");
    return await semanticSearch(env, query, topK);
  } catch (err) {
    console.warn("Semantic search unavailable:", err);
    return [];
  }
}
