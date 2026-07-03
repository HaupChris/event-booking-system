import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  alpha,
  Tooltip,
  Typography,
  Box,
  Checkbox,
} from '@mui/material';
import {
  MoreHoriz as MoreHorizIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import type { CombinedBooking } from '../interface';
import type { FormContent } from '../../userArea/interface';
import { adminPalette } from '../theme/adminPalette';
import { getTicketTitle } from '../utils/bookingUtils';
import type { ArtistFormContent } from '../../artistArea/interface';

interface ColumnVisibility {
  type: boolean;
  name: boolean;
  email: boolean;
  invitedBy: boolean;
  ticket: boolean;
  price: boolean;
  profileLink: boolean;
  actions: boolean;
}

interface BookingTableProps {
  bookings: CombinedBooking[];
  columnVisibility: ColumnVisibility;
  formContent: FormContent;
  artistFormContent: ArtistFormContent;
  onOpenDetails: (booking: CombinedBooking) => void;
  selectedBookingKeys: Set<string>;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  onToggleSelectAllVisible: () => void;
  onToggleSelectBooking: (booking: CombinedBooking) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  columnVisibility,
  formContent,
  artistFormContent,
  onOpenDetails,
  selectedBookingKeys,
  allVisibleSelected,
  someVisibleSelected,
  onToggleSelectAllVisible,
  onToggleSelectBooking,
}) => {
  const getBookingKey = (booking: CombinedBooking) => `${booking.bookingType}:${booking.id}`;

  const handleCopyLink = (profileUuid: string) => {
    const url = `${window.location.origin}/profile/${profileUuid}`;
    navigator.clipboard.writeText(url);
  };

  const handleViewProfile = (profileUuid: string) => {
    window.open(`/profile/${profileUuid}`, '_blank');
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
      <Table size="medium">
        <TableHead>
          <TableRow sx={{ bgcolor: alpha(adminPalette.primary.main, 0.1) }}>
            <TableCell padding="checkbox">
              <Checkbox
                checked={allVisibleSelected}
                indeterminate={someVisibleSelected}
                onChange={onToggleSelectAllVisible}
                inputProps={{ 'aria-label': 'Select all visible bookings' }}
              />
            </TableCell>
            {columnVisibility.type && <TableCell>Type</TableCell>}
            {columnVisibility.name && <TableCell>Name</TableCell>}
            {columnVisibility.email && <TableCell>Email</TableCell>}
            {columnVisibility.invitedBy && <TableCell>Invited By</TableCell>}
            {columnVisibility.ticket && <TableCell>Ticket</TableCell>}
            {columnVisibility.price && <TableCell>Price</TableCell>}
            {columnVisibility.profileLink && <TableCell>Profile Link</TableCell>}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow
              key={`${booking.bookingType}-${booking.id}`}
              sx={{
                bgcolor:
                  booking.bookingType === 'artist'
                    ? alpha(adminPalette.primary.main, 0.08)
                    : 'transparent',
                '&:hover': {
                  bgcolor: alpha(adminPalette.primary.main, 0.05),
                },
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedBookingKeys.has(getBookingKey(booking))}
                  onChange={() => onToggleSelectBooking(booking)}
                  inputProps={{
                    'aria-label': `Select ${booking.first_name} ${booking.last_name}`,
                  }}
                />
              </TableCell>
              {columnVisibility.type && (
                <TableCell>
                  {booking.bookingType === 'artist' ? (
                    <Chip label="Artist" color="primary" size="small" />
                  ) : (
                    <Chip label="Regular" size="small" />
                  )}
                </TableCell>
              )}
              {columnVisibility.name && (
                <TableCell>
                  {booking.first_name} {booking.last_name}
                </TableCell>
              )}
              {columnVisibility.email && <TableCell>{booking.email}</TableCell>}
              {columnVisibility.invitedBy && (
                <TableCell>{booking.invited_by_name || 'Nicht gesetzt'}</TableCell>
              )}
              {columnVisibility.ticket && (
                <TableCell>
                  {getTicketTitle(
                    booking.ticket_id,
                    booking.bookingType,
                    formContent,
                    artistFormContent
                  )}
                </TableCell>
              )}
              {columnVisibility.price && <TableCell>€{booking.total_price.toFixed(2)}</TableCell>}
              {columnVisibility.profileLink && (
                <TableCell>
                  {booking.profile_uuid ? (
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Tooltip title="Copy profile link">
                        <IconButton
                          size="small"
                          onClick={() => handleCopyLink(booking.profile_uuid!)}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View profile">
                        <IconButton
                          size="small"
                          onClick={() => handleViewProfile(booking.profile_uuid!)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', ml: 0.5 }}>
                        {booking.profile_uuid.substring(0, 8)}...
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No UUID
                    </Typography>
                  )}
                </TableCell>
              )}
              <TableCell>
                <IconButton
                  onClick={() => onOpenDetails(booking)}
                  size="small"
                  sx={{
                    color: adminPalette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(adminPalette.primary.main, 0.1),
                    },
                  }}
                >
                  <MoreHorizIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {bookings.length === 0 && (
            <TableRow>
              <TableCell colSpan={9}>
                <Typography variant="body2" color="text.secondary" align="center">
                  No bookings found.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BookingTable;
