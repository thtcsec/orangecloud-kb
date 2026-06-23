<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="logo-light.png">
    <img alt="Orange Cloud KB" src="logo-light.png" width="360">
  </picture>
</p>

<h1 align="center">Orange Cloud KB — AI-Powered Internal Knowledge Base</h1>

Nền tảng wiki nội bộ dạng **Markdown**, hỗ trợ **semantic search** (tìm kiếm ngữ nghĩa), **hybrid retrieval** (FTS5 + Vector), và **RAG chat** (hỏi đáp AI dựa trên tri thức nội bộ) — tất cả chạy trên hạ tầng **edge** của Cloudflare, tối ưu chi phí và tốc độ tải toàn cầu.

Dự án được triển khai hoàn toàn trên nền tảng **Serverless Cloudflare-native** nhằm giảm tải hạ tầng quản trị, tối ưu chi phí vận hành, và đảm bảo tốc độ phản hồi cực nhanh tại biên mạng.

---

## 👨‍💻 Nhóm Thực Hiện (Authorship)

Dự án được xây dựng và phát triển dưới dạng giải pháp nghiên cứu bởi:

- **Trịnh Hoàng Tú** — Cloudflare Cloud Solutions Researcher Intern
- **Lê Sỹ Cường** — Territory Account Executive

---

## ⚙️ Thiết Kế Kiến Trúc (Cloudflare Serverless Integration)

Hệ thống được thiết kế để minh họa cách kết hợp các dịch vụ serverless của Cloudflare thành một nền tảng quản lý tri thức khép kín:

1. **Cloudflare Workers + Hono**: API router hiệu năng cao, xử lý CRUD notes, authentication, file upload, và RAG pipeline. Worker tự động chunk nội dung → embed → upsert vector mỗi khi note được publish.
2. **D1 + FTS5 (Full-Text Search)**: Lưu trữ dữ liệu quan hệ (notes, comments, embeddings sync tracking) với **FTS5 virtual table** được sync tự động qua triggers, phục vụ keyword search tức thì.
3. **Cloudflare R2**: Lưu trữ file đính kèm (ảnh, PDF, tài liệu) — tích hợp trực tiếp vào Markdown editor, upload multipart tối đa 10 MB.
4. **Cloudflare Vectorize + Workers AI**: Tự động sinh vector embeddings từ nội dung note qua mô hình `@cf/baai/bge-small-en-v1.5`, cập nhật vào Vectorize — phục vụ tìm kiếm ngữ nghĩa và RAG retrieval.
5. **Hybrid Search (RRF)**: Kết hợp kết quả từ FTS5 (keyword) và Vectorize (semantic) bằng thuật toán **Reciprocal Rank Fusion**, đảm bảo recall tốt cho cả truy vấn chính xác lẫn truy vấn tự nhiên.
6. **RAG Chat (OpenAI GPT + Streaming)**: Câu hỏi người dùng → hybrid search top-K chunks → GPT sinh câu trả lời **streaming** (SSE token-by-token), kèm danh sách source references.
7. **Next.js 15 trên Cloudflare Pages**: Frontend SSR tại Edge thông qua `@cloudflare/next-on-pages`, hỗ trợ dark/light/system theme.

---

## 🚀 Tính Năng Chính

- **Markdown Editor** đầy đủ: `@uiw/react-md-editor` + upload ảnh/PDF vào R2, Mermaid diagrams, syntax highlighting.
- **Hybrid Search**: FTS5 + Vectorize, gộp bằng Reciprocal Rank Fusion (RRF) — chế độ `hybrid`, `semantic`, `keyword`.
- **RAG Chat** (`/chat`): hỏi đáp AI streaming dựa trên toàn bộ knowledge base.
- **Folder & Tag organization**: phân loại notes theo folder và tags, filter đa chiều.
- **Comments**: thảo luận trực tiếp trên mỗi note.
- **Attachments**: upload file đính kèm vào R2, chèn link trực tiếp trong markdown.
- **Dark/Light/System theme**: toggle ở sidebar, không flash khi reload.
- **Knowledge API**: endpoint chuẩn cho tích hợp Custom GPT / external tools (bearer token auth).
- **OpenAPI spec**: tự động serve tại `/api/openapi.json` — import vào Custom GPT hoặc Postman.
- **CI/CD**: GitHub Actions typecheck + build + auto-deploy khi có secrets.

