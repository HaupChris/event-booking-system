// src/form/adminArea/TicketsPage.tsx

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import { useFetchData } from './useFetchData';
import FormCard from '../../components/core/display/FormCard';
import OptionsGrid from './components/OptionsGrid';
import FilterControls from './components/FilterControls';
import { ViewFilterType } from './utils/optionsUtils';
import { CombinedBooking } from './interface';

const TicketsPage: React.FC = () => {
  const {
    bookings, regularBookings, artistBookings,
    formContent, artistFormContent
  } = useFetchData();

  // View filter state
  const [viewType, setViewType] = useState<ViewFilterType>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Convert to proper type
  const regularBookingsWithType: CombinedBooking[] = regularBookings.map(b => ({
    ...b,
    bookingType: 'regular' as const
  }));

  const artistBookingsWithType: CombinedBooking[] = artistBookings.map(b => ({
    ...b,
    bookingType: 'artist' as const
  }));

  // Calculate ticket counts and stats
  const getTicketOptions = () => {
    const regularOptions = viewType === 'all' || viewType === 'regular'
      ? formContent.ticket_options.map(ticket => {
          const count = regularBookingsWithType.filter(b => b.ticket_id === ticket.id).length;
          return {
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            count,
            isArtist: false
          };
        })
      : [];

    const artistOptions = viewType === 'all' || viewType === 'artist'
      ? artistFormContent.ticket_options.map(ticket => {
          const count = artistBookingsWithType.filter(b => b.ticket_id === ticket.id).length;
          return {
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            count,
            isArtist: true
          };
        })
      : [];

    return [...regularOptions, ...artistOptions];
  };

  const ticketOptions = getTicketOptions();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Tickets Overview
      </Typography>

      {/* Filter Controls */}
      <FilterControls
        viewType={viewType}
        setViewType={setViewType}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
      />

      {/* Tickets Grid */}
      <FormCard>
        <Box sx={{ p: 2 }}>
          <OptionsGrid
            options={ticketOptions}
            bookings={bookings}
            optionType="ticket"
            icon={<LocalActivityIcon />}
          />
        </Box>
      </FormCard>
    </Box>
  );
};

export default TicketsPage;