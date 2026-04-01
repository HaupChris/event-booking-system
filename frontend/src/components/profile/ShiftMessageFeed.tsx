import React, { useMemo } from 'react';
import { alpha, Alert, Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { ShiftMessage } from '../../services/profileService';
import MarkdownContent from '../core/display/MarkdownContent';
import MissionHeading from '../core/display/MissionHeading';
import MessageIcon from '@mui/icons-material/Message';
import { useThemeMode } from '../styles/theme';
import { useBrandingPack } from '../../branding/useBrandingPack';

interface ShiftMessageFeedProps {
  shiftMessages: ShiftMessage[];
}

const formatTime = (value: string) => value?.slice(0, 5);

const cardContentSx = { p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } };

function ShiftMessageFeed({ shiftMessages }: ShiftMessageFeedProps) {
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';
  const sortedMessages = useMemo(
    () =>
      [...shiftMessages].sort(
        (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      ),
    [shiftMessages]
  );

  return (
    <Box sx={{ mb: 3 }}>
      <MissionHeading
        title="Nachrichten zu deinen Schichten"
        subtitle="Hinweise vom Team zu Einsaetzen und Zeitfenstern"
        icon={<MessageIcon />}
      />
      {sortedMessages.length === 0 && (
        <Alert severity="info">Es gibt aktuell keine Nachrichten zu deinen Schichten.</Alert>
      )}

      {sortedMessages.length > 0 && (
        <Stack spacing={2}>
          {sortedMessages.map((message) => (
            <Card
              key={message.id}
              variant="outlined"
              sx={{
                borderRadius: isCircusMode ? '12px' : 2,
                borderLeft: '4px solid',
                borderLeftColor: isCircusMode ? '#d8b87a' : 'primary.main',
                backgroundColor: isCircusMode ? 'rgba(28, 12, 12, 0.72)' : undefined,
                borderColor: isCircusMode ? alpha('#cda163', 0.5) : undefined,
              }}
            >
              <CardContent sx={cardContentSx}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 2,
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: isCircusMode ? brandingPack.typography.heading : undefined }}
                  >
                    {message.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: isCircusMode ? brandingPack.typography.body : undefined }}
                  >
                    {new Date(message.created_date).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {message.category && (
                    <Chip
                      label={message.category}
                      size="small"
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
                  )}
                  <Chip
                    label={message.workshift_title}
                    size="small"
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
                  <Chip
                    label={message.timeslot_title}
                    size="small"
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
                  <Chip
                    label={`${formatTime(message.timeslot_start)} - ${formatTime(message.timeslot_end)} Uhr`}
                    size="small"
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
                </Box>
                <MarkdownContent content={message.content} />
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default ShiftMessageFeed;
