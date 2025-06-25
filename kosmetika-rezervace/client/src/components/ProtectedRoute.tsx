import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JSX } from 'react';
import React from 'react';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
