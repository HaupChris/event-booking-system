import React, { useState, useEffect } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Alert,
  alpha,
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { syncService } from '../../../services/syncService';
import type { SyncOperation } from '../../../utils/indexedDB';
import { SyncQueueDB } from '../../../utils/indexedDB';

/**
 * Sync Queue Manager Component
 * Shows pending operations and allows manual sync
 */
const SyncQueueManager: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [pendingOps, setPendingOps] = useState<SyncOperation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncError, setSyncError] = useState<string | null>(null);

  const open = Boolean(anchorEl);

  // Load pending operations
  const loadPendingOps = async () => {
    const ops = await SyncQueueDB.getPending();
    setPendingOps(ops);
  };

  useEffect(() => {
    loadPendingOps();

    const interval = setInterval(loadPendingOps, 5000); // Refresh every 5 seconds

    // Listen for sync events
    const handleDataSynced = () => {
      loadPendingOps();
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('datasynced', handleDataSynced);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('datasynced', handleDataSynced);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSync = async () => {
    if (!isOnline) {
      setSyncError('Cannot sync while offline. Please check your connection.');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    try {
      await syncService.syncAll();
      await loadPendingOps();
    } catch {
      setSyncError('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const getOperationLabel = (type: SyncOperation['type']): string => {
    switch (type) {
      case 'ACCEPT_SHIFT':
        return 'Accept shift';
      case 'DECLINE_SHIFT':
        return 'Decline shift';
      case 'UPDATE_PROFILE':
        return 'Update profile';
      case 'UPDATE_BOOKING':
        return 'Update booking';
      case 'MARK_NEWS_READ':
        return 'Mark news read';
      default:
        return 'Unknown operation';
    }
  };

  const getOperationIcon = (status: SyncOperation['status']) => {
    switch (status) {
      case 'pending':
        return <CloudUploadIcon sx={{ color: 'warning.main' }} />;
      case 'processing':
        return <CircularProgress size={20} />;
      case 'failed':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    }
  };

  // Don't show the button if there are no pending operations
  if (pendingOps.length === 0) {
    return null;
  }

  return (
    <>
      <Badge
        badgeContent={pendingOps.length}
        color="warning"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1200,
        }}
      >
        <IconButton
          onClick={handleClick}
          sx={{
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.9),
            color: 'white',
            boxShadow: 3,
            '&:hover': {
              backgroundColor: (theme) => theme.palette.primary.dark,
            },
          }}
        >
          {isSyncing ? <CircularProgress size={24} color="inherit" /> : <SyncIcon />}
        </IconButton>
      </Badge>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 350, maxHeight: 500 }}>
          <Box
            sx={{
              p: 2,
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Pending Changes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pendingOps.length} operation{pendingOps.length !== 1 ? 's' : ''} waiting to sync
            </Typography>
          </Box>

          <List>
            {syncError && (
              <ListItem>
                <Alert severity="error" sx={{ width: '100%' }}>
                  {syncError}
                </Alert>
              </ListItem>
            )}
            {pendingOps.map((op, index) => (
              <React.Fragment key={op.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemIcon>{getOperationIcon(op.status)}</ListItemIcon>
                  <ListItemText
                    primary={getOperationLabel(op.type)}
                    secondary={
                      <>
                        {new Date(op.timestamp).toLocaleString()}
                        {op.retries > 0 && (
                          <Typography component="span" variant="body2" color="error" sx={{ ml: 1 }}>
                            • {op.retries} {op.retries === 1 ? 'retry' : 'retries'}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>

          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SyncIcon />}
              onClick={handleSync}
              disabled={isSyncing || !isOnline}
            >
              {isSyncing ? 'Syncing...' : isOnline ? 'Sync Now' : 'Offline'}
            </Button>
            {!isOnline && (
              <Typography
                variant="caption"
                color="warning.main"
                sx={{ display: 'block', mt: 1, textAlign: 'center' }}
              >
                Changes will sync automatically when online
              </Typography>
            )}
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default SyncQueueManager;
