// src/components/core/layouts/SpacePanelLayout.tsx
import React, { ReactNode } from 'react';
import { Box, Typography, Paper, alpha } from '@mui/material';
import {mixins, spacePalette} from "../../styles/theme";


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
  maxWidth = 600,
}) => {
  return (
    <Box sx={{ width: '100%', maxWidth }}>
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          borderRadius: '14px',
          background: spacePalette.background.card,
          boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid',
          borderColor: alpha(spacePalette.primary.main, 0.2),
        }}
      >
        {/* Decorative top gradient */}
        <Box sx={{
          ...mixins.headerGradient,
          '@keyframes gradientMove': {
            '0%': { backgroundPosition: '0% 0%' },
            '100%': { backgroundPosition: '300% 0%' },
          }
        }} />

        {/* Mission Briefing (optional) */}
        {missionBriefing && (
          <Box sx={mixins.missionBriefing}>
            <Typography
              variant="body2"
              sx={{
                color: alpha('#fff', 0.9),
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              }}
            >
              <span style={{ color: spacePalette.primary.main }}>MISSION:</span> {missionBriefing}
            </Typography>
          </Box>
        )}

        {/* Title (optional) */}
        {title && (
          <Typography
            variant="h5"
            align="center"
            sx={{
              color: alpha('#fff', 0.9),
              fontWeight: 'medium',
              mt: 2,
              mb: 3,
            }}
          >
            {title}
          </Typography>
        )}

        {/* Main content */}
        <Box
            sx={{ p: { xs: 2, sm: 3 } }}
        >
          {children}
        </Box>

        {/* Footer ID */}
        <Box sx={mixins.footerBar}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              color: alpha('#fff', 0.7),
              letterSpacing: '1px',
              fontSize: '0.7rem'
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