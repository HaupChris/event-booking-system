import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import BadgeIcon from '@mui/icons-material/Badge';
import { OrnateInput } from '../../../form/userArea/TestDesignFormPrimitives';
import { useBrandingPack } from '../../../branding/useBrandingPack';
import { useThemeMode } from '../../styles/theme';

type PersonalFieldKey = 'first_name' | 'last_name' | 'email' | 'phone';

interface PersonalDetailsContactCardProps {
  updateBooking: (key: PersonalFieldKey, value: string) => void;
  currentBooking: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  formValidation: { [key: string]: string | undefined };
}

const PersonalDetailsContactCard: React.FC<PersonalDetailsContactCardProps> = ({
  updateBooking,
  currentBooking,
  formValidation,
}) => {
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';

  const ornateContainerSx = isCircusMode
    ? {
        border: '2px solid',
        borderColor: alpha(brandingPack.colors.panelBorder, 0.95),
        borderRadius: '16px',
        backgroundColor: alpha('#1a0b12', 0.58),
        boxShadow: '0 10px 24px rgba(0,0,0,0.45)',
        px: { xs: 1.2, sm: 2 },
        py: { xs: 1.2, sm: 1.5 },
      }
    : {
        px: 0,
        py: 0,
      };

  const errorTextSx = {
    mt: -1.4,
    mb: 1.8,
    ml: 0.4,
    display: 'block',
    fontFamily: brandingPack.typography.body,
  };

  return (
    <Box component="form" sx={{ ...ornateContainerSx }}>
      <OrnateInput
        label="Vorname *"
        value={currentBooking.first_name}
        onChange={(e) => updateBooking('first_name', e.target.value)}
        icon={<PersonIcon fontSize="large" />}
        size="compact"
      />
      {formValidation.first_name ? (
        <Typography variant="caption" color="error" sx={errorTextSx}>
          {formValidation.first_name}
        </Typography>
      ) : null}

      <OrnateInput
        label="Nachname *"
        value={currentBooking.last_name}
        onChange={(e) => updateBooking('last_name', e.target.value)}
        icon={<BadgeIcon fontSize="large" />}
        size="compact"
      />
      {formValidation.last_name ? (
        <Typography variant="caption" color="error" sx={errorTextSx}>
          {formValidation.last_name}
        </Typography>
      ) : null}

      <OrnateInput
        label="E-Mail (fuer deine Bestaetigung) *"
        value={currentBooking.email}
        onChange={(e) => updateBooking('email', e.target.value)}
        icon={<AlternateEmailIcon fontSize="large" />}
        type="email"
        size="compact"
      />
      {formValidation.email ? (
        <Typography variant="caption" color="error" sx={errorTextSx}>
          {formValidation.email}
        </Typography>
      ) : null}

      <OrnateInput
        label="Telefon *"
        value={currentBooking.phone}
        onChange={(e) => updateBooking('phone', e.target.value)}
        icon={<SmartphoneIcon fontSize="large" />}
        type="tel"
        size="compact"
      />
      {formValidation.phone ? (
        <Typography variant="caption" color="error" sx={errorTextSx}>
          {formValidation.phone}
        </Typography>
      ) : null}
    </Box>
  );
};

export default PersonalDetailsContactCard;
