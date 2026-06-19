import { Hono } from "hono";
import type { NoteInput } from "@kb/shared";
import type { Env } from "../env";
import { requireAuth } from "./auth";
import { errorResponse, jsonResponse } from "../lib/utils";
import * as notesService from "../services/notes";
import * as commentsService from "../services/comments";
import { deleteNoteVectors, syncNoteEmbeddings } from "../services/rag";

export const notesRoutes = new Hono<{ Bindings: Env }>();

notesRoutes.get("/", async (c) => {
  const notes = await notesService.listNotes(c.env.DB, {
    folder: c.req.query("folder"),
    tag: c.req.query("tag"),
    status: c.req.query("status") as "draft" | "published" | undefined,
    q: c.req.query("q"),
  });
  return jsonResponse(notes);
});

notesRoutes.get("/meta/folders", async (c) => {
  const folders = await notesService.getFolders(c.env.DB);
  return jsonResponse(folders);
});

notesRoutes.get("/meta/tags", async (c) => {
  const tags = await notesService.getTags(c.env.DB);
  return jsonResponse(tags);
});

notesRoutes.get("/meta/stats", async (c) => {
  const stats = await notesService.getStats(c.env.DB);
  return jsonResponse(stats);
});

notesRoutes.get("/:id/comments", async (c) => {
  const note = await notesService.getNoteById(c.env.DB, c.req.param("id"));
  if (!note) return errorResponse("Note not found", 404);
  const comments = await commentsService.listComments(c.env.DB, c.req.param("id"));
  return jsonResponse(comments);
});

notesRoutes.post("/:id/comments", async (c) => {
  const note = await notesService.getNoteById(c.env.DB, c.req.param("id"));
  if (!note) return errorResponse("Note not found", 404);

  const body = await c.req.json<{ author?: string; content?: string }>();
  if (!body.author?.trim() || !body.content?.trim()) {
    return errorResponse("author and content are required", 400);
  }

  const comment = await commentsService.createComment(c.env.DB, c.req.param("id"), {
    author: body.author,
    content: body.content,
  });
  return jsonResponse(comment, 201);
});

notesRoutes.get("/:id", async (c) => {
  const note = await notesService.getNoteById(c.env.DB, c.req.param("id"));
  if (!note) return errorResponse("Note not found", 404);
  return jsonResponse(note);
});

notesRoutes.post("/", async (c) => {
  const authError = await requireAuth(c);
  if (authError) return authError;

  const body = await c.req.json<NoteInput>();
  if (!body.title?.trim() || !body.content || !body.author?.trim()) {
    return errorResponse("title, content, and author are required", 400);
  }

  const note = await notesService.createNote(c.env.DB, body);

  if (note.status === "published") {
    try {
      await syncNoteEmbeddings(c.env, note);
    } catch (err) {
      console.error("Embedding sync failed on create:", err);
    }
  }

  return jsonResponse(note, 201);
});

notesRoutes.put("/:id", async (c) => {
  const authError = await requireAuth(c);
  if (authError) return authError;

  const body = await c.req.json<Partial<NoteInput>>();
  const note = await notesService.updateNote(c.env.DB, c.req.param("id"), body);
  if (!note) return errorResponse("Note not found", 404);

  if (note.status === "published") {
    try {
      await syncNoteEmbeddings(c.env, note);
    } catch (err) {
      console.error("Embedding sync failed on update:", err);
    }
  } else {
    try {
      await deleteNoteVectors(c.env, note.id);
    } catch (err) {
      console.error("Vector delete failed:", err);
    }
  }

  return jsonResponse(note);
});

notesRoutes.delete("/:id", async (c) => {
  const authError = await requireAuth(c);
  if (authError) return authError;

  const id = c.req.param("id");
  try {
    await deleteNoteVectors(c.env, id);
  } catch (err) {
    console.error("Vector delete failed:", err);
  }

  const deleted = await notesService.deleteNote(c.env.DB, id);
  if (!deleted) return errorResponse("Note not found", 404);
  return jsonResponse({ ok: true });
});
