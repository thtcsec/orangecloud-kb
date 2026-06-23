import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./env";
import { authRoutes } from "./routes/auth";
import { notesRoutes } from "./routes/notes";
import { knowledgeRoutes } from "./routes/knowledge";
import { chatRoutes } from "./routes/chat";
import { attachmentsRoutes } from "./routes/attachments";
import { openapiRoutes } from "./routes/openapi";
import { errorResponse } from "./lib/utils";
import { rateLimiter } from "./lib/rate-limit";

const app = new Hono<{ Bindings: Env }>();

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  "*",
  cors({
    origin: (origin, c) => {
      if (!origin) return "*";
      const env = (c as unknown as { env: Env }).env;
      const extra = env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) ?? [];
      const all = [...ALLOWED_ORIGINS, ...extra];
      return all.includes(origin) ? origin : "";
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-API-Key"],
    credentials: true,
  }),
);

// Security headers
app.use("*", async (c, next) => {
  await next();
  c.res.headers.set("X-Content-Type-Options", "nosniff");
  c.res.headers.set("X-Frame-Options", "DENY");
  c.res.headers.set("X-XSS-Protection", "1; mode=block");
  c.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  c.res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
});

// Global rate limit for write operations (30 req/min per IP)
app.use("/api/*", async (c, next) => {
  if (c.req.method === "GET" || c.req.method === "OPTIONS") {
    return next();
  }
  return rateLimiter(30, 60_000)(c, next);
});

app.get("/health", (c) => c.json({ status: "ok", service: "knowledge-base-api" }));

app.route("/api/auth", authRoutes);
app.route("/api/notes", notesRoutes);
app.route("/api/knowledge", knowledgeRoutes);
app.route("/api/chat", chatRoutes);
app.route("/api/attachments", attachmentsRoutes);
app.route("/api/openapi.json", openapiRoutes);

app.onError((err, c) => {
  console.error(err);
  return errorResponse(err.message || "Internal server error", 500);
});

app.notFound((c) => errorResponse("Not found", 404));

export default app;
