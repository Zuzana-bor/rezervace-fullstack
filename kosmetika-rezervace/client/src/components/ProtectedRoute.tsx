import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JSX } from 'react';
import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
