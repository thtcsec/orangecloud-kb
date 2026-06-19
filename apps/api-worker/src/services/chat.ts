import type { ChatResponse } from "@kb/shared";
import type { Env } from "../env";
import { semanticSearch } from "./rag";

interface OpenAIChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

const SYSTEM_PROMPT = `You are a helpful internal knowledge base assistant. Answer questions based ONLY on the provided context from company notes and documentation.

Rules:
- If the context does not contain enough information, say so clearly.
- Cite note titles when referencing specific information.
- Be concise and accurate.
- Use markdown formatting when helpful.`;

export async function chatWithRag(
  env: Env,
  question: string,
  topK = 5,
): Promise<ChatResponse> {
  const sources = await semanticSearch(env, question, topK);

  const context = sources
    .map(
      (s, i) =>
        `[Source ${i + 1}] ${s.title} (folder: ${s.folder ?? "none"}, score: ${s.score.toFixed(3)})\n${s.text}`,
    )
    .join("\n\n");

  const userMessage = context
    ? `Context:\n${context}\n\nQuestion: ${question}`
    : `No relevant context found in the knowledge base.\n\nQuestion: ${question}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.GPT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as OpenAIChatResponse;
  const answer = data.choices?.[0]?.message?.content;

  if (!answer) {
    throw new Error(data.error?.message ?? "Empty response from OpenAI");
  }

  return { answer, sources };
}
