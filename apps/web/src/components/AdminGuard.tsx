"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Lock, LogIn } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { authenticated, loading, login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="animate-pulse text-muted">Checking authentication...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8">
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Lock size={24} className="text-accent" />
            </div>
            <h2 className="text-lg font-semibold">Admin Access Required</h2>
            <p className="text-center text-sm text-muted">
              Enter the admin password to access this area.
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              setError("");
              try {
                await login(password);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Login failed");
              } finally {
                setSubmitting(false);
              }
            }}
            className="space-y-4"
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
              autoFocus
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-black transition hover:bg-accent-hover disabled:opacity-50"
            >
              <LogIn size={16} />
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
