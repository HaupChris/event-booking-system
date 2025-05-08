// src/components/core/display/FormCard.tsx
import React, { ReactNode } from 'react';
import { Paper, Box, Typography, Divider, alpha } from '@mui/material';
import { spacePalette } from '../../styles/theme';

interface FormCardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  selected?: boolean;
  elevation?: number;
}

const FormCard: React.FC<FormCardProps> = ({
  title,
  icon,
  children,
  description,
  footer,
  selected = false,
  elevation = 2,
}) => {
  return (
    <Paper
      elevation={elevation}
      sx={{
        // mb: 2,
        backgroundColor: alpha('#020c1b', 0.7),
        borderRadius: '10px',
        border: selected ? '2px solid' : '1px solid',
        borderColor: selected ? spacePalette.primary.main : alpha(spacePalette.primary.main, 0.3),
        position: 'relative',
        overflow: 'hidden',
        boxShadow: selected
          ? `0 0 12px ${alpha(spacePalette.primary.main, 0.3)}`
          : 'none',
      }}
    >
      {/* Optional scanning animation for selected items */}
      {selected && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          zIndex: 1,
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '2px',
            background: `linear-gradient(to right, transparent, ${spacePalette.primary.main}, transparent)`,
            top: 0,
            animation: 'scanDown 2s infinite',
          },
          '@keyframes scanDown': {
            '0%': { transform: 'translateY(0)' },
            '100%': { transform: 'translateY(100%)' }
          }
        }} />
      )}

      {/* Card Header */}
      {(title || icon) && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          pb: description ? 1 : 2,
          position: 'relative',
          zIndex: 2,
        }}>
          {icon && (
            <Box sx={{
              mr: 1.5,
              color: spacePalette.primary.main,
              display: 'flex',
              alignItems: 'center',
            }}>
              {icon}
            </Box>
          )}
          {title && (
            <Typography
              variant="h6"
              sx={{
                color: alpha('#fff', 0.9),
                fontWeight: 'medium',
              }}
            >
              {title}
            </Typography>
          )}
        </Box>
      )}

      {/* Description (optional) */}
      {description && (
        <Box sx={{ px: 2, pb: 2, position: 'relative', zIndex: 2 }}>
          <Typography
            variant="body2"
            sx={{
              color: alpha('#fff', 0.7),
              pl: icon ? 5 : 0, // Align with title
            }}
          >
            {description}
          </Typography>
        </Box>
      )}

      {/* Divider if header exists */}
      {(title || icon || description) && (
        <Divider sx={{
          borderColor: alpha(spacePalette.primary.main, 0.2),
          position: 'relative',
          zIndex: 2,
        }} />
      )}

      {/* Main Content */}
      <Box sx={{
        position: 'relative',
        zIndex: 2,
      }}>
        {children}
      </Box>

      {/* Footer (optional) */}
      {footer && (
        <>
          <Divider sx={{
            borderColor: alpha(spacePalette.primary.main, 0.2),
            position: 'relative',
            zIndex: 2,
          }} />
          <Box sx={{
            p: 2,
            position: 'relative',
            zIndex: 2,
            backgroundColor: alpha('#010a18', 0.5),
          }}>
            {footer}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default FormCard;