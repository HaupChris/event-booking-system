import React, { useState, useEffect } from 'react';
import { Box, Button, Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import { promptInstall, isPWA } from '../../../serviceWorkerRegistration';

/**
 * PWA Install Prompt Component
 * Shows a prompt to install the app when available
 */
const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (isPWA()) {
      return;
    }

    // Check if user has already dismissed the prompt
    const isDismissed = localStorage.getItem('pwa-install-dismissed');
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    // Listen for the custom install prompt event
    const handleInstallPrompt = () => {
      setShowPrompt(true);
    };

    window.addEventListener('showInstallPrompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('showInstallPrompt', handleInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    promptInstall();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (dismissed || !showPrompt) {
    return null;
  }

  return (
    <Snackbar
      open={showPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 80, sm: 24 } }}
    >
      <Alert
        severity="info"
        icon={<GetAppIcon />}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              size="small"
              onClick={handleInstall}
              sx={{ fontWeight: 'bold' }}
            >
              Install
            </Button>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleDismiss}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
        sx={{ width: '100%' }}
      >
        Install Wiesenwahn app for quick access and offline support!
      </Alert>
    </Snackbar>
  );
};

export default PWAInstallPrompt;