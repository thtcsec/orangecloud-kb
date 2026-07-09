import { Hono } from "hono";
import type { Env } from "../env";
import { errorResponse, jsonResponse } from "../lib/utils";
import { rateLimiter } from "../lib/rate-limit";
import { chatWithRag } from "../services/chat";
import { createChatStream } from "../services/chat-stream";
import type { ChatMessage } from "@kb/shared";

export const chatRoutes = new Hono<{ Bindings: Env }>();

// Rate limit: 10 requests/minute per IP (anti-spam)
chatRoutes.use("*", rateLimiter(10, 60_000));

chatRoutes.post("/", async (c) => {
  const body = await c.req.json<{ question?: string; history?: ChatMessage[]; topK?: number; stream?: boolean }>();
  if (!body.question?.trim()) {
    return errorResponse("question is required", 400);
  }

  // Limit question length to prevent abuse
  const question = body.question.trim().slice(0, 2000);

  if (!c.env.OPENAI_API_KEY) {
    return errorResponse("OpenAI API key not configured", 503);
  }

  const topK = Math.min(body.topK ?? 5, 10);
  const history = body.history ?? [];

  if (body.stream) {
    return new Response(createChatStream(c.env, question, history, topK), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  try {
    const result = await chatWithRag(c.env, question, history, topK);
    return jsonResponse(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat failed";
    return errorResponse(message, 502);
  }
});
