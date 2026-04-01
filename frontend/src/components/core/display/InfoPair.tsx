// src/components/core/display/InfoPair.tsx
import type { ReactNode } from 'react';
import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { useThemeMode } from '../../styles/theme';
import { useBrandingPack } from '../../../branding/useBrandingPack';

interface InfoPairProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}

const InfoPair: React.FC<InfoPairProps> = ({ label, value, icon }) => {
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';

  return (
    <Box sx={{ display: 'flex', mb: 1.5, alignItems: 'flex-start' }}>
      {icon &&
        React.isValidElement<{ sx?: object }>(icon) &&
        React.cloneElement(icon, {
          sx: {
            ...(icon.props.sx ?? {}),
            mr: 1,
            color: isCircusMode ? '#d8b87a' : '#64b5f6',
            fontSize: '1.2rem',
            mt: 0.3,
            flexShrink: 0,
          },
        })}
      <Box>
        <Typography
          variant="body2"
          sx={{
            color: isCircusMode ? alpha('#e5cf9f', 0.95) : alpha('#fff', 0.7),
            mb: 0.5,
            fontFamily: isCircusMode ? brandingPack.typography.body : undefined,
          }}
        >
          {label}:
        </Typography>
        {typeof value === 'string' ? (
          <Typography
            variant="body1"
            sx={{
              color: isCircusMode ? '#f4ead6' : alpha('#fff', 0.9),
              fontWeight: 'medium',
              wordBreak: 'break-word',
              fontFamily: isCircusMode ? brandingPack.typography.body : undefined,
            }}
          >
            {value || 'Nicht angegeben'}
          </Typography>
        ) : (
          value
        )}
      </Box>
    </Box>
  );
};

export default InfoPair;
