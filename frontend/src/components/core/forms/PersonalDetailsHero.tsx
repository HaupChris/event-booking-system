import React from 'react';
import { Box, Button, Typography, alpha } from '@mui/material';
import { useBrandingPack } from '../../../branding/useBrandingPack';
import { useThemeMode } from '../../styles/theme';

interface PersonalDetailsHeroProps {
  subtitle: string;
  icon: React.ReactNode;
  showDevSeedButton: boolean;
  onDevSeedForm?: () => void;
}

const PersonalDetailsHero: React.FC<PersonalDetailsHeroProps> = ({
  subtitle,
  icon,
  showDevSeedButton,
  onDevSeedForm,
}) => {
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';

  return (
    <>
      <Box
        sx={{
          mb: 2.2,
          px: { xs: 0.6, sm: 1.2 },
        }}
      >
        <Box
          sx={{
            px: { xs: 1.5, sm: 2.5 },
            py: 0.85,
            border: '1px solid',
            borderColor: alpha('#d8b87a', 0.95),
            clipPath: 'polygon(3% 0, 97% 0, 100% 50%, 97% 100%, 3% 100%, 0 50%)',
            background: isCircusMode
              ? 'linear-gradient(180deg, rgba(100,62,33,0.96) 0%, rgba(66,38,20,0.97) 50%, rgba(43,24,15,0.97) 100%)'
              : brandingPack.colors.ribbonBackground,
            boxShadow: isCircusMode
              ? '0 6px 14px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(244,205,142,0.28)'
              : 'none',
          }}
        >
          <Typography
            sx={{
              textAlign: 'center',
              color: isCircusMode ? '#f4ead6' : brandingPack.colors.ribbonText,
              fontFamily: brandingPack.typography.body,
              fontStyle: 'italic',
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              letterSpacing: isCircusMode ? '0.01em' : undefined,
            }}
          >
            ★ Bitte gib deine Kontaktinformationen fuer die Festival-Registrierung ein. ★
          </Typography>
        </Box>

        <Box
          sx={{ mt: 1.2, display: 'flex', alignItems: 'center', gap: 1.2, px: { xs: 0.5, sm: 1 } }}
        >
          <Box
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              borderRadius: '50%',
              border: isCircusMode ? '2px solid' : 'none',
              borderColor: isCircusMode ? alpha('#dfbf84', 0.95) : undefined,
              background: isCircusMode
                ? 'radial-gradient(circle at 35% 30%, rgba(72,38,24,0.95) 0%, rgba(38,18,14,0.95) 100%)'
                : 'transparent',
              color: isCircusMode ? '#e6c586' : brandingPack.colors.sectionIcon,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isCircusMode
                ? '0 2px 6px rgba(0,0,0,0.32), inset 0 0 0 1px rgba(244,205,142,0.35)'
                : 'none',
              '& .MuiSvgIcon-root': { fontSize: { xs: '1.4rem', sm: '1.6rem' } },
            }}
          >
            {icon}
          </Box>
          <Typography
            sx={{
              color: '#e8d2ab',
              fontFamily: brandingPack.typography.display,
              fontSize: { xs: '1.2rem', sm: '1.55rem' },
              lineHeight: 1,
              textShadow: isCircusMode ? '0 2px 4px rgba(0,0,0,0.55)' : undefined,
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>

      {showDevSeedButton && (
        <Button
          variant={isCircusMode ? 'contained' : 'outlined'}
          color={isCircusMode ? 'primary' : 'secondary'}
          onClick={onDevSeedForm}
          sx={{
            mb: 3,
            width: '100%',
            textTransform: 'none',
            fontFamily: brandingPack.typography.accent,
            borderRadius: brandingPack.decoration.cardRadius,
            borderWidth: 2,
            boxShadow: isCircusMode ? '0 10px 20px rgba(0,0,0,0.35)' : 'none',
          }}
        >
          Dev: Formular automatisch fuellen
        </Button>
      )}
    </>
  );
};

export default PersonalDetailsHero;
