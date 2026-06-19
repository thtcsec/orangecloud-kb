import { Hono } from "hono";
import type { Env } from "../env";
import {
  SESSION_COOKIE,
  createSessionToken,
  getSessionTokenFromRequest,
  verifySessionToken,
} from "../lib/auth";
import { errorResponse, jsonResponse } from "../lib/utils";

export const authRoutes = new Hono<{ Bindings: Env }>();

authRoutes.post("/login", async (c) => {
  const body = await c.req.json<{ password?: string }>();
  if (!body.password) {
    return errorResponse("Password is required", 400);
  }

  if (body.password !== c.env.ADMIN_PASSWORD) {
    return errorResponse("Invalid password", 401);
  }

  const token = await createSessionToken(c.env.ADMIN_PASSWORD);
  const response = jsonResponse({ ok: true });
  response.headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
  );
  return response;
});

authRoutes.post("/logout", () => {
  const response = jsonResponse({ ok: true });
  response.headers.set("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0`);
  return response;
});

authRoutes.get("/me", async (c) => {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token || !(await verifySessionToken(c.env.ADMIN_PASSWORD, token))) {
    return jsonResponse({ authenticated: false });
  }
  return jsonResponse({ authenticated: true, role: "admin" });
});

export async function requireAuth(c: {
  env: Env;
  req: { raw: Request };
}): Promise<Response | null> {
  const token = getSessionTokenFromRequest(c.req.raw);
  if (!token || !(await verifySessionToken(c.env.ADMIN_PASSWORD, token))) {
    return errorResponse("Unauthorized", 401);
  }
  return null;
}

export async function requireApiKey(c: {
  env: Env;
  req: { header: (name: string) => string | undefined };
}): Promise<Response | null> {
  const apiKey = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ?? c.req.header("X-API-Key");
  if (!apiKey || apiKey !== c.env.API_KEY) {
    return errorResponse("Invalid API key", 401);
  }
  return null;
}
