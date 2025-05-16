import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Chip, alpha
} from '@mui/material';
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import { CombinedBooking } from "../interface";
import { FormContent } from "../../userArea/interface";
import { spacePalette } from '../../../components/styles/theme';
import { getTicketTitle } from '../utils/bookingUtils';
import {ArtistFormContent} from "../../artistArea/interface";

interface ColumnVisibility {
  type: boolean;
  name: boolean;
  email: boolean;
  ticket: boolean;
  price: boolean;
  actions: boolean;
}

interface BookingTableProps {
  bookings: CombinedBooking[];
  columnVisibility: ColumnVisibility;
  formContent: FormContent;
  artistFormContent: ArtistFormContent;
  onOpenDetails: (booking: CombinedBooking) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  columnVisibility,
  formContent,
  artistFormContent,
  onOpenDetails
}) => {
  return (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
      <Table size="medium">
        <TableHead>
          <TableRow sx={{ bgcolor: alpha(spacePalette.primary.main, 0.1) }}>
            {columnVisibility.type && <TableCell>Type</TableCell>}
            {columnVisibility.name && <TableCell>Name</TableCell>}
            {columnVisibility.email && <TableCell>Email</TableCell>}
            {columnVisibility.ticket && <TableCell>Ticket</TableCell>}
            {columnVisibility.price && <TableCell>Price</TableCell>}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow
              key={`${booking.bookingType}-${booking.id}`}
              sx={{
                bgcolor: booking.bookingType === 'artist'
                  ? alpha(spacePalette.primary.main, 0.08)
                  : 'transparent',
                '&:hover': {
                  bgcolor: alpha(spacePalette.primary.main, 0.05)
                }
              }}
            >
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
                <TableCell>{booking.first_name} {booking.last_name}</TableCell>
              )}
              {columnVisibility.email && (
                <TableCell>{booking.email}</TableCell>
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
              {columnVisibility.price && (
                <TableCell>€{booking.total_price.toFixed(2)}</TableCell>
              )}
              <TableCell>
                <IconButton
                  onClick={() => onOpenDetails(booking)}
                  size="small"
                  sx={{
                    color: spacePalette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(spacePalette.primary.main, 0.1)
                    }
                  }}
                >
                  <MoreHorizIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BookingTable;