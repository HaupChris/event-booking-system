import React from 'react';
import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material';
import type { ShiftMessage } from '../../services/profileService';
import MarkdownContent from '../core/display/MarkdownContent';

interface ShiftMessageFeedProps {
  shiftMessages: ShiftMessage[];
}

const formatTime = (value: string) => value?.slice(0, 5);

const cardContentSx = { p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } };

function ShiftMessageFeed({ shiftMessages }: ShiftMessageFeedProps) {
  if (shiftMessages.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" color={"text.primary"} sx={{ mb: 2 }}>
        Nachrichten zu deinen Schichten
      </Typography>
      <Grid container spacing={2}>
        {shiftMessages.map((message) => (
          <Grid key={message.id} size={12}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
              <CardContent sx={cardContentSx}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                  <Typography variant="h6">{message.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
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
                  {message.category && <Chip label={message.category} size="small" color="secondary" variant="outlined" />}
                  <Chip label={message.workshift_title} size="small" variant="outlined" />
                  <Chip label={message.timeslot_title} size="small" variant="outlined" />
                  <Chip label={`${formatTime(message.timeslot_start)} - ${formatTime(message.timeslot_end)} Uhr`} size="small" variant="outlined" />
                </Box>
                <MarkdownContent content={message.content} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ShiftMessageFeed;
