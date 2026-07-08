export interface Env {
  DB: D1Database;
  ATTACHMENTS: R2Bucket;
  VECTORIZE: VectorizeIndex;
  AI: Ai;
  ADMIN_PASSWORD: string;
  OPENAI_API_KEY: string;
  API_KEY: string;
  EMBEDDING_MODEL: string;
  CHUNK_SIZE: string;
  CHUNK_OVERLAP: string;
  GPT_MODEL: string;
  ALLOWED_ORIGINS?: string;
  AI_GATEWAY_SLUG?: string;
}
