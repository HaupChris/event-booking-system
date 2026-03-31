import type { ReactNode } from 'react';
import React from 'react';
import { Box, Typography, Paper, alpha, useTheme } from '@mui/material';
import { getMixins, useThemeMode } from '../../styles/theme';
import { useBrandingPack } from '../../../branding/useBrandingPack';

interface SpacePanelLayoutProps {
  children: ReactNode;
  title?: string;
  missionBriefing?: string;
  footerId?: string;
  maxWidth?: string | number;
}

const SpacePanelLayout: React.FC<SpacePanelLayoutProps> = ({
  children,
  title,
  missionBriefing,
  footerId = 'WWWW-COMPONENT',
  maxWidth = 1200,
}) => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const themedMixins = getMixins(mode);
  const brandingPack = useBrandingPack();

  return (
    <Box sx={{ width: '100%', maxWidth }}>
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          borderRadius: brandingPack.decoration.panelRadius,
          background: themedMixins.spacePanel.background,
          boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2),
        }}
      >
        {/* Decorative top gradient */}
        <Box
          sx={{
            ...themedMixins.headerGradient,
            '@keyframes gradientMove': {
              '0%': { backgroundPosition: '0% 0%' },
              '100%': { backgroundPosition: '300% 0%' },
            },
          }}
        />

        {/* Mission Briefing (optional) */}
        {missionBriefing && (
          <Box sx={themedMixins.missionBriefing}>
            <Typography
              variant="body2"
              sx={{
                color: alpha(theme.palette.text.primary, 0.9),
                fontFamily: brandingPack.typography.body,
                fontSize: '0.85rem',
              }}
            >
              <span style={{ color: theme.palette.primary.main }}>MISSION:</span> {missionBriefing}
            </Typography>
          </Box>
        )}

        {/* Title (optional) */}
        {title && (
          <Typography
            variant="h5"
            align="center"
            sx={{
              color: alpha(theme.palette.text.primary, 0.95),
              fontWeight: 'medium',
              mt: 2,
              mb: 3,
              fontFamily: brandingPack.typography.heading,
            }}
          >
            {title}
          </Typography>
        )}

        {/* Main content */}
        <Box sx={{ p: { xs: 1, sm: 3 } }}>{children}</Box>

        {/* Footer ID */}
        <Box sx={themedMixins.footerBar}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: brandingPack.typography.accent,
              color: alpha(theme.palette.text.primary, 0.72),
              letterSpacing: '1px',
              fontSize: '0.7rem',
            }}
          >
            {footerId}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default SpacePanelLayout;
