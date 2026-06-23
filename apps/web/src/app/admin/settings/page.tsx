"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import { ArrowLeft, Key, Globe, Cpu, CheckCircle, XCircle, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  const [healthOk, setHealthOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((r) => setHealthOk(r.ok))
      .catch(() => setHealthOk(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-8">
        <Link href="/admin" className="mb-2 flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft size={14} /> Quay lại Admin
        </Link>
        <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>
        <p className="text-sm text-muted">Cấu hình API, bảo mật và trạng thái hệ thống</p>
      </header>

      {/* System Status */}
      <section className="mb-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Cpu size={18} className="text-accent" />
          Trạng thái hệ thống
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">API Health</span>
            {healthOk === null ? (
              <span className="text-muted">Đang kiểm tra...</span>
            ) : healthOk ? (
              <span className="flex items-center gap-1 text-green-500">
                <CheckCircle size={14} /> Hoạt động
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400">
                <XCircle size={14} /> Không thể kết nối
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">API URL</span>
            <span className="font-mono text-xs text-accent">{API_URL}</span>
          </div>
        </div>
      </section>

      {/* API Integration */}
      <section className="mb-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Key size={18} className="text-accent" />
          Tích hợp API
        </h2>
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-muted">OpenAPI Spec</dt>
            <dd className="mt-1">
              <a
                href={`${API_URL}/api/openapi.json`}
                className="font-mono text-xs text-accent hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {API_URL}/api/openapi.json
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Knowledge API (bearer token)</dt>
            <dd className="mt-1 space-y-1 font-mono text-xs text-muted">
              <p>GET /api/knowledge/search?q=...</p>
              <p>GET /api/knowledge/context</p>
              <p>GET /api/knowledge/notes</p>
              <p>GET /api/knowledge/notes/:id</p>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Xác thực API</dt>
            <dd className="mt-1 text-muted">
              <code className="text-accent">Authorization: Bearer &lt;API_KEY&gt;</code> — cấu hình trong Worker secrets.
            </dd>
          </div>
          <div>
            <dt className="text-muted">Embedding Model</dt>
            <dd className="mt-1 font-mono text-xs text-muted">@cf/baai/bge-small-en-v1.5 (384 dimensions)</dd>
          </div>
        </dl>
      </section>

      {/* Security */}
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Shield size={18} className="text-accent" />
          Bảo mật
        </h2>
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-muted">Truy cập Admin</dt>
            <dd className="mt-1 text-muted">Bảo vệ bởi Cloudflare Access — chỉ người được phép mới truy cập được /admin</dd>
          </div>
          <div>
            <dt className="text-muted">CORS Allowed Origins</dt>
            <dd className="mt-1 font-mono text-xs text-muted">
              <p>https://kb.orangecloud.vn (production)</p>
              <p>http://localhost:3000 (development)</p>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Giới hạn tốc độ</dt>
            <dd className="mt-1 text-muted">
              10 request/phút/IP trên /api/chat · 30 request/phút/IP cho ghi (POST/PUT/DELETE)
            </dd>
          </div>
          <div>
            <dt className="text-muted">Security Headers</dt>
            <dd className="mt-1 text-muted">
              X-Frame-Options: DENY · X-Content-Type-Options: nosniff · Referrer-Policy: strict-origin
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
