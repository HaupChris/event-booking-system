/**
 * Booking Details
 * ===============
 * Detailed view of booking information including materials and professions
 */

import React from 'react';
import {
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Box,
} from '@mui/material';
import type { ProfileData } from '../../services/profileService';

interface BookingDetailsProps {
  profile: ProfileData;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ profile }) => {
  const { booking, materials, professions } = profile;
  const cardSx = { borderRadius: 2 };
  const cardContentSx = { p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } };
  const formatTime = (time?: string) => (time ? time.slice(0, 5) : '');

  return (
    <Stack spacing={3}>
      {/* Work Shift Priorities (for regular users) */}
      {booking.work_shift_priorities && booking.work_shift_priorities.length > 0 && (
        <Card variant="outlined" sx={cardSx}>
          <CardContent sx={cardContentSx}>
            <Typography variant="h6" gutterBottom color="primary">
              Schicht-Prioritäten
            </Typography>
            <List disablePadding>
              {booking.work_shift_priorities.map((priority) => (
                <ListItem key={priority.priority} sx={{ px: 0 }}>
                  <ListItemText
                    primary={`Priorität ${priority.priority}: ${
                      priority.workshift_title
                        ? `${priority.workshift_title} - ${priority.timeslot_title}`
                        : priority.timeslot_title
                    }`}
                    secondary={
                      priority.timeslot_start_time && priority.timeslot_end_time
                        ? `${formatTime(priority.timeslot_start_time)} - ${formatTime(priority.timeslot_end_time)} Uhr`
                        : 'Zeitfenster wird geladen'
                    }
                  />
                </ListItem>
              ))}
            </List>
            {booking.supporter_buddy?.length !== 0 && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Support-Buddy: {booking.supporter_buddy}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Artist-specific details */}
      {booking.equipment && (
        <Card variant="outlined" sx={cardSx}>
          <CardContent sx={cardContentSx}>
            <Typography variant="h6" gutterBottom color="primary">
              Technische Anforderungen
            </Typography>
            <Typography variant="body1">{booking.equipment}</Typography>
          </CardContent>
        </Card>
      )}

      {booking.special_requests && (
        <Card variant="outlined" sx={cardSx}>
          <CardContent sx={cardContentSx}>
            <Typography variant="h6" gutterBottom color="primary">
              Besondere Anfragen
            </Typography>
            <Typography variant="body1">{booking.special_requests}</Typography>
          </CardContent>
        </Card>
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <Card variant="outlined" sx={cardSx}>
          <CardContent sx={cardContentSx}>
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
        <Card variant="outlined" sx={cardSx}>
          <CardContent sx={cardContentSx}>
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
    </Stack>
  );
};

export default BookingDetails;
