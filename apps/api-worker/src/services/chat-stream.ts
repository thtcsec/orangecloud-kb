import type { SearchResult } from "@kb/shared";
import type { Env } from "../env";
import { buildContext, retrieveSources, SYSTEM_PROMPT } from "./chat-internals";
import { getOpenAIBaseUrl } from "../lib/openai";

interface StreamEvent {
  type: "sources" | "token" | "done" | "error";
  sources?: SearchResult[];
  token?: string;
  error?: string;
}

export function createChatStream(
  env: Env,
  question: string,
  topK = 5,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  function emit(controller: ReadableStreamDefaultController<Uint8Array>, event: StreamEvent) {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
  }

  return new ReadableStream({
    async start(controller) {
      try {
        if (!env.OPENAI_API_KEY) {
          emit(controller, { type: "error", error: "OpenAI API key not configured" });
          controller.close();
          return;
        }

        const sources = await retrieveSources(env, question, topK);
        emit(controller, { type: "sources", sources });

        const userMessage = buildContext(sources, question);
        const baseUrl = getOpenAIBaseUrl(env);
        const response = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: env.GPT_MODEL,
            stream: true,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userMessage },
            ],
            temperature: 0.3,
            max_tokens: 1500,
          }),
        });

        if (!response.ok || !response.body) {
          const errorText = await response.text();
          emit(controller, { type: "error", error: `OpenAI API error: ${response.status} ${errorText}` });
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) {
                emit(controller, { type: "token", token });
              }
            } catch {
              // skip malformed chunks
            }
          }
        }

        emit(controller, { type: "done" });
        controller.close();
      } catch (err) {
        emit(controller, {
          type: "error",
          error: err instanceof Error ? err.message : "Chat stream failed",
        });
        controller.close();
      }
    },
  });
}
