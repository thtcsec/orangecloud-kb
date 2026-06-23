"use client";

import { useEffect, useState } from "react";
import { api, API_URL } from "@/lib/api";
import { Key, LogIn, LogOut, Palette } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SettingsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.auth.me().then((r) => setAuthenticated(r.authenticated));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.auth.login(password);
      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await api.auth.logout();
    setAuthenticated(false);
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <p className="text-sm text-muted">Giao diện, xác thực và cấu hình API</p>
      </header>

      {/* Theme */}
      <section className="mb-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Palette size={18} className="text-accent" />
          Giao diện
        </h2>
        <ThemeToggle />
      </section>

      {/* Auth */}
      <section className="mb-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <LogIn size={18} className="text-accent" />
          Xác thực Admin
        </h2>

        {authenticated ? (
          <div>
            <p className="mb-4 text-sm text-green-600 dark:text-green-400">Đã đăng nhập với quyền admin.</p>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:border-accent/40"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu admin"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-hover"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
            <p className="text-xs text-muted">Cần thiết để tạo, chỉnh sửa và xoá ghi chú.</p>
          </form>
        )}
      </section>

      {/* API Info */}
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Key size={18} className="text-accent" />
          Tích hợp API
        </h2>

        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-muted">API Base URL</dt>
            <dd className="mt-1 font-mono text-accent">{API_URL}</dd>
          </div>
          <div>
            <dt className="text-muted">OpenAPI Spec</dt>
            <dd className="mt-1">
              <a href={`${API_URL}/api/openapi.json`} className="font-mono text-accent hover:underline" target="_blank" rel="noreferrer">
                {API_URL}/api/openapi.json
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Custom GPT Endpoints</dt>
            <dd className="mt-1 space-y-1 font-mono text-xs text-muted">
              <p>GET /api/knowledge/search?q=...</p>
              <p>GET /api/knowledge/context</p>
              <p>GET /api/knowledge/notes</p>
              <p>GET /api/knowledge/notes/:id</p>
              <p>POST /api/chat</p>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Xác thực</dt>
            <dd className="mt-1 text-muted">
              Knowledge API yêu cầu <code className="text-accent">Authorization: Bearer &lt;API_KEY&gt;</code>.
              Cấu hình <code className="text-accent">API_KEY</code> trong Worker secrets.
            </dd>
          </div>
          <div>
            <dt className="text-muted">Embedding Model</dt>
            <dd className="mt-1 font-mono text-muted">@cf/baai/bge-small-en-v1.5 (384 dimensions)</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
