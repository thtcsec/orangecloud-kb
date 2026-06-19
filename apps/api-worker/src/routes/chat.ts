import { Hono } from "hono";
import type { Env } from "../env";
import { errorResponse, jsonResponse } from "../lib/utils";
import { chatWithRag } from "../services/chat";

export const chatRoutes = new Hono<{ Bindings: Env }>();

chatRoutes.post("/", async (c) => {
  const body = await c.req.json<{ question?: string; topK?: number }>();
  if (!body.question?.trim()) {
    return errorResponse("question is required", 400);
  }

  if (!c.env.OPENAI_API_KEY) {
    return errorResponse("OpenAI API key not configured", 503);
  }

  try {
    const result = await chatWithRag(c.env, body.question.trim(), body.topK ?? 5);
    return jsonResponse(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat failed";
    return errorResponse(message, 502);
  }
});
