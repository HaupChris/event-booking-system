// frontend/src/form/adminArea/ShiftAssignments/components/ActionPanel.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  alpha
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  AutoFixHigh as AutoFixHighIcon,
  Assignment as AssignmentIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { spacePalette } from '../../../../components/styles/theme';

interface ActionPanelProps {
  selectedUserCount: number;
  selectedTimeslotCount: number;
  isSaving: boolean;
  onBulkAssign: () => void;
  onAutoAssign: (strategy: 'priority' | 'fill') => void;
  onClearSelections: () => void;
  onRefresh: () => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({
  selectedUserCount,
  selectedTimeslotCount,
  isSaving,
  onBulkAssign,
  onAutoAssign,
  onClearSelections,
  onRefresh
}) => {
  const [autoAssignDialogOpen, setAutoAssignDialogOpen] = useState(false);
  const [autoAssignStrategy, setAutoAssignStrategy] = useState<'priority' | 'fill'>('priority');

  const canBulkAssign = selectedUserCount > 0 && selectedTimeslotCount > 0;

  const handleAutoAssignClick = () => {
    setAutoAssignDialogOpen(true);
  };

  const handleAutoAssignConfirm = () => {
    onAutoAssign(autoAssignStrategy);
    setAutoAssignDialogOpen(false);
  };

  const handleAutoAssignCancel = () => {
    setAutoAssignDialogOpen(false);
  };

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          backgroundColor: alpha(spacePalette.primary.main, 0.02)
        }}
      >
        {/* Header */}
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Actions
        </Typography>

        {/* Selection Status */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Current Selection
          </Typography>
          <Box sx={{
            p: 2,
            borderRadius: 1,
            backgroundColor: alpha(spacePalette.primary.main, 0.05),
            border: `1px solid ${alpha(spacePalette.primary.main, 0.2)}`
          }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>{selectedUserCount}</strong> participant{selectedUserCount !== 1 ? 's' : ''}
            </Typography>
            <Typography variant="body2">
              <strong>{selectedTimeslotCount}</strong> timeslot{selectedTimeslotCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>

        {/* Bulk Actions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Bulk Operations
          </Typography>

          <Tooltip
            title={
              !canBulkAssign
                ? "Select both participants and timeslots to bulk assign"
                : `Assign ${selectedUserCount} participant${selectedUserCount !== 1 ? 's' : ''} to ${selectedTimeslotCount} timeslot${selectedTimeslotCount !== 1 ? 's' : ''}`
            }
          >
            <span>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                disabled={!canBulkAssign || isSaving}
                onClick={onBulkAssign}
                startIcon={
                  isSaving ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <PlayArrowIcon />
                  )
                }
                sx={{
                  mb: 1,
                  py: 1.5,
                  fontWeight: 'bold',
                  background: canBulkAssign && !isSaving
                    ? 'linear-gradient(45deg, #1e88e5, #64b5f6)'
                    : undefined,
                  '&:hover': canBulkAssign && !isSaving ? {
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  } : undefined
                }}
              >
                {isSaving ? 'Assigning...' : 'Bulk Assign'}
              </Button>
            </span>
          </Tooltip>

          <Button
            fullWidth
            variant="outlined"
            disabled={selectedUserCount === 0 && selectedTimeslotCount === 0}
            onClick={onClearSelections}
            startIcon={<ClearIcon />}
            sx={{ mb: 1 }}
          >
            Clear Selection
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Auto Assignment */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Automated Assignment
          </Typography>

          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={handleAutoAssignClick}
            startIcon={<AutoFixHighIcon />}
            disabled={isSaving}
            sx={{
              mb: 1,
              py: 1.5,
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
              '&:hover': {
                background: 'linear-gradient(45deg, #8e24aa, #ab47bc)',
              }
            }}
          >
            Auto Assign
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            Automatically assign all participants based on their preferences
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Utility Actions */}
        <Box sx={{ mt: 'auto' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Utilities
          </Typography>

          <Button
            fullWidth
            variant="outlined"
            onClick={onRefresh}
            startIcon={<RefreshIcon />}
            disabled={isSaving}
            sx={{ mb: 1 }}
          >
            Refresh Data
          </Button>
        </Box>

        {/* Status Information */}
        <Box sx={{
          mt: 2,
          p: 1.5,
          borderRadius: 1,
          backgroundColor: alpha(spacePalette.status.info, 0.1),
          border: `1px solid ${alpha(spacePalette.status.info, 0.3)}`
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            💡 Tip: Select users on the left and timeslots on the right for bulk operations
          </Typography>
        </Box>
      </Paper>

      {/* Auto Assignment Dialog */}
      <Dialog
        open={autoAssignDialogOpen}
        onClose={handleAutoAssignCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AutoFixHighIcon sx={{ mr: 1, color: spacePalette.primary.main }} />
            Auto Assignment Configuration
          </Box>
        </DialogTitle>

        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Auto assignment will clear all existing assignments and create new ones based on the selected strategy.
          </Alert>

          <FormControl fullWidth>
            <InputLabel>Assignment Strategy</InputLabel>
            <Select
              value={autoAssignStrategy}
              label="Assignment Strategy"
              onChange={(e) => setAutoAssignStrategy(e.target.value as 'priority' | 'fill')}
            >
              <MenuItem value="priority">
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <AssignmentIcon sx={{ mr: 1, fontSize: 20 }} />
                    Priority-Based Assignment
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Assign participants to their highest priority choices first
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="fill">
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <SpeedIcon sx={{ mr: 1, fontSize: 20 }} />
                    Fill-Based Assignment
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Fill up timeslots to capacity, starting with least filled
                  </Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 2, p: 2, backgroundColor: alpha(spacePalette.status.warning, 0.1), borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> This operation cannot be undone. Make sure to refresh the data after completion
              to see the results.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleAutoAssignCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleAutoAssignConfirm}
            variant="contained"
            startIcon={<AutoFixHighIcon />}
          >
            Run Auto Assignment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActionPanel;