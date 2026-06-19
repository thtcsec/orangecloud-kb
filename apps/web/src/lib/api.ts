import type { ChatResponse, Comment, CommentInput, Note, NoteInput } from "@kb/shared";

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
    ask: (question: string, topK = 5) =>
      request<ChatResponse>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ question, topK }),
      }),
  },
};

export { API_URL };
