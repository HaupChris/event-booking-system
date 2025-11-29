import React, { useState, useEffect } from 'react';
import { Box, Chip, Collapse, Typography, alpha } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import WifiIcon from '@mui/icons-material/Wifi';
import SyncIcon from '@mui/icons-material/Sync';
import { MetadataDB } from '../../../utils/indexedDB';

/**
 * Offline Indicator Component
 * Shows online/offline status and last sync time
 */
const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Load last sync time
    const loadLastSync = async () => {
      const lastSync = await MetadataDB.getLastSyncTime();
      setLastSyncTime(lastSync);
    };
    loadLastSync();

    // Handle online/offline events
    const handleOnline = () => {
      console.log('[OfflineIndicator] Connection restored');
      setIsOnline(true);
      setShowIndicator(true);

      // Hide the "back online" message after 5 seconds
      setTimeout(() => {
        setShowIndicator(false);
      }, 5000);
    };

    const handleOffline = () => {
      console.log('[OfflineIndicator] Connection lost');
      setIsOnline(false);
      setShowIndicator(true);
    };

    // Listen for sync events
    const handleSync = (event: Event) => {
      const customEvent = event as CustomEvent;
      const syncTime = customEvent.detail?.timestamp || new Date().toISOString();
      setLastSyncTime(syncTime);
      MetadataDB.setLastSyncTime(syncTime);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('datasynced', handleSync);

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('datasynced', handleSync);
    };
  }, []);

  const formatLastSync = (timestamp: string | null): string => {
    if (!timestamp) return 'Never synced';

    const syncDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - syncDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    return syncDate.toLocaleDateString();
  };

  // Don't show anything if online and indicator is hidden
  if (isOnline && !showIndicator) {
    return null;
  }

  return (
    <Collapse in={showIndicator || !isOnline}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          display: 'flex',
          justifyContent: 'center',
          padding: 1,
          pointerEvents: 'none',
        }}
      >
        <Chip
          icon={isOnline ? <WifiIcon /> : <WifiOffIcon />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {isOnline ? 'Online' : 'Offline'}
              </Typography>
              {!isOnline && lastSyncTime && (
                <>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    •
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SyncIcon sx={{ fontSize: 14 }} />
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      {formatLastSync(lastSyncTime)}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          }
          sx={{
            backgroundColor: isOnline
              ? (theme) => alpha(theme.palette.success.main, 0.9)
              : (theme) => alpha(theme.palette.warning.main, 0.9),
            color: 'white',
            fontWeight: 'bold',
            pointerEvents: 'auto',
            boxShadow: 3,
            '& .MuiChip-icon': {
              color: 'white',
            },
          }}
        />
      </Box>
    </Collapse>
  );
};

export default OfflineIndicator;
