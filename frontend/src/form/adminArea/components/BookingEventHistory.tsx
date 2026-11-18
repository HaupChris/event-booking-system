import React, { useEffect, useState } from 'react';
import { Box, Chip, List, ListItem, ListItemText, Tooltip, Typography } from '@mui/material';
import axios from 'axios';

type BookingEvent = {
  id: number;
  event: string;
  details: Record<string, unknown>;
  created_at: string;
};

type BookingEventsResponse = {
  booking_ref: string;
  events: BookingEvent[];
};

export const EVENT_LABELS: Record<string, string> = {
  booking_created: 'Booking created',
  confirmation_mail_sent: 'Confirmation mail sent',
  confirmation_mail_failed: 'Confirmation mail failed',
  booking_updated_by_admin: 'Edited by admin',
  payment_updated: 'Payment updated',
  shift_accepted: 'Shift accepted',
  shift_declined: 'Shift declined',
  profile_link_requested: 'Profile link requested',
  profile_link_sent: 'Profile link sent',
  profile_link_send_failed: 'Profile link could not be sent',
  custom_mail_sent: 'Custom mail sent',
  custom_mail_failed: 'Custom mail failed',
};

const formatDetails = (details: Record<string, unknown>): string =>
  Object.entries(details)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(', ');

const formatTime = (isoTimestamp: string): string =>
  new Date(isoTimestamp).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });

interface BookingEventHistoryProps {
  bookingType: 'regular' | 'artist';
  bookingId: number;
  token: string;
}

/** Event history of a booking and its pseudonym for searching the logs (docs/LOGGING.md). */
const BookingEventHistory: React.FC<BookingEventHistoryProps> = ({
  bookingType,
  bookingId,
  token,
}) => {
  const [history, setHistory] = useState<BookingEventsResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    axios
      .get<BookingEventsResponse>(`/api/admin/bookings/${bookingType}/${bookingId}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (!cancelled) setHistory(response.data);
      })
      .catch(() => {
        if (!cancelled) setError('History could not be loaded.');
      });
    return () => {
      cancelled = true;
    };
  }, [bookingType, bookingId, token]);

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }
  if (!history) {
    return null;
  }

  const newestFirst = [...history.events].reverse();

  return (
    <Box mt={3}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Typography variant="subtitle1">History</Typography>
        <Tooltip title="Reference for searching the logs">
          <Chip label={history.booking_ref} size="small" variant="outlined" />
        </Tooltip>
      </Box>
      {newestFirst.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No events recorded yet.
        </Typography>
      ) : (
        <List dense disablePadding>
          {newestFirst.map((event) => (
            <ListItem key={event.id} disableGutters>
              <ListItemText
                primary={EVENT_LABELS[event.event] ?? event.event}
                secondary={[formatTime(event.created_at), formatDetails(event.details)]
                  .filter(Boolean)
                  .join(' · ')}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default BookingEventHistory;
