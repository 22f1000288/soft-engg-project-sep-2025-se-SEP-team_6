import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_ROUTE_BY_ROLE } from '../constants/roles';
import { AuthContext } from './AuthContextValue';

const STORAGE_USER = 'tf_user';
const STORAGE_TOKENS = 'tf_tokens';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => readJson(STORAGE_USER));
  const [tokens, setTokens] = useState(() => readJson(STORAGE_TOKENS));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistUser = useCallback((value) => {
    setUser(value);
    if (value) localStorage.setItem(STORAGE_USER, JSON.stringify(value));
    else localStorage.removeItem(STORAGE_USER);
  }, []);

  const persistTokens = useCallback((value) => {
    setTokens(value);
    if (value) localStorage.setItem(STORAGE_TOKENS, JSON.stringify(value));
    else localStorage.removeItem(STORAGE_TOKENS);
  }, []);

  const setSession = useCallback(
    (payload) => {
      const nextTokens = {
        accessToken: payload.access_token,
        refreshToken: payload.refresh_token,
      };
      persistUser(payload.user);
      persistTokens(nextTokens);
      return payload.user;
    },
    [persistTokens, persistUser],
  );

  const redirectByRole = useCallback(
    (role) => {
      const target = DASHBOARD_ROUTE_BY_ROLE[role] ?? '/candidate-dashboard';
      navigate(target, { replace: true });
    },
    [navigate],
  );

  const logout = useCallback(() => {
    persistUser(null);
    persistTokens(null);
    navigate('/', { replace: true });
  }, [navigate, persistTokens, persistUser]);

  const callAuthEndpoint = useCallback(async (path, body) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.detail || 'Request failed');
    }
    return response.json();
  }, []);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        const data = await callAuthEndpoint('/login', { email, password });
        const loggedInUser = setSession(data);
        redirectByRole(loggedInUser?.role);
        return loggedInUser;
      } catch (err) {
        setError(err.message || 'Login failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [callAuthEndpoint, redirectByRole, setSession],
  );

  const signup = useCallback(
    async ({ name, email, password, role }) => {
      setLoading(true);
      setError(null);
      try {
        const data = await callAuthEndpoint('/signup', {
          name,
          email,
          password,
          role,
        });
        const registeredUser = setSession(data);
        redirectByRole(registeredUser?.role);
        return registeredUser;
      } catch (err) {
        setError(err.message || 'Signup failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [callAuthEndpoint, redirectByRole, setSession],
  );

  const refreshAccessToken = useCallback(async () => {
    if (!tokens?.refreshToken) return null;
    try {
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: tokens.refreshToken }),
      });
      if (!response.ok) {
        throw new Error('Refresh failed');
      }
      const data = await response.json();
      setSession(data);
      return data.access_token;
    } catch (err) {
      logout();
      return null;
    }
  }, [logout, setSession, tokens?.refreshToken]);

  const authFetch = useCallback(
    async (path, options = {}) => {
      const target = path.startsWith('http')
        ? path
        : `${API_BASE_URL}${path}`;

      const makeRequest = async (accessToken) => {
        const headers = new Headers(options.headers || {});
        if (accessToken) {
          headers.set('Authorization', `Bearer ${accessToken}`);
        }
        return fetch(target, {
          ...options,
          headers,
        });
      };

      let accessToken = tokens?.accessToken;
      if (!accessToken) {
        accessToken = await refreshAccessToken();
        if (!accessToken) {
          throw new Error('Session expired');
        }
      }

      let response = await makeRequest(accessToken);
      if (response.status === 401 && tokens?.refreshToken) {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          throw new Error('Session expired');
        }
        response = await makeRequest(newToken);
      }
      return response;
    },
    [refreshAccessToken, tokens?.accessToken, tokens?.refreshToken],
  );

  const isAuthenticated = Boolean(user && tokens?.accessToken);

  const value = useMemo(
    () => ({
      user,
      tokens,
      isAuthenticated,
      loading,
      error,
      login,
      signup,
      logout,
      authFetch,
      refreshAccessToken,
      setUser: persistUser,
    }),
    [
      authFetch,
      error,
      isAuthenticated,
      loading,
      login,
      logout,
      persistUser,
      refreshAccessToken,
      signup,
      tokens,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// NOTE: `useAuth` hook is exported from a separate file to avoid
// react-refresh ESLint warnings (files that export components should
// not also export non-component values). See `src/contexts/useAuth.jsx`.
