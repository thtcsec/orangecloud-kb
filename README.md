# Knowledge Base

Wiki nội bộ dạng markdown, hỗ trợ semantic search và RAG, chạy trên hạ tầng edge của Cloudflare.

## Người tham gia

- **Trịnh Hoàng Tú** — Cloudflare Cloud Solutions Researcher Intern
- **Lê Sỹ Cường** — Territory Account Executive

## Tech Stack

| Tầng | Công nghệ |
|------|-----------|
| API | Hono trên Cloudflare Workers |
| Frontend | Next.js 15 trên Cloudflare Pages |
| Database | Cloudflare D1 (SQLite + FTS5) |
| Storage | Cloudflare R2 |
| Vector DB | Cloudflare Vectorize |
| Embeddings | Workers AI (`@cf/baai/bge-small-en-v1.5`) |
| Chat | OpenAI GPT |

## Cấu trúc monorepo

```
apps/
  api-worker/   # Hono API + RAG pipeline
  web/          # Next.js frontend
packages/
  shared/       # Shared TypeScript types
```

## Bắt đầu nhanh

### 1. Cài dependencies

```bash
pnpm install
```

### 2. Cấu hình secrets

```bash
cp apps/api-worker/.dev.vars.example apps/api-worker/.dev.vars
cp apps/web/.env.example apps/web/.env.local
```

Chỉnh sửa `apps/api-worker/.dev.vars`:

- `ADMIN_PASSWORD` — mật khẩu đăng nhập admin (dùng cho CRUD notes)
- `OPENAI_API_KEY` — dùng cho `/api/chat` (RAG)
- `API_KEY` — bearer token cho Custom GPT / Knowledge API

### 3. Tạo tài nguyên Cloudflare

```bash
# D1 database
pnpm --filter @kb/api-worker db:create
# Copy database_id vào apps/api-worker/wrangler.jsonc

# Vectorize index (384 dimensions cho bge-small-en-v1.5)
pnpm --filter @kb/api-worker vectorize:create

# R2 bucket (qua dashboard hoặc wrangler)
wrangler r2 bucket create knowledge-base-attachments
```

### 4. Chạy migrations

```bash
pnpm db:migrate:local
```

### 5. Khởi động dev servers

```bash
pnpm dev
```

- API: http://localhost:8787
- Web: http://localhost:3000

> **Lưu ý:** Vectorize và Workers AI cần Cloudflare account. Thêm `account_id` vào `apps/api-worker/wrangler.jsonc`, hoặc dùng `pnpm dev:local` để test CRUD/FTS (không có embedding).

## API Endpoints

### Notes (đọc công khai, ghi cần auth)

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/notes` | Danh sách notes (lọc: folder, tag, status, q) |
| POST | `/api/notes` | Tạo note (tự động embed nếu published) |
| GET | `/api/notes/:id` | Lấy một note |
| PUT | `/api/notes/:id` | Cập nhật note (re-embed nếu published) |
| DELETE | `/api/notes/:id` | Xoá note + vectors |
| GET | `/api/notes/:id/comments` | Danh sách comments |
| POST | `/api/notes/:id/comments` | Thêm comment |

### RAG / Knowledge

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | `/api/chat` | — | RAG chat (vector search → GPT) |
| GET | `/api/knowledge/search?q=` | API_KEY | Semantic search |
| GET | `/api/knowledge/context` | API_KEY | Dump toàn bộ nội dung dạng text |
| GET | `/api/knowledge/notes` | API_KEY | Danh sách notes |
| GET | `/api/knowledge/notes/:id` | API_KEY | Lấy một note |

OpenAPI spec: `GET /api/openapi.json`

## RAG Pipeline

```
Note (published) → Chunk (~500 tokens, overlap 50)
                 → Embed (bge-small-en-v1.5)
                 → Upsert Vectorize (id = noteId::chunkIndex)
```

Retrieval: câu hỏi → embed → Vectorize top-K → GPT với context.

## Deploy

### API Worker

```bash
cd apps/api-worker
wrangler secret put ADMIN_PASSWORD
wrangler secret put OPENAI_API_KEY
wrangler secret put API_KEY
pnpm db:migrate:remote
wrangler deploy
```

### Frontend (Cloudflare Pages)

```bash
cd apps/web
# Đặt NEXT_PUBLIC_API_URL trỏ tới worker URL
pnpm build
pnpm pages:build
pnpm pages:deploy
```

## Tích hợp Custom GPT

1. Import OpenAPI spec từ `{API_URL}/api/openapi.json`
2. Cấu hình authentication: Bearer token = `API_KEY` của bạn
3. Các action khả dụng: search, get context, list/get notes
