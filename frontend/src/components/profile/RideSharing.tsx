/**
 * Ride Sharing (Mitfahrbörse)
 * ============================
 * Component for ride sharing coordination
 */

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FormCard from '../core/display/FormCard';
import MissionHeading from '../core/display/MissionHeading';
import { useThemeMode } from '../styles/theme';
import { useBrandingPack } from '../../branding/useBrandingPack';

const RideSharing: React.FC = () => {
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';

  return (
    <FormCard selected={true} sx={{ mt: 0 }}>
      <MissionHeading
        title="Mitfahrboerse"
        subtitle="Anreise und Rueckfahrt gemeinsam organisieren"
        icon={<DirectionsCarIcon />}
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Die Mitfahrboerse befindet sich noch in Entwicklung.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Hier kannst du bald nach Mitfahrgelegenheiten suchen oder selbst eine anbieten.
        </Typography>
      </Alert>

      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: 'action.hover',
          borderRadius: 1,
          fontFamily: isCircusMode ? brandingPack.typography.body : undefined,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          <strong>Geplante Features:</strong>
        </Typography>
        <Box component="ul" sx={{ m: 0, mt: 1, pl: 2.5 }}>
          <Box component="li" sx={{ mb: 0.4 }}>
            <Typography variant="body2" color="text.secondary">
              Fahrten anbieten oder suchen
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 0.4 }}>
            <Typography variant="body2" color="text.secondary">
              Abfahrtsort und Zielort angeben
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 0.4 }}>
            <Typography variant="body2" color="text.secondary">
              Verfuegbare Plaetze verwalten
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2" color="text.secondary">
              Kontakt mit anderen Teilnehmern
            </Typography>
          </Box>
        </Box>
      </Box>
    </FormCard>
  );
};

export default RideSharing;