---

## 📁 Cấu Trúc Monorepo (Directory Layout)

```
orangecloud-kb/
├── apps/
│   ├── api-worker/             # Hono API trên Cloudflare Workers (CRUD, RAG, Search, Chat)
│   └── web/                    # Next.js 15 Frontend trên Cloudflare Pages
├── packages/
│   └── shared/                 # Shared TypeScript types (Note, Comment, Search, Chat)
├── docs/                       # Tài liệu deploy & hướng dẫn
└── .github/workflows/          # CI/CD pipeline
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Phát Triển (Local Setup)

### Yêu Cầu Hệ Thống

- **Node.js**: >= 20.x
- **Package Manager**: `pnpm` (version quản lý qua `packageManager` field)
- **Wrangler CLI**: đi kèm devDependencies, không cần cài global

### 1. Cài đặt Dependencies

```bash
pnpm install
```

### 2. Cấu hình Secrets (local dev)

```bash
cp apps/api-worker/.dev.vars.example apps/api-worker/.dev.vars
```

Chỉnh `apps/api-worker/.dev.vars`:

```
ADMIN_PASSWORD=your-admin-password
OPENAI_API_KEY=sk-...
API_KEY=your-bearer-token-for-knowledge-api
```

Frontend:

```bash
cp apps/web/.env.example apps/web/.env.local
```

```
NEXT_PUBLIC_API_URL=http://localhost:8787
```

### 3. Tạo Database & Chạy Migrations (D1 local)

```bash
pnpm db:migrate:local
```

### 4. Khởi động Dev Servers

```bash
pnpm dev
```

*(Chạy song song: API Worker ở `localhost:8787`, Next.js ở `localhost:3000`)*

> **Lưu ý:** `pnpm dev` chạy API ở chế độ **local** — CRUD + FTS hoạt động đầy đủ, embedding/Vectorize cần `pnpm dev:remote` (yêu cầu `account_id` đúng trong `wrangler.jsonc`).

---

## 🌐 Triển Khai Lên Cloudflare (Production Deployment)

### 1. Tạo Tài Nguyên

```bash
# D1 Database
pnpm --filter @kb/api-worker db:create

# Vectorize Index (384 dimensions cho bge-small-en-v1.5)
pnpm --filter @kb/api-worker vectorize:create

# R2 Bucket
wrangler r2 bucket create knowledge-base-attachments
```

*Copy `database_id` vào `apps/api-worker/wrangler.jsonc`.*

### 2. Bind Secrets (production)

```bash
cd apps/api-worker
wrangler secret put ADMIN_PASSWORD
wrangler secret put OPENAI_API_KEY
wrangler secret put API_KEY
```

### 3. Migrations Remote

```bash
pnpm db:migrate:remote
```

### 4. Deploy

```bash
# API Worker
pnpm --filter @kb/api-worker deploy

