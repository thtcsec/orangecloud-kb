"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface AuthState {
  authenticated: boolean;
  loading: boolean;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.auth
      .me()
      .then((r) => setAuthenticated(r.authenticated))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (password: string) => {
    await api.auth.login(password);
    setAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setAuthenticated(false);
  }, []);

  return { authenticated, loading, login, logout };
}
