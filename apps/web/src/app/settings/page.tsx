"use client";

import { useEffect, useState } from "react";
import { api, API_URL } from "@/lib/api";
import { Key, LogIn, LogOut } from "lucide-react";

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
      setError(err instanceof Error ? err.message : "Login failed");
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
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted">Authentication and API configuration</p>
      </header>

      <section className="mb-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <LogIn size={18} className="text-accent" />
          Admin Authentication
        </h2>

        {authenticated ? (
          <div>
            <p className="mb-4 text-sm text-green-400">You are logged in as admin.</p>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:border-accent/40"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-hover"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="text-xs text-muted">Required for creating, editing, and deleting notes.</p>
          </form>
        )}
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Key size={18} className="text-accent" />
          API Integration
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
            <dd className="mt-1 space-y-1 font-mono text-xs text-zinc-400">
              <p>GET /api/knowledge/search?q=...</p>
              <p>GET /api/knowledge/context</p>
              <p>GET /api/knowledge/notes</p>
              <p>GET /api/knowledge/notes/:id</p>
              <p>POST /api/chat</p>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Authentication</dt>
            <dd className="mt-1 text-zinc-400">
              Knowledge API endpoints require <code className="text-accent">Authorization: Bearer &lt;API_KEY&gt;</code>.
              Set <code className="text-accent">API_KEY</code> in worker secrets.
            </dd>
          </div>
          <div>
            <dt className="text-muted">Embedding Model</dt>
            <dd className="mt-1 font-mono text-zinc-400">@cf/baai/bge-small-en-v1.5 (384 dimensions)</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
