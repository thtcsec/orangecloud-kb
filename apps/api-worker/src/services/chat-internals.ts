import type { SearchResult } from "@kb/shared";
import type { Env } from "../env";
import { hybridSearch, normalizeQuery } from "./hybrid-search";

export const SYSTEM_PROMPT = `You are a helpful internal knowledge base assistant for OrangeCloud Personal Knowledge Base.

Answer using ONLY the provided source excerpts from company notes.

Rules:
- Prefer specific facts from the sources; do not invent details.
- If sources are insufficient, say what is missing and answer partially when possible.
- Cite sources by title like [Source N — Title].
- When multiple sources conflict, mention the conflict briefly.
- Prefer concise, structured markdown (short paragraphs, bullets when helpful).
- Match the user's language (Vietnamese or English).`;

export function buildContext(sources: SearchResult[], question: string): string {
  if (sources.length === 0) {
    return `No relevant context found in the knowledge base.\n\nQuestion: ${question}`;
  }

  const context = sources
    .map((s, i) => {
      const meta = [
        s.folder ? `folder: ${s.folder}` : null,
        s.tags ? `tags: ${s.tags}` : null,
        `score: ${s.score.toFixed(3)}`,
      ]
        .filter(Boolean)
        .join(" · ");

      return `[Source ${i + 1}] ${s.title}${meta ? ` (${meta})` : ""}\n${s.text}`;
    })
    .join("\n\n---\n\n");

  return `Use the following knowledge-base excerpts to answer.\n\n${context}\n\nQuestion: ${question}`;
}

export async function retrieveSources(env: Env, question: string, topK: number): Promise<SearchResult[]> {
  const q = normalizeQuery(question);
  if (!q) return [];

  // Slightly higher default recall for chat, then hybridSearch diversifies
  const k = Math.min(Math.max(topK, 5), 10);
  return hybridSearch(env, q, k);
}
