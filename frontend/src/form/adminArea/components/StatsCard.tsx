// src/form/adminArea/components/StatsCard.tsx

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { adminPalette } from '../theme/adminPalette';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  progress?: number;
  footer?: React.ReactNode;
  fullHeight?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  progress,
  footer,
  fullHeight = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get color based on the specified theme
  const getColor = () => {
    switch (color) {
      case 'success':
        return adminPalette.status.success;
      case 'warning':
        return adminPalette.status.warning;
      case 'error':
        return adminPalette.status.error;
      case 'info':
        return adminPalette.status.info;
      default:
        return adminPalette.primary.main;
    }
  };

  const mainColor = getColor();

  return (
    <Card
      sx={{
        height: fullHeight ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: alpha(mainColor, 0.06),
        border: `1px solid ${alpha(mainColor, 0.35)}`,
        borderRadius: 2,
      }}
    >
      <CardContent
        sx={{
          padding: 2,
          paddingBottom: footer ? 1 : 2,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: adminPalette.text.primary,
              fontSize: isMobile ? '1rem' : '1.125rem',
              fontWeight: 'medium',
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                color: mainColor,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        <Typography
          variant="h4"
          sx={{
            mt: 0.5,
            mb: subtitle ? 1 : 2,
            color: mainColor,
            fontWeight: 'bold',
            fontSize: isMobile ? '1.75rem' : '2.25rem',
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: adminPalette.text.secondary,
              mb: 2,
            }}
          >
            {subtitle}
          </Typography>
        )}

        {progress !== undefined && (
          <Box sx={{ width: '100%', mt: 'auto' }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(progress, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(mainColor, 0.15),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: mainColor,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'right',
                mt: 0.5,
                color: alpha(mainColor, 0.9),
              }}
            >
              {`${Math.round(progress)}%`}
            </Typography>
          </Box>
        )}
      </CardContent>

      {footer && (
        <Box
          sx={{
            borderTop: `1px solid ${alpha(mainColor, 0.2)}`,
            bgcolor: alpha(mainColor, 0.08),
            padding: 2,
          }}
        >
          {footer}
        </Box>
      )}
    </Card>
  );
};

export default StatsCard;
