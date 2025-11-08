import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContextValue';

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('tf_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    // optional: validate user on mount if needed
  }, []);
    // login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(txt || 'Login failed');
      }
      const data = await r.json();
      // expected shape: { user: { id, email, role, name } }
      setUser(data.user);
      localStorage.setItem('tf_user', JSON.stringify(data.user));

      // redirect by role
      if (data.user?.role === 'hr') navigate('/hr-dashboard');
      else if (data.user?.role === 'admin') navigate('/admin-dashboard');
      else navigate('/candidate-dashboard');

      return data.user;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // signup function

  const signup = async ({ name, email, password, role }) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (!r.ok) {
        const payload = await r.json().catch(() => ({}));
        throw new Error(payload.detail || 'Signup failed');
      }
      const data = await r.json();
      setUser(data.user);
      localStorage.setItem('tf_user', JSON.stringify(data.user));
      if (data.user?.role === 'hr') navigate('/hr-dashboard');
      else if (data.user?.role === 'admin') navigate('/admin-dashboard');
      else navigate('/candidate-dashboard');
      return data.user;
    } catch (err) {
      setError(err.message || 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // logout function

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tf_user');
    navigate('/login-signup');
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, loading, error,
      login, signup, logout, setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// NOTE: `useAuth` hook is exported from a separate file to avoid
// react-refresh ESLint warnings (files that export components should
// not also export non-component values). See `src/contexts/useAuth.jsx`.