# Deploy thủ công (khi chưa có GitHub Secrets)

## 1. Tạo resources trên Cloudflare

```bash
pnpm --filter @kb/api-worker db:create
pnpm --filter @kb/api-worker vectorize:create
wrangler r2 bucket create knowledge-base-attachments
```

Copy `database_id` vào `apps/api-worker/wrangler.jsonc`.

## 2. Secrets Worker

```bash
cd apps/api-worker
wrangler secret put ADMIN_PASSWORD
wrangler secret put OPENAI_API_KEY
wrangler secret put API_KEY
pnpm db:migrate:remote
wrangler deploy
```

## 3. Deploy Frontend

```bash
cd apps/web
# .env.production hoặc export:
# NEXT_PUBLIC_API_URL=https://knowledge-base-api.<subdomain>.workers.dev
pnpm pages:build
npx wrangler pages project create knowledge-base-web
npx wrangler pages deploy .vercel/output/static --project-name=knowledge-base-web
```

## 4. GitHub Actions (tự động)

Thêm Secrets vào repo Settings → Secrets:

| Secret | Mô tả |
|--------|-------|
| `CF_API_TOKEN` | Cloudflare API token (Workers + Pages + D1) |
| `CF_ACCOUNT_ID` | `4c15704ef706b9c8954cd6f9feb678d8` (Cloudspace) |
| `NEXT_PUBLIC_API_URL` | URL worker sau deploy |

Push lên `main` → CI chạy typecheck + build. Deploy job chạy khi có secrets.

## 5. Quyền GitHub repo

Nếu push bị 403, cần account `sycu8` cấp quyền collaborator hoặc push bằng đúng account.