# Frontend (Cloudflare Pages)
cd apps/web
NEXT_PUBLIC_API_URL=https://your-worker.workers.dev pnpm build
npx wrangler pages deploy .next --project-name=knowledge-base-web
```

### 5. GitHub Actions (tự động)

Thêm Secrets vào repo Settings → Secrets:

| Secret | Mô tả |
|--------|-------|
| `CF_API_TOKEN` | Cloudflare API token (Workers + Pages + D1) |
| `CF_ACCOUNT_ID` | Account ID triển khai |
| `NEXT_PUBLIC_API_URL` | URL worker sau deploy |

Push lên `main` → CI chạy typecheck + build → deploy tự động khi có secrets.

---

## 🔐 Quản Lý Secrets (Nội Bộ)

**Nguyên tắc:** mỗi loại secret chỉ lưu **một nơi** — không trùng lặp.

| Loại | Lưu ở đâu | Dùng cho |
|------|-----------|----------|
| `CLOUDFLARE_API_TOKEN` | **GitHub Secrets** | CI deploy (Actions) |
| `OPENAI_API_KEY` | **Cloudflare Secrets** (Worker) | Runtime RAG chat |
| `ADMIN_PASSWORD` | **Cloudflare Secrets** (Worker) | Admin auth |
| `API_KEY` | **Cloudflare Secrets** (Worker) | Knowledge API bearer token |
| Dev secrets | `apps/api-worker/.dev.vars` (gitignored) | `pnpm dev` local |

**Không làm:**
- Không commit `.dev.vars` hay `.env.local`
- Không lưu API key trong D1 hoặc frontend code

---

## 📖 API Endpoints

### Notes (đọc công khai, ghi cần auth)

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/notes` | Danh sách notes (filter: folder, tag, status, q) |
| POST | `/api/notes` | Tạo note (auto-embed nếu published) |
| GET | `/api/notes/:id` | Chi tiết note |
| PUT | `/api/notes/:id` | Cập nhật note (re-embed nếu published) |
| DELETE | `/api/notes/:id` | Xoá note + vectors |
| GET | `/api/notes/:id/comments` | Danh sách comments |
| POST | `/api/notes/:id/comments` | Thêm comment |

### RAG & Knowledge API

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | `/api/chat` | — | RAG chat (`stream: true` cho SSE) |
| GET | `/api/knowledge/search?q=` | API_KEY | Hybrid search (mode: hybrid/semantic/keyword) |
| GET | `/api/knowledge/context` | API_KEY | Dump toàn bộ KB dạng text |
| GET | `/api/knowledge/notes` | API_KEY | List notes |
| GET | `/api/knowledge/notes/:id` | API_KEY | Get note |

### Attachments (R2)

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | `/api/attachments` | Admin | Upload file (multipart, max 10 MB) |
| GET | `/api/attachments/:key` | — | Download file từ R2 |

OpenAPI spec: `GET /api/openapi.json`

---

## 🔄 RAG Pipeline

```
Note (published) → Chunk (~500 tokens, overlap 50)
                 → Embed (bge-small-en-v1.5 via Workers AI)
                 → Upsert Vectorize (id = noteId::chunkIndex)
```

**Retrieval:** câu hỏi → hybrid search (FTS5 + Vectorize, RRF merge) → top-K chunks → OpenAI GPT streaming response.

---

## 🧪 Kiểm Thử End-to-End (Local Testing Flow)

### Bước 1: Khởi động

```bash
pnpm dev
```

### Bước 2: Tạo note qua API hoặc UI

```bash
curl -X POST http://localhost:8787/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-password" \
  -d '{"title":"Test Note","content":"# Hello\nThis is a test note about Cloudflare Workers.","author":"admin","status":"published"}'
```

### Bước 3: Test search

```bash
# Full-text search
curl "http://localhost:8787/api/notes?q=cloudflare"

# Hybrid search (cần remote mode cho vector)
curl -H "X-API-Key: your-api-key" "http://localhost:8787/api/knowledge/search?q=cloudflare+workers"
```

### Bước 4: Test RAG chat

```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"What do we know about Cloudflare Workers?","stream":false}'
```

### Bước 5: Truy cập Frontend

- Trang chính: `http://localhost:3000`
- Chat: `http://localhost:3000/chat`
- Settings: `http://localhost:3000/settings`

---

## 🗂️ Tích Hợp Custom GPT

1. Import OpenAPI spec từ `{API_URL}/api/openapi.json`
2. Authentication: Bearer token = `API_KEY`
3. Actions khả dụng: search, get context, list/get notes

---

## 📝 Ghi Chú Kỹ Thuật

- **Chunk strategy**: ~500 tokens/chunk, overlap 50 tokens — đảm bảo context liền mạch.
- **FTS5 triggers**: auto-sync qua SQLite triggers, zero-config.
- **Vector cleanup**: xoá note sẽ tự động xoá vectors tương ứng trong Vectorize.
- **Streaming**: SSE chunked response cho chat, frontend render token-by-token.
- **Theme persistence**: `localStorage` + inject script trước hydration → không flash.
