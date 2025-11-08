import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export default function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();

  // redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login-signup" replace />;
  }
  // redirect to login if role not authorized
  if (roles && roles.length && !roles.includes(user.role)) {
    return <Navigate to="/login-signup" replace />;
  }
  return children;
}