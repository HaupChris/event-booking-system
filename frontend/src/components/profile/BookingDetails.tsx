/**
 * Booking Details
 * ===============
 * Detailed view of booking information including materials and professions
 */

import React from 'react';
import {
  alpha,
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
import { useThemeMode } from '../styles/theme';
import { useBrandingPack } from '../../branding/useBrandingPack';

interface BookingDetailsProps {
  profile: ProfileData;
}

interface ArtistPerformanceDetails {
  preferredDay?: string;
  preferredTime?: string;
  duration?: string | number;
  genre?: string;
  description?: string;
  bandMembers?: string;
}

const parseArtistPerformanceDetails = (
  value?: string
): {
  details: ArtistPerformanceDetails;
  rawValue: string;
} => {
  if (!value) {
    return { details: {}, rawValue: '' };
  }

  try {
    const parsed = JSON.parse(value) as ArtistPerformanceDetails;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { details: parsed, rawValue: '' };
    }
  } catch {
    return { details: {}, rawValue: value };
  }

  return { details: {}, rawValue: value };
};

const getArtistPerformanceFields = (details: ArtistPerformanceDetails) => {
  const fields: Array<{ label: string; value: string }> = [];

  if (details.preferredDay) {
    fields.push({ label: 'Bevorzugter Spieltag', value: details.preferredDay });
  }
  if (details.preferredTime) {
    fields.push({ label: 'Bevorzugtes Zeitfenster', value: details.preferredTime });
  }
  if (details.duration) {
    fields.push({ label: 'Set-Dauer', value: `${details.duration} Minuten` });
  }
  if (details.genre) {
    fields.push({ label: 'Genre / Musikstil', value: details.genre });
  }
  if (details.description) {
    fields.push({ label: 'Act-Beschreibung', value: details.description });
  }
  if (details.bandMembers) {
    fields.push({ label: 'Bandmitglieder', value: String(details.bandMembers) });
  }

  return fields;
};

const BookingDetails: React.FC<BookingDetailsProps> = ({ profile }) => {
  const { booking, materials, professions, user } = profile;
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';
  const isArtist = user.is_artist;
  const headingSx = { fontFamily: isCircusMode ? brandingPack.typography.heading : undefined };
  const bodySx = { fontFamily: isCircusMode ? brandingPack.typography.body : undefined };
  const cardSx = isCircusMode
    ? {
        borderRadius: '12px',
        backgroundColor: 'rgba(28, 12, 12, 0.72)',
        borderColor: alpha('#cda163', 0.5),
        boxShadow: '0 8px 22px rgba(0,0,0,0.36)',
      }
    : { borderRadius: 2 };
  const cardContentSx = { p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } };
  const formatTime = (time?: string) => (time ? time.slice(0, 5) : '');
  const { details: performanceDetails, rawValue: rawPerformanceDetails } =
    parseArtistPerformanceDetails(booking.performance_details);
  const artistPerformanceFields = getArtistPerformanceFields(performanceDetails);
  const hasStructuredPerformanceDetails = artistPerformanceFields.length > 0;

  const hasArtistPerformanceDetails =
    isArtist && (hasStructuredPerformanceDetails || Boolean(rawPerformanceDetails));

  return (
    <Stack spacing={2}>
      {/* Work Shift Priorities (for regular users) */}
      {!isArtist && booking.work_shift_priorities && booking.work_shift_priorities.length > 0 && (
        <Card variant="outlined" sx={cardSx}>
          <CardContent sx={cardContentSx}>
            <Typography variant="h6" gutterBottom color="primary" sx={headingSx}>
              Schicht-Prioritäten
            </Typography>
            <List disablePadding>
              {booking.work_shift_priorities.map((priority) => (
                <ListItem key={priority.priority} sx={{ px: 0, py: 0.5 }}>
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
                    slotProps={{
                      primary: { sx: bodySx },
                      secondary: { sx: bodySx },
                    }}
                  />
                </ListItem>
              ))}
            </List>
            {booking.supporter_buddy && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: 'action.hover',
                  borderRadius: 1,
                  border: isCircusMode ? '1px solid' : 'none',
                  borderColor: isCircusMode ? alpha('#d8b87a', 0.35) : 'transparent',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Support-Buddy: {booking.supporter_buddy}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {hasArtistPerformanceDetails && (
        <Card variant="outlined" sx={cardSx}>
          <CardContent sx={cardContentSx}>
            <Typography variant="h6" gutterBottom color="primary" sx={headingSx}>
              Auftrittsdetails
            </Typography>

            {hasStructuredPerformanceDetails ? (
              <List disablePadding>
                {artistPerformanceFields.map((field) => (
                  <ListItem key={field.label} sx={{ px: 0, py: 0.5 }}>
                    <ListItemText
                      primary={field.label}
                      secondary={field.value}
                      slotProps={{
                        primary: { sx: bodySx },
                        secondary: { sx: bodySx },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={bodySx}>
                {rawPerformanceDetails}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Artist-specific details */}
      {booking.equipment && (
        <Card variant="outlined" sx={cardSx}>
          <CardContent sx={cardContentSx}>
            <Typography variant="h6" gutterBottom color="primary" sx={headingSx}>
              Technische Anforderungen
            </Typography>
            <Typography variant="body1" sx={bodySx}>
              {booking.equipment}
            </Typography>
          </CardContent>
        </Card>
      )}

      {booking.special_requests && (
        <Card variant="outlined" sx={cardSx}>
          <CardContent sx={cardContentSx}>
            <Typography variant="h6" gutterBottom color="primary" sx={headingSx}>
              Besondere Anfragen
            </Typography>
            <Typography variant="body1" sx={bodySx}>
              {booking.special_requests}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <Card variant="outlined" sx={cardSx}>
          <CardContent sx={cardContentSx}>
            <Typography variant="h6" gutterBottom color="primary" sx={headingSx}>
              Materialien
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={bodySx}>
              {isArtist
                ? 'Du hast angegeben, folgende Ausruestung mitzubringen:'
                : 'Du hast angeboten, folgende Materialien mitzubringen:'}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {materials.map((material) => (
                <Chip
                  key={material.id}
                  label={`${material.title} (${material.num_needed} benötigt)`}
                  color={isCircusMode ? 'default' : 'primary'}
                  variant="outlined"
                  sx={
                    isCircusMode
                      ? {
                          borderColor: alpha('#d8b87a', 0.5),
                          color: '#f4ead6',
                          fontFamily: brandingPack.typography.body,
                        }
                      : undefined
                  }
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
            <Typography variant="h6" gutterBottom color="primary" sx={headingSx}>
              Fähigkeiten / Professionen
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {professions.map((profession) => (
                <Chip
                  key={profession.id}
                  label={profession.title}
                  color={isCircusMode ? 'default' : 'secondary'}
                  variant="outlined"
                  sx={
                    isCircusMode
                      ? {
                          borderColor: alpha('#d8b87a', 0.5),
                          color: '#f4ead6',
                          fontFamily: brandingPack.typography.body,
                        }
                      : undefined
                  }
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
