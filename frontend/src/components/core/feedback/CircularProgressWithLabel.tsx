import React from 'react';
import { Box, CircularProgress, Typography, alpha, useTheme } from '@mui/material';
import { useThemeMode } from '../../styles/theme';

interface CircularProgressWithLabelProps {
  valueCurrent: number;
  valueMax: number;
}

const CircularProgressWithLabel: React.FC<CircularProgressWithLabelProps> = ({
  valueCurrent,
  valueMax,
}) => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';
  const frac = valueCurrent / valueMax > 1.0 ? 1.0 : valueCurrent / valueMax;
  const progressIsFull = frac >= 1.0;

  // Dynamic color based on fill level
  const getProgressColor = () => {
    if (progressIsFull) {
      return isCircusMode ? '#e57373' : theme.palette.error.main;
    }
    if (frac > 0.7) {
      return isCircusMode ? '#d8b87a' : theme.palette.warning.main;
    }
    return isCircusMode ? '#9ccc65' : theme.palette.success.main;
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={frac * 100}
        thickness={4}
        size={46}
        sx={{
          color: getProgressColor(),
          backgroundColor: isCircusMode ? alpha('#2a120f', 0.6) : alpha('#000', 0.3),
          borderRadius: '50%',
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{
            color: isCircusMode ? '#f4ead6' : alpha('#fff', 0.9),
            fontWeight: 'medium',
            fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
          }}
        >
          {`${valueCurrent}/${valueMax}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default CircularProgressWithLabel;
