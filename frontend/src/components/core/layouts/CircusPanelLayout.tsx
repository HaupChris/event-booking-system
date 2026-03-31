import type { ReactNode } from 'react';
import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { useBrandingPack } from '../../../branding/useBrandingPack';

interface CircusPanelLayoutProps {
  children: ReactNode;
  title?: string;
  missionBriefing?: string;
  footerId?: string;
  maxWidth?: string | number;
}

const CircusPanelLayout: React.FC<CircusPanelLayoutProps> = ({
  children,
  title,
  missionBriefing,
  footerId = 'ZIRKUS-WIESENWAHN',
  maxWidth = 1200,
}) => {
  const theme = useTheme();
  const brandingPack = useBrandingPack();

  return (
    <Box sx={{ width: '100%', maxWidth, px: { xs: 1, sm: 2, md: 0 } }}>
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          borderRadius: { xs: '8px', sm: brandingPack.decoration.panelRadius },
          background: brandingPack.colors.panelBackground,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          overflow: 'visible',
          position: 'relative',
          border: '2px solid',
          borderColor: brandingPack.colors.panelBorder,
          '&::before': {
            content: `"${brandingPack.decoration.cornerGlyph}"`,
            position: 'absolute',
            top: { xs: -6, sm: -8 },
            left: { xs: 8, sm: 10 },
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            color: theme.palette.primary.main,
            opacity: 0.8,
            zIndex: 1,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          },
          '&::after': {
            content: `"${brandingPack.decoration.cornerGlyph}"`,
            position: 'absolute',
            bottom: { xs: -6, sm: -8 },
            right: { xs: 8, sm: 10 },
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            color: theme.palette.primary.main,
            opacity: 0.8,
            zIndex: 1,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            transform: 'rotate(180deg)',
          },
        }}
      >
        {/* Mission Briefing / Ribbon Banner (optional) */}
        {missionBriefing && (
          <Box
            sx={{
              background: brandingPack.colors.ribbonBackground,
              padding: { xs: '10px 16px', sm: '12px 24px' },
              position: 'relative',
              mx: { xs: 1, sm: 2 },
              my: 2,
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              border: '1px solid',
              borderColor: brandingPack.colors.panelBorder,
              clipPath:
                'polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%)',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: brandingPack.colors.ribbonText,
                fontFamily: brandingPack.typography.body,
                fontSize: '0.95rem',
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              <span
                style={{
                  color: brandingPack.colors.heroText,
                  fontWeight: 'bold',
                  letterSpacing: '0.1em',
                }}
              >
                ★
              </span>{' '}
              {missionBriefing}{' '}
              <span
                style={{
                  color: brandingPack.colors.heroText,
                  fontWeight: 'bold',
                  letterSpacing: '0.1em',
                }}
              >
                ★
              </span>
            </Typography>
          </Box>
        )}

        {/* Title (optional) */}
        {title && (
          <Typography
            variant="h5"
            align="center"
            sx={{
              color: theme.palette.primary.main,
              fontFamily: brandingPack.typography.display,
              fontWeight: 700,
              mt: missionBriefing ? 1 : 3,
              mb: 3,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textShadow: `2px 2px 4px rgba(0,0,0,0.5)`,
            }}
          >
            {title}
          </Typography>
        )}

        {/* Main content */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>

        {/* Footer ID with vintage styling */}
        <Box
          sx={{
            p: 1.5,
            backgroundColor: 'rgba(112, 66, 20, 0.3)',
            borderTop: '2px solid',
            borderColor: theme.palette.primary.dark,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontFamily: brandingPack.typography.accent,
              color: theme.palette.text.secondary,
              letterSpacing: '2px',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
            }}
          >
            ◆ {footerId} ◆
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default CircusPanelLayout;
