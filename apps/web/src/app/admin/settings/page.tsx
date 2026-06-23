"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, API_URL } from "@/lib/api";
import { AdminGuard } from "@/components/AdminGuard";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Key, Globe, Cpu, LogOut, CheckCircle, XCircle } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <AdminGuard>
      <AdminSettingsContent />
    </AdminGuard>
  );
}

function AdminSettingsContent() {
  const { logout } = useAuth();
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
          <ArrowLeft size={14} /> Back to Admin
        </Link>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-sm text-muted">API configuration and system status</p>
      </header>

      {/* System Status */}
      <section className="mb-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Cpu size={18} className="text-accent" />
          System Status
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">API Health</span>
            {healthOk === null ? (
              <span className="text-muted">Checking...</span>
            ) : healthOk ? (
              <span className="flex items-center gap-1 text-green-500">
                <CheckCircle size={14} /> Healthy
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400">
                <XCircle size={14} /> Unreachable
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
          API Integration
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
            <dt className="text-muted">Knowledge API (bearer token required)</dt>
            <dd className="mt-1 space-y-1 font-mono text-xs text-muted">
              <p>GET /api/knowledge/search?q=...</p>
              <p>GET /api/knowledge/context</p>
              <p>GET /api/knowledge/notes</p>
              <p>GET /api/knowledge/notes/:id</p>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Embedding Model</dt>
            <dd className="mt-1 font-mono text-xs text-muted">@cf/baai/bge-small-en-v1.5 (384 dimensions)</dd>
          </div>
        </dl>
      </section>

      {/* Allowed Origins */}
      <section className="mb-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Globe size={18} className="text-accent" />
          Security
        </h2>
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-muted">CORS Allowed Origins</dt>
            <dd className="mt-1 font-mono text-xs text-muted">
              <p>https://kb.orangecloud.vn (production)</p>
              <p>http://localhost:3000 (development)</p>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Rate Limiting</dt>
            <dd className="mt-1 text-muted">10 requests/minute per IP on /api/chat</dd>
          </div>
          <div>
            <dt className="text-muted">Authentication</dt>
            <dd className="mt-1 text-muted">
              HMAC-SHA256 session tokens, HttpOnly cookie, 7-day expiry, Secure flag on HTTPS
            </dd>
          </div>
        </dl>
      </section>

      {/* Session */}
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-semibold">Session</h2>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition hover:border-red-400 hover:text-red-400"
        >
          <LogOut size={16} />
          Logout
        </button>
      </section>
    </div>
  );
}
