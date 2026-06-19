import { Hono } from "hono";

export const openapiRoutes = new Hono();

openapiRoutes.get("/", (c) => {
  const baseUrl = new URL(c.req.url).origin;

  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Knowledge Base API",
      description:
        "API for Custom GPT integration with the internal knowledge base. Use Bearer token with API_KEY for authentication.",
      version: "1.0.0",
    },
    servers: [{ url: baseUrl }],
    security: [{ ApiKeyAuth: [] }],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "http",
          scheme: "bearer",
          description: "Set API_KEY from worker secrets as Bearer token",
        },
      },
      schemas: {
        Note: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            content: { type: "string" },
            author: { type: "string" },
            tags: { type: "string", nullable: true },
            folder: { type: "string", nullable: true },
            status: { type: "string", enum: ["draft", "published"] },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        SearchResult: {
          type: "object",
          properties: {
            note_id: { type: "string" },
            title: { type: "string" },
            folder: { type: "string", nullable: true },
            tags: { type: "string", nullable: true },
            chunk_index: { type: "integer" },
            text: { type: "string" },
            score: { type: "number" },
          },
        },
      },
    },
    paths: {
      "/api/knowledge/search": {
        get: {
          operationId: "searchKnowledge",
          summary: "Semantic search across knowledge base",
          parameters: [
            { name: "q", in: "query", required: true, schema: { type: "string" } },
            { name: "topK", in: "query", schema: { type: "integer", default: 5 } },
          ],
          responses: {
            "200": {
              description: "Search results",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      results: {
                        type: "array",
                        items: { $ref: "#/components/schemas/SearchResult" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/knowledge/context": {
        get: {
          operationId: "getKnowledgeContext",
          summary: "Full text dump of all published notes",
          responses: {
            "200": {
              description: "Plain text context",
              content: { "text/plain": { schema: { type: "string" } } },
            },
          },
        },
      },
      "/api/knowledge/notes": {
        get: {
          operationId: "listNotes",
          summary: "List notes with optional filters",
          parameters: [
            { name: "folder", in: "query", schema: { type: "string" } },
            { name: "tag", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string", enum: ["draft", "published"] } },
          ],
          responses: {
            "200": {
              description: "List of notes",
              content: {
                "application/json": {
                  schema: { type: "array", items: { $ref: "#/components/schemas/Note" } },
                },
              },
            },
          },
        },
      },
      "/api/knowledge/notes/{id}": {
        get: {
          operationId: "getNote",
          summary: "Get a single note by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": {
              description: "Note details",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Note" },
                },
              },
            },
            "404": { description: "Note not found" },
          },
        },
      },
      "/api/chat": {
        post: {
          operationId: "chatWithKnowledge",
          summary: "RAG chat — ask a question about the knowledge base",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["question"],
                  properties: {
                    question: { type: "string" },
                    topK: { type: "integer", default: 5 },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Chat response with sources",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      answer: { type: "string" },
                      sources: {
                        type: "array",
                        items: { $ref: "#/components/schemas/SearchResult" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  return c.json(spec);
});
