/**
 * Global auth state for the React app.
 *
 * - Stores JWT in localStorage (Tier 1 simplicity; httpOnly cookies are a later improvement)
 * - On load, calls GET /api/auth/me to restore session
 * - Exposes login, register, logout for pages
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiFetch } from '../lib/api';
import type { User } from '../types';

const TOKEN_KEY = 'condopay_token';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [loading, setLoading] = useState(true);

  const persistSession = (nextUser: User, nextToken: string) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  };

  const refreshUser = useCallback(async () => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<{ user: User }>('/api/auth/me', {}, stored);
      // A slower /me from an old token must not wipe a session set by a fresh login
      if (localStorage.getItem(TOKEN_KEY) !== stored) return;
      setToken(stored);
      setUser(data.user);
    } catch {
      if (localStorage.getItem(TOKEN_KEY) === stored) {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ user: User; token: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      }
    );
    persistSession(data.user, data.token);
  };

  const register = async (payload: Record<string, unknown>) => {
    const email =
      typeof payload.email === 'string'
        ? payload.email.trim().toLowerCase()
        : payload.email;
    const data = await apiFetch<{ user: User; token: string }>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify({ ...payload, email }) }
    );
    persistSession(data.user, data.token);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
