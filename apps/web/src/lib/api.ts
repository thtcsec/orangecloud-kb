import type {
  ChatResponse,
  Comment,
  CommentInput,
  Note,
  NoteAudit,
  NoteInput,
  SearchResult,
  ChatMessage,
} from "@kb/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ error: response.statusText }))) as {
      error?: string;
    };
    throw new Error(error.error ?? `Request failed: ${response.status}`);
  }

  if (response.headers.get("Content-Type")?.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return response.text() as Promise<T>;
}

export interface ChatStreamHandlers {
  onSources?: (sources: SearchResult[]) => void;
  onToken?: (token: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

export const api = {
  auth: {
    login: (password: string) =>
      request<{ ok: boolean }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      }),
    logout: () => request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
    me: () => request<{ authenticated: boolean; role?: string }>("/api/auth/me"),
  },
  notes: {
    list: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : "";
      return request<Note[]>(`/api/notes${query}`);
    },
    get: (id: string) => request<Note>(`/api/notes/${id}`),
    create: (data: NoteInput) =>
      request<Note>("/api/notes", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<NoteInput>) =>
      request<Note>(`/api/notes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<{ ok: boolean }>(`/api/notes/${id}`, { method: "DELETE" }),
    folders: () => request<string[]>("/api/notes/meta/folders"),
    tags: () => request<string[]>("/api/notes/meta/tags"),
    stats: () =>
      request<{ total: number; published: number; drafts: number; comments: number }>(
        "/api/notes/meta/stats",
      ),
    audit: (id: string) => request<NoteAudit[]>(`/api/notes/${id}/audit`),
  },
  comments: {
    list: (noteId: string) => request<Comment[]>(`/api/notes/${noteId}/comments`),
    create: (noteId: string, data: CommentInput) =>
      request<Comment>(`/api/notes/${noteId}/comments`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  chat: {
    ask: (question: string, history: ChatMessage[] = [], topK = 5) =>
      request<ChatResponse>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ question, history, topK }),
      }),
    askStream: async (question: string, history: ChatMessage[] = [], handlers: ChatStreamHandlers, topK = 5) => {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history, topK, stream: true }),
      });

      if (!response.ok || !response.body) {
        const error = (await response.json().catch(() => ({ error: response.statusText }))) as {
          error?: string;
        };
        throw new Error(error.error ?? `Chat stream failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;

          try {
            const event = JSON.parse(line.slice(5).trim()) as {
              type: string;
              sources?: SearchResult[];
              token?: string;
              error?: string;
            };

            if (event.type === "sources" && event.sources) {
              handlers.onSources?.(event.sources);
            } else if (event.type === "token" && event.token) {
              handlers.onToken?.(event.token);
            } else if (event.type === "done") {
              handlers.onDone?.();
            } else if (event.type === "error") {
              handlers.onError?.(event.error ?? "Stream error");
            }
          } catch {
            // skip malformed events
          }
        }
      }
    },
  },
  attachments: {
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/attachments`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => ({ error: response.statusText }))) as {
          error?: string;
        };
        throw new Error(error.error ?? "Upload failed");
      }

      const data = (await response.json()) as { key: string; url: string; contentType: string; size: number };
      return {
        ...data,
        absoluteUrl: `${API_URL}${data.url}`,
      };
    },
  },
};

export { API_URL };
