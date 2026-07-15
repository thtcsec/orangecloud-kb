export type NoteStatus = "draft" | "published";

export interface Note {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string | null;
  folder: string | null;
  status: NoteStatus;
  created_at: string;
  updated_at: string;
}

export interface NoteInput {
  title: string;
  content: string;
  author: string;
  tags?: string;
  folder?: string;
  status?: NoteStatus;
}

export interface Comment {
  id: number;
  note_id: string;
  author: string;
  content: string;
  created_at: string;
}

export interface CommentInput {
  author: string;
  content: string;
}

export interface EmbeddingsSync {
  note_id: string;
  last_synced_at: string | null;
  chunk_count: number | null;
}

export interface NoteListQuery {
  folder?: string;
  tag?: string;
  status?: NoteStatus;
  q?: string;
}

export type NoteAuditAction = "created" | "updated" | "published" | "unpublished";

export interface NoteAudit {
  id: string;
  note_id: string;
  action: NoteAuditAction;
  author: string | null;
  status: NoteStatus | null;
  summary: string | null;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  question: string;
  history?: ChatMessage[];
  topK?: number;
  stream?: boolean;
}

export interface ChatResponse {
  answer: string;
  sources: SearchResult[];
}

export interface SearchResult {
  note_id: string;
  title: string;
  folder: string | null;
  tags: string | null;
  chunk_index: number;
  text: string;
  score: number;
}

export interface KnowledgeSearchResponse {
  results: SearchResult[];
  mode?: "hybrid" | "semantic" | "keyword";
}

export interface AttachmentUploadResponse {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

export interface ApiError {
  error: string;
  details?: string;
}
