// src/components/core/display/MissionHeading.tsx
import React, { ReactNode } from 'react';
import { Box, Typography, Divider, alpha } from '@mui/material';
import { spacePalette } from '../../styles/theme';

interface MissionHeadingProps {
  title: string;
  icon?: ReactNode;
  subtitle?: string;
  withDivider?: boolean;
}

const MissionHeading: React.FC<MissionHeadingProps> = ({
  title,
  icon,
  subtitle,
  withDivider = true,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: subtitle ? 1 : 2
      }}>
        {icon && (
          <Box sx={{ color: spacePalette.primary.main, mr: 1, display: 'flex' }}>
            {icon}
          </Box>
        )}
        <Typography
          variant="h6"
          sx={{
            color: alpha('#fff', 0.9),
            fontWeight: 'medium'
          }}
        >
          {title}
        </Typography>
      </Box>

      {subtitle && (
        <Typography
          variant="body2"
          sx={{
            color: alpha('#fff', 0.7),
            pl: icon ? 4 : 0, // Align with title if icon present
            mb: 2
          }}
        >
          {subtitle}
        </Typography>
      )}

      {withDivider && (
        <Divider sx={{
          borderColor: alpha(spacePalette.primary.main, 0.2)
        }} />
      )}
    </Box>
  );
};

export default MissionHeading;