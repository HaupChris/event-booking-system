// src/components/core/display/PriorityTimeSlot.tsx
import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StatusChip from './StatusChip';
import { useThemeMode } from '../../styles/theme';
import { useBrandingPack } from '../../../branding/useBrandingPack';

interface PriorityTimeSlotProps {
  priority: string;
  status: 'success' | 'info' | 'warning';
  shiftTitle: string;
  timeSlotTitle: string;
  startTime: string;
  endTime: string;
}

const PriorityTimeSlot: React.FC<PriorityTimeSlotProps> = ({
  priority,
  status,
  shiftTitle,
  timeSlotTitle,
  startTime,
  endTime,
}) => {
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';

  // Map status to colors for the box background
  const getBgColor = () => {
    if (isCircusMode) {
      return alpha('#2a120f', 0.6);
    }

    switch (status) {
      case 'success':
        return alpha('#4caf50', 0.1);
      case 'info':
        return alpha('#2196f3', 0.1);
      case 'warning':
        return alpha('#ff9800', 0.1);
      default:
        return alpha('#1e88e5', 0.1);
    }
  };

  // Map status to colors for the box border
  const getBorderColor = () => {
    if (isCircusMode) {
      return alpha('#d8b87a', 0.5);
    }

    switch (status) {
      case 'success':
        return alpha('#4caf50', 0.3);
      case 'info':
        return alpha('#2196f3', 0.3);
      case 'warning':
        return alpha('#ff9800', 0.3);
      default:
        return alpha('#1e88e5', 0.3);
    }
  };

  return (
    <Box
      sx={{
        mb: 2,
        py: 1.5,
        px: 2,
        bgcolor: getBgColor(),
        borderRadius: isCircusMode ? '12px' : '8px',
        border: '1px solid',
        borderColor: getBorderColor(),
        ...(isCircusMode && {
          boxShadow: 'inset 0 0 0 1px rgba(244,205,142,0.14)',
        }),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 0.5,
        }}
      >
        <StatusChip
          label={priority}
          status={status}
          size="small"
          sx={{ mr: 1, fontWeight: 'bold' }}
        />
        <Typography
          variant="body1"
          fontWeight="medium"
          sx={{
            color: isCircusMode ? '#f4ead6' : alpha('#fff', 0.9),
            fontFamily: isCircusMode ? brandingPack.typography.body : undefined,
          }}
        >
          {shiftTitle}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: 4,
          color: isCircusMode ? alpha('#e5cf9f', 0.95) : alpha('#fff', 0.7),
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontFamily: isCircusMode ? brandingPack.typography.body : undefined }}
        >
          {timeSlotTitle}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            ml: 1,
          }}
        >
          <AccessTimeIcon sx={{ fontSize: '0.8rem', mx: 0.5 }} />
          <Typography
            variant="body2"
            sx={{ fontFamily: isCircusMode ? brandingPack.typography.body : undefined }}
          >
            {startTime} - {endTime}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PriorityTimeSlot;
