// src/services/api.js — Axios instance with JWT auto-refresh
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Access token lives in memory only — NOT localStorage (XSS protection)
let _accessToken = null;
let _refreshing   = null; // Promise dedup — prevents multiple refresh calls

export const setToken = (t) => { _accessToken = t; };
export const clearToken = () => { _accessToken = null; };
export const getToken = () => _accessToken;

const api = axios.create({
  baseURL:         API_BASE,
  timeout:         30000,
  withCredentials: true, // Send httpOnly refresh cookie
});

// ── REQUEST: Attach bearer token ─────────────────────────
api.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
  return config;
});

// ── RESPONSE: Auto-refresh on 401 ────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    const status   = error.response?.status;

    // Don't retry login endpoint
    if (original?.url?.includes('/auth/login')) {
      return Promise.reject(error.response?.data || { message: error.message });
    }

    // On 401, attempt one token refresh
    if (status === 401 && !original._retried) {
      original._retried = true;

      // Deduplicate concurrent refresh calls
      if (!_refreshing) {
        _refreshing = axios
          .post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true })
          .then((res) => {
            const token = res.data?.data?.accessToken || res.data?.accessToken;
            setToken(token);
            return token;
          })
          .catch((refreshErr) => {
            clearToken();
            window.dispatchEvent(new CustomEvent('auth:session-expired'));
            return Promise.reject(refreshErr);
          })
          .finally(() => { _refreshing = null; });
      }

      try {
        const token = await _refreshing;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        return Promise.reject({ message: 'Session expired. Please log in again.' });
      }
    }

    return Promise.reject(
      error.response?.data || { message: error.message || 'Network error' }
    );
  }
);

export default api;
