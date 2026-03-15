// src/context/AuthContext.jsx — Global auth state with JWT memory tokens
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { setToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true while checking session

  // ── Restore session on mount ──────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        // Try to get a new access token using the httpOnly refresh cookie
        const res   = await api.post('/auth/refresh');
        const token = res?.data?.accessToken || res?.accessToken;
        setToken(token);

        // Fetch current user profile
        const me = await api.get('/auth/me');
        setUser(me?.data || me);
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();

    // Listen for session expired event (from api interceptor)
    const handler = () => { clearToken(); setUser(null); };
    window.addEventListener('auth:session-expired', handler);
    return () => window.removeEventListener('auth:session-expired', handler);
  }, []);

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res   = await api.post('/auth/login', { email, password });
    const token = res?.data?.accessToken || res?.accessToken;
    setToken(token);
    const u = res?.data?.user || res?.user;
    setUser(u);
    return u;
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    clearToken();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin:  user?.role === 'ADMIN',
    isStaff:  user?.role === 'STAFF' || user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
