import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Load user and token from localStorage on mount
    const tokenData = localStorage.getItem('tf_tokens');
    const userData = localStorage.getItem('tf_user');
    
    if (tokenData && userData) {
      setToken(JSON.parse(tokenData));
      setUser(JSON.parse(userData));
    }
  }, []);

  const authFetch = async (url, options = {}) => {
    const tokenData = localStorage.getItem('tf_tokens');
    if (!tokenData) {
      throw new Error('Not authenticated');
    }
    
    const tokens = JSON.parse(tokenData);
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${tokens.accessToken}`,
    };

    return fetch(`http://localhost:8000${url}`, {
      ...options,
      headers,
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};