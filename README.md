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

> **Lưu ý:** `pnpm dev` chạy API ở chế độ **local** (CRUD + FTS hoạt động, embedding/Vectorize chưa có). Để test đầy đủ RAG với Workers AI + Vectorize, dùng `pnpm dev:remote` (cần `account_id` đúng trong `wrangler.jsonc`).

## Xử lý lỗi dev

### `Internal Server Error` trên localhost:3000

Thường do **process Next.js cũ** vẫn chiếm port 3000 (trả 500) trong khi `pnpm dev` không start được web mới.

```bash
# Tự động (đã có sẵn trong predev)
pnpm dev

# Hoặc kill thủ công
npx kill-port 3000 8787
pnpm dev
```

Đảm bảo `apps/web/.env.local` trỏ đúng API:
```
NEXT_PUBLIC_API_URL=http://localhost:8787
```

### `Failed to start the remote proxy session` / `unable to select account`

Wrangler thấy nhiều Cloudflare account và không chọn được. Sửa một trong hai cách:

1. **Chạy local (khuyên dùng khi mới bắt đầu):**
   ```bash
   pnpm dev
   ```

2. **Chạy remote đầy đủ RAG:** mở `apps/api-worker/wrangler.jsonc`, đặt `account_id` đúng account của bạn:
   - `Cloudspace`: `4c15704ef706b9c8954cd6f9feb678d8`
   - `Tht.csec2005@gmail.com`: `d26517432bff17b8889b98cc366c70f1`

   Sau đó:
   ```bash
   pnpm dev:remote
   ```

Hoặc set biến môi trường trước khi chạy:
```bash
$env:CLOUDFLARE_ACCOUNT_ID="4c15704ef706b9c8954cd6f9feb678d8"
pnpm dev:remote
```

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
| POST | `/api/chat` | — | RAG chat — `{ stream: true }` cho SSE streaming |
| GET | `/api/knowledge/search?q=` | API_KEY | Hybrid search (mặc định), `?mode=semantic\|keyword` |
| GET | `/api/knowledge/context` | API_KEY | Dump toàn bộ nội dung dạng text |
| GET | `/api/knowledge/notes` | API_KEY | Danh sách notes |
| GET | `/api/knowledge/notes/:id` | API_KEY | Lấy một note |

### Attachments (R2)

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | `/api/attachments` | Admin | Upload file (multipart, max 10MB) |
| GET | `/api/attachments/:key` | — | Tải file từ R2 |

OpenAPI spec: `GET /api/openapi.json`

## Tính năng nâng cao

- **Hybrid search:** FTS5 + Vectorize, gộp bằng Reciprocal Rank Fusion (RRF)
- **Streaming chat:** SSE token-by-token tại `/chat`
- **Markdown editor:** `@uiw/react-md-editor` + upload ảnh/PDF vào R2
- **Light/Dark/System theme** ở sidebar

## RAG Pipeline

```
Note (published) → Chunk (~500 tokens, overlap 50)
                 → Embed (bge-small-en-v1.5)
                 → Upsert Vectorize (id = noteId::chunkIndex)
```

Retrieval: câu hỏi → hybrid search (FTS + vector, RRF) → top-K → GPT streaming.

## Deploy

Chi tiết: [docs/DEPLOY.md](docs/DEPLOY.md)

**Lưu ý:** Auto-deploy qua GitHub Actions cần cấp quyền repo + thêm secrets `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `NEXT_PUBLIC_API_URL`. CI vẫn chạy typecheck/build ngay cả khi chưa có secrets.

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
