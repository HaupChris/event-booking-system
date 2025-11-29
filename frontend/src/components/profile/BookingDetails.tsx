/**
 * Booking Details
 * ===============
 * Detailed view of booking information including materials and professions
 */

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { ProfileData } from '../../services/profileService';

interface BookingDetailsProps {
  profile: ProfileData;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ profile }) => {
  const { booking, materials, professions } = profile;

  return (
    <Box sx={{ p: 2 }}>
      {/* Work Shift Priorities (for regular users) */}
      {booking.work_shift_priorities && booking.work_shift_priorities.length > 0 && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Schicht-Prioritäten
            </Typography>
            <List>
              {booking.work_shift_priorities.map((priority) => (
                <ListItem key={priority.priority}>
                  <ListItemText
                    primary={`Priorität ${priority.priority}: ${priority.timeslot_title}`}
                    secondary={`Zeitfenster ID: ${priority.timeslot_id}`}
                  />
                </ListItem>
              ))}
            </List>
            {booking.supporter_buddy && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Support-Buddy:
                </Typography>
                <Typography variant="body1">{booking.supporter_buddy}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Artist-specific details */}
      {booking.equipment && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Technische Anforderungen
            </Typography>
            <Typography variant="body1">{booking.equipment}</Typography>
          </CardContent>
        </Card>
      )}

      {booking.special_requests && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Besondere Anfragen
            </Typography>
            <Typography variant="body1">{booking.special_requests}</Typography>
          </CardContent>
        </Card>
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Materialien
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Du hast angeboten, folgende Materialien mitzubringen:
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {materials.map((material) => (
                <Chip
                  key={material.id}
                  label={`${material.title} (${material.num_needed} benötigt)`}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Professions */}
      {professions.length > 0 && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Fähigkeiten / Professionen
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {professions.map((profession) => (
                <Chip
                  key={profession.id}
                  label={profession.title}
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Food & Beverage Details */}
      <Grid container spacing={2}>
        {booking.food && (
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Essen
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {booking.food.title}
                </Typography>
                {booking.food.description && (
                  <Typography variant="body2" color="text.secondary">
                    {booking.food.description}
                  </Typography>
                )}
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" color="primary">
                  {booking.food.price.toFixed(2)} €
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {booking.beverage && (
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Getränke
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {booking.beverage.title}
                </Typography>
                {booking.beverage.description && (
                  <Typography variant="body2" color="text.secondary">
                    {booking.beverage.description}
                  </Typography>
                )}
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" color="primary">
                  {booking.beverage.price.toFixed(2)} €
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default BookingDetails;
