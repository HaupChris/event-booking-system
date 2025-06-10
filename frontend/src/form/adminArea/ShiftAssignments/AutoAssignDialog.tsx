// src/form/adminArea/ShiftAssignments/AutoAssignDialog.tsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, FormControl, InputLabel, Select,
  MenuItem, CircularProgress
} from '@mui/material';
import { AssignStrategy } from './types';

interface AutoAssignDialogProps {
  open: boolean;
  onClose: () => void;
  onRun: (strategy: AssignStrategy) => Promise<void>;
}

const AutoAssignDialog: React.FC<AutoAssignDialogProps> = ({
  open,
  onClose,
  onRun
}) => {
  const [strategy, setStrategy] = useState<AssignStrategy>('priority');
  const [loading, setLoading] = useState<boolean>(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      await onRun(strategy);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Auto-Assign Shifts</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          This will automatically assign participants to shifts based on their preferences.
          Any existing assignments will be preserved.
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Assignment Strategy</InputLabel>
          <Select
            value={strategy}
            label="Assignment Strategy"
            onChange={(e) => setStrategy(e.target.value as AssignStrategy)}
          >
            <MenuItem value="priority">Prioritize Participant Preferences</MenuItem>
            <MenuItem value="fill">Prioritize Filling Timeslots</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {strategy === 'priority' ?
            "This will assign participants to their highest priority shifts first, then second, then third." :
            "This will fill up the least-filled timeslots first, starting with participants who selected them."
          }
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleRun}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          Run Auto-Assignment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutoAssignDialog;