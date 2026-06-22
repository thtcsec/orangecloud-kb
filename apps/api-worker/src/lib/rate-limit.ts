import type { Context, Next } from "hono";
import type { Env } from "../env";
import { errorResponse } from "./utils";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute per IP

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

export function rateLimiter(maxRequests = MAX_REQUESTS, windowMs = WINDOW_MS) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const ip =
      c.req.header("CF-Connecting-IP") ??
      c.req.header("X-Forwarded-For")?.split(",")[0]?.trim() ??
      "unknown";

    const key = `chat:${ip}`;
    const now = Date.now();

    // Periodic cleanup (every 100 requests)
    if (store.size > 100) cleanup();

    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      const response = errorResponse("Too many requests. Please try again later.", 429);
      response.headers.set("Retry-After", String(retryAfter));
      return response;
    }

    entry.count++;
    await next();
  };
}
