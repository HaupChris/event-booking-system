import React from 'react';
import { Box, Button, Typography} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  SwapHoriz as SwapHorizIcon
} from '@mui/icons-material';

interface ActionButtonsProps {
  selectedUsers: Set<number>;
  selectedTimeslot: number | null;
  onAssignUsers: () => void;
  onUnassignUsers: () => void;
  onSwapUsers: () => void;
  loading: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectedUsers,
  selectedTimeslot,
  onAssignUsers,
  onUnassignUsers,
  onSwapUsers,
  loading
}) => {
  const canAssign = selectedUsers.size > 0 && selectedTimeslot !== null;
  const canUnassign = selectedUsers.size > 0;
  const canSwap = selectedUsers.size === 2;

return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      p: 2,
      gap: 2
    }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
        <Typography variant="body2" color="text.secondary">
          {selectedUsers.size} users selected
        </Typography>
      </Box>

      {/* Buttons - Centered */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        flexGrow: 1,
        justifyContent: 'center'
      }}>
        {/* Assign Button */}
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={onAssignUsers}
          disabled={!canAssign || loading}
          color="primary"
          fullWidth
          sx={{ py: 1.5 }}
        >
          Assign to Timeslot
        </Button>

        {/* Unassign Button */}
        <Button
          variant="outlined"
          startIcon={<PersonRemoveIcon />}
          onClick={onUnassignUsers}
          disabled={!canUnassign || loading}
          color="error"
          fullWidth
          sx={{ py: 1.5 }}
        >
          Remove Assignment
        </Button>

        {/* Swap Button */}
        <Button
          variant="outlined"
          startIcon={<SwapHorizIcon />}
          onClick={onSwapUsers}
          disabled={!canSwap || loading}
          color="secondary"
          fullWidth
          sx={{ py: 1.5 }}
        >
          Swap Assignments
        </Button>
      </Box>

      {/* Status Info */}
      <Box sx={{ mt: 'auto', flexShrink: 0 }}>
        <Typography variant="caption" color="text.secondary" align="center">
          {!canAssign && selectedUsers.size > 0 && !selectedTimeslot &&
            "Select a timeslot to assign users"}
          {!canAssign && selectedUsers.size === 0 &&
            "Select users to perform actions"}
          {canAssign &&
            `Ready to assign ${selectedUsers.size} user${selectedUsers.size > 1 ? 's' : ''}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default ActionButtons;