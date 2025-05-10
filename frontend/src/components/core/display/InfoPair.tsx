// src/components/core/display/InfoPair.tsx
import React, { ReactNode } from 'react';
import { Box, Typography, alpha } from '@mui/material';

interface InfoPairProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}

const InfoPair: React.FC<InfoPairProps> = ({ label, value, icon }) => {
  return (
    <Box sx={{ display: 'flex', mb: 1.5, alignItems: 'flex-start' }}>
      {icon && React.cloneElement(icon as React.ReactElement, {
        sx: {
          mr: 1,
          color: '#64b5f6',
          fontSize: '1.2rem',
          mt: 0.3,
          flexShrink: 0
        }
      })}
      <Box>
        <Typography
          variant="body2"
          sx={{
            color: alpha('#fff', 0.7),
            mb: 0.5
          }}
        >
          {label}:
        </Typography>
        {typeof value === 'string' ? (
          <Typography
            variant="body1"
            sx={{
              color: alpha('#fff', 0.9),
              fontWeight: 'medium'
            }}
          >
            {value || "Nicht angegeben"}
          </Typography>
        ) : (
          value
        )}
      </Box>
    </Box>
  );
};

export default InfoPair;