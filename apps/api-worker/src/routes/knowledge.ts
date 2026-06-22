import { Hono } from "hono";
import type { Env } from "../env";
import { requireApiKey } from "./auth";
import { errorResponse, jsonResponse } from "../lib/utils";
import { buildKnowledgeContext } from "../services/rag";
import { hybridSearch } from "../services/hybrid-search";
import * as notesService from "../services/notes";

export const knowledgeRoutes = new Hono<{ Bindings: Env }>();

knowledgeRoutes.use("*", async (c, next) => {
  const authError = await requireApiKey(c);
  if (authError) return authError;
  await next();
});

knowledgeRoutes.get("/search", async (c) => {
  const q = c.req.query("q");
  if (!q?.trim()) return errorResponse("Query parameter q is required", 400);

  const mode = c.req.query("mode") ?? "hybrid";
  const topK = Number.parseInt(c.req.query("topK") ?? "5", 10);

  const results =
    mode === "semantic"
      ? await (async () => {
          const { semanticSearch } = await import("../services/rag");
          return semanticSearch(c.env, q, topK);
        })()
      : mode === "keyword"
        ? await (async () => {
            const { keywordSearch } = await import("../services/hybrid-search");
            return keywordSearch(c.env.DB, q, topK);
          })()
        : await hybridSearch(c.env, q, topK);

  return jsonResponse({ results, mode: mode === "semantic" || mode === "keyword" ? mode : "hybrid" });
});

knowledgeRoutes.get("/context", async (c) => {
  const context = await buildKnowledgeContext(c.env);
  return new Response(context, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
});

knowledgeRoutes.get("/notes", async (c) => {
  const notes = await notesService.listNotes(c.env.DB, {
    folder: c.req.query("folder"),
    tag: c.req.query("tag"),
    status: c.req.query("status") as "draft" | "published" | undefined,
  });
  return jsonResponse(notes);
});

knowledgeRoutes.get("/notes/:id", async (c) => {
  const note = await notesService.getNoteById(c.env.DB, c.req.param("id"));
  if (!note) return errorResponse("Note not found", 404);
  return jsonResponse(note);
});
