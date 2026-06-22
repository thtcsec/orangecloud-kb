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

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: (origin) => origin ?? "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-API-Key"],
    credentials: true,
  }),
);

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
