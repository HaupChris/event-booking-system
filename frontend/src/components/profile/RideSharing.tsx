/**
 * Ride Sharing (Mitfahrbörse)
 * ============================
 * Component for ride sharing coordination
 */

import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const RideSharing: React.FC = () => {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <DirectionsCarIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Mitfahrbörse
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Finde Mitfahrgelegenheiten zum Festival
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Die Mitfahrbörse befindet sich noch in Entwicklung.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Hier kannst du bald nach Mitfahrgelegenheiten suchen oder selbst eine anbieten.
          </Typography>
        </Alert>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Geplante Features:</strong>
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" color="text.secondary">
                Fahrten anbieten oder suchen
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Abfahrtsort und Zielort angeben
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Verfügbare Plätze verwalten
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Kontakt mit anderen Teilnehmern
              </Typography>
            </li>
          </ul>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RideSharing;
