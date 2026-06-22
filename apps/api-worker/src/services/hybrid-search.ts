import type { SearchResult } from "@kb/shared";
import type { Env } from "../env";
import { escapeFtsQuery } from "../lib/utils";

const RRF_K = 60;

interface FtsNoteRow {
  id: string;
  title: string;
  folder: string | null;
  tags: string | null;
  content: string;
  rank: number;
}

export async function keywordSearch(
  db: D1Database,
  query: string,
  limit = 10,
): Promise<SearchResult[]> {
  const ftsQuery = escapeFtsQuery(query);
  if (!ftsQuery) return [];

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

  return (result.results ?? []).map((row, index) => ({
    note_id: row.id,
    title: row.title,
    folder: row.folder,
    tags: row.tags,
    chunk_index: 0,
    text: extractSnippet(row.content, query, 400),
    score: normalizeRankScore(row.rank, index),
  }));
}

function extractSnippet(content: string, query: string, maxLen: number): string {
  const lower = content.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let bestIndex = 0;

  for (const term of terms) {
    const idx = lower.indexOf(term);
    if (idx !== -1) {
      bestIndex = Math.max(0, idx - 80);
      break;
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

  return [...merged.values()].sort((a, b) => b.score - a.score).slice(0, topK);
}

export async function hybridSearch(env: Env, query: string, topK = 5): Promise<SearchResult[]> {
  const fetchCount = Math.max(topK * 2, 10);

  const [keywordResults, semanticResults] = await Promise.all([
    keywordSearch(env.DB, query, fetchCount),
    semanticSearchSafe(env, query, fetchCount),
  ]);

  if (semanticResults.length === 0) {
    return keywordResults.slice(0, topK);
  }
  if (keywordResults.length === 0) {
    return semanticResults.slice(0, topK);
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
