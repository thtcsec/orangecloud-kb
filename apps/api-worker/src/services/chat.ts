import type { ChatResponse } from "@kb/shared";
import type { Env } from "../env";
import { buildContext, retrieveSources, SYSTEM_PROMPT } from "./chat-internals";
import { getOpenAIBaseUrl } from "../lib/openai";

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

export async function chatWithRag(
  env: Env,
  question: string,
  topK = 5,
): Promise<ChatResponse> {
  const sources = await retrieveSources(env, question, topK);
  const userMessage = buildContext(sources, question);

  const baseUrl = getOpenAIBaseUrl(env);
  const response = await fetch(`${baseUrl}/chat/completions`, {
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
