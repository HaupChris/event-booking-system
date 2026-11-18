import React from 'react';
import { Alert, Box, Button } from '@mui/material';
import { reportClientError } from '../../../utils/errorReporting';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Catches render errors, reports them and shows a reload hint instead of a blank page. */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    reportClientError({
      kind: 'render_error',
      message: error.message,
      stack: `${error.stack ?? ''}\n${info.componentStack ?? ''}`,
    });
  }

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', mt: 8, px: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Neu laden
            </Button>
          }
        >
          Da ist etwas schiefgelaufen. Der Fehler wurde gemeldet. Bitte lade die Seite neu.
        </Alert>
      </Box>
    );
  }
}

export default ErrorBoundary;
