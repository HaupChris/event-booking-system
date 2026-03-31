// src/components/core/display/MissionHeading.tsx
import type { ReactNode } from 'react';
import React from 'react';
import { Box, Typography, Divider, alpha, useTheme } from '@mui/material';
import { useBrandingPack } from '../../../branding/useBrandingPack';
import { useThemeMode } from '../../styles/theme';

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
  const theme = useTheme();
  const brandingPack = useBrandingPack();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: subtitle ? 1 : 2,
        }}
      >
        {icon && (
          <Box
            sx={
              isCircusMode
                ? {
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: alpha('#dfbf84', 0.95),
                    background:
                      'radial-gradient(circle at 35% 30%, rgba(72,38,24,0.95) 0%, rgba(38,18,14,0.95) 100%)',
                    color: '#e6c586',
                    mr: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow:
                      '0 2px 6px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(244,205,142,0.35), inset 0 0 12px rgba(0,0,0,0.25)',
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1.08rem', sm: '1.16rem' },
                    },
                  }
                : { color: brandingPack.colors.sectionIcon, mr: 1, display: 'flex' }
            }
          >
            {icon}
          </Box>
        )}
        <Typography
          variant="h6"
          sx={{
            color: isCircusMode ? '#ead7b2' : alpha(theme.palette.text.primary, 0.95),
            fontWeight: 'medium',
            fontFamily: brandingPack.typography.heading,
          }}
        >
          {title}
        </Typography>
      </Box>

      {subtitle && (
        <Typography
          variant="body2"
          sx={{
            color: isCircusMode ? alpha('#e5cf9f', 0.95) : alpha(theme.palette.text.primary, 0.75),
            pl: icon ? (isCircusMode ? 5.2 : 4) : 0,
            mb: 2,
            fontFamily: brandingPack.typography.body,
          }}
        >
          {subtitle}
        </Typography>
      )}

      {withDivider && (
        <Divider
          sx={{
            borderColor: isCircusMode
              ? alpha('#d8b87a', 0.42)
              : alpha(theme.palette.primary.main, 0.25),
          }}
        />
      )}
    </Box>
  );
};

export default MissionHeading;
