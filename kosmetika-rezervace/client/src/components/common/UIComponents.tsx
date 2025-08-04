// Společné UI komponenty pro lepší reusability
import { CircularProgress, Box, Typography, Alert } from '@mui/material';
import React from 'react';

// Loading spinner komponenta
interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message = 'Načítání...',
  fullScreen = false,
}) => {
  const containerStyle = fullScreen
    ? {
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: 2,
      }
    : {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: 2,
        p: 3,
      };

  return (
    <Box sx={containerStyle}>
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

// Error display komponenta
interface ErrorDisplayProps {
  error: string | Error;
  onRetry?: () => void;
  variant?: 'inline' | 'card';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  variant = 'inline',
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  if (variant === 'card') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
        {onRetry && <button onClick={onRetry}>Zkusit znovu</button>}
      </Box>
    );
  }

  return (
    <Alert severity="error" onClose={onRetry ? undefined : undefined}>
      {errorMessage}
    </Alert>
  );
};
