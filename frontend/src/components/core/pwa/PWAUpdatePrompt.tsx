import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * PWA Update Prompt Component
 * Shows a notification when a new version of the app is available
 */
const PWAUpdatePrompt: React.FC = () => {
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // Listen for the custom service worker update event
    const handleSWUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const registration = customEvent.detail as ServiceWorkerRegistration;

      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowReload(true);
      }
    };

    window.addEventListener('swUpdated', handleSWUpdate);

    return () => {
      window.removeEventListener('swUpdated', handleSWUpdate);
    };
  }, []);

  const reloadPage = () => {
    if (waitingWorker) {
      // Tell the service worker to skip waiting and become active
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });

      // Once the new service worker is activated, reload the page
      waitingWorker.addEventListener('statechange', (e) => {
        const target = e.target as ServiceWorker;
        if (target.state === 'activated') {
          window.location.reload();
        }
      });
    } else {
      // Fallback: just reload the page
      window.location.reload();
    }
  };

  return (
    <Snackbar
      open={showReload}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ top: { xs: 80, sm: 24 } }}
    >
      <Alert
        severity="success"
        icon={<RefreshIcon />}
        action={
          <Button color="inherit" size="small" onClick={reloadPage} sx={{ fontWeight: 'bold' }}>
            Reload
          </Button>
        }
        sx={{ width: '100%' }}
      >
        A new version is available! Click reload to update.
      </Alert>
    </Snackbar>
  );
};

export default PWAUpdatePrompt;
