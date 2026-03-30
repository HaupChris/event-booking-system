/**
 * Custom hook for managing snackbar/notification state
 */

import { useState } from 'react';

export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

export function useSnackbar() {
  const [snackbarState, setSnackbarState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message: string, severity: SnackbarSeverity = 'success') => {
    setSnackbarState({
      open: true,
      message,
      severity,
    });
  };

  const showSuccess = (message: string) => {
    showSnackbar(message, 'success');
  };

  const showError = (message: string) => {
    showSnackbar(message, 'error');
  };

  const showWarning = (message: string) => {
    showSnackbar(message, 'warning');
  };

  const showInfo = (message: string) => {
    showSnackbar(message, 'info');
  };

  const hideSnackbar = () => {
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  return {
    snackbarState,
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideSnackbar,
  };
}
