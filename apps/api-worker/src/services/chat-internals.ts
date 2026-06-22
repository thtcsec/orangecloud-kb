import type { SearchResult } from "@kb/shared";
import type { Env } from "../env";
import { hybridSearch } from "./hybrid-search";

export const SYSTEM_PROMPT = `You are a helpful internal knowledge base assistant. Answer questions based ONLY on the provided context from company notes and documentation.

Rules:
- If the context does not contain enough information, say so clearly.
- Cite note titles when referencing specific information.
- Be concise and accurate.
- Use markdown formatting when helpful.`;

export function buildContext(sources: SearchResult[], question: string): string {
  const context = sources
    .map(
      (s, i) =>
        `[Source ${i + 1}] ${s.title} (folder: ${s.folder ?? "none"}, score: ${s.score.toFixed(3)})\n${s.text}`,
    )
    .join("\n\n");

  return context
    ? `Context:\n${context}\n\nQuestion: ${question}`
    : `No relevant context found in the knowledge base.\n\nQuestion: ${question}`;
}

export async function retrieveSources(env: Env, question: string, topK: number): Promise<SearchResult[]> {
  return hybridSearch(env, question, topK);
}
