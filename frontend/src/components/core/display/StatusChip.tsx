// src/components/core/display/StatusChip.tsx
import React from 'react';
import { Chip, ChipProps, alpha } from '@mui/material';
import { spacePalette } from '../../styles/theme';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: StatusType;
  glow?: boolean;
}

const StatusChip: React.FC<StatusChipProps> = ({
  status = 'default',
  glow = false,
  ...props
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return spacePalette.status.success;
      case 'warning': return spacePalette.status.warning;
      case 'error': return spacePalette.status.error;
      case 'info': return spacePalette.status.info;
      default: return spacePalette.primary.main;
    }
  };

  const statusColor = getStatusColor();

  return (
    <Chip
      {...props}
      sx={{
        bgcolor: alpha(statusColor, 0.1),
        border: '1px solid',
        borderColor: alpha(statusColor, 0.3),
        color: statusColor,
        fontWeight: 'medium',
        fontSize: '0.75rem',
        boxShadow: glow ? `0 0 8px ${alpha(statusColor, 0.4)}` : 'none',
        '& .MuiChip-label': {
          px: 1
        },
        ...props.sx
      }}
    />
  );
};

export default StatusChip;