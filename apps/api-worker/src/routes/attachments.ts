import { Hono } from "hono";
import type { Env } from "../env";
import { errorResponse, jsonResponse } from "../lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "text/markdown",
]);

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export const attachmentsRoutes = new Hono<{ Bindings: Env }>();

attachmentsRoutes.post("/", async (c) => {
  const formData = await c.req.formData();
  const fileEntry = formData.get("file");

  if (!fileEntry || typeof fileEntry === "string") {
    return errorResponse("file is required", 400);
  }

  const file = fileEntry as File;

  if (file.size > MAX_FILE_SIZE) {
    return errorResponse("File too large (max 10MB)", 400);
  }

  const contentType = file.type || "application/octet-stream";
  if (!ALLOWED_TYPES.has(contentType)) {
    return errorResponse(`File type not allowed: ${contentType}`, 400);
  }

  const key = `upload-${Date.now()}-${sanitizeFilename(file.name)}`;

  await c.env.ATTACHMENTS.put(key, file.stream(), {
    httpMetadata: { contentType },
    customMetadata: { originalName: file.name },
  });

  const url = `/api/attachments/${encodeURIComponent(key)}`;
  return jsonResponse({ key, url, contentType, size: file.size }, 201);
});

attachmentsRoutes.get("/:key", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));

  if (!key || key.includes("..") || key.includes("/")) {
    return errorResponse("Invalid key", 400);
  }

  const object = await c.env.ATTACHMENTS.get(key);
  if (!object) {
    return errorResponse("File not found", 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
});
