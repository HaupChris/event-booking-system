import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useFetchData } from './useFetchData';
import FilterControls from './components/FilterControls';
import type { ViewFilterType } from './utils/optionsUtils';
import FinancialSummaryCards from './components/FinancialSummaryCards';
import FinancialDetailTables from './components/FinancialDetailTables';
import { getAdminTitle } from './utils/titleUtils';

const FinancialsOverviewPage: React.FC = () => {
  const { bookings, formContent, artistFormContent } = useFetchData();
  const [viewType, setViewType] = useState<ViewFilterType>('all');
  const [viewTypeAnchorEl, setViewTypeAnchorEl] = useState<null | HTMLElement>(null);

  const getFilteredBookings = () => {
    if (viewType === 'all') return bookings;
    return bookings.filter((booking) => booking.bookingType === viewType);
  };

  const calculateTotalsByCategory = () => {
    const filteredBookings = getFilteredBookings();

    const ticketTotals: { [key: string]: { count: number; total: number; isArtist: boolean } } = {};
    const beverageTotals: { [key: string]: { count: number; total: number; isArtist: boolean } } =
      {};
    const foodTotals: { [key: string]: { count: number; total: number; isArtist: boolean } } = {};

    let grandTotal = 0;
    let artistCount = 0;
    let regularCount = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let paidAmount = 0;
    let expectedAmount = 0;

    filteredBookings.forEach((booking) => {
      if (booking.bookingType === 'artist') {
        artistCount++;
      } else {
        regularCount++;
      }

      if (booking.is_paid) {
        paidCount++;
        paidAmount += booking.paid_amount || 0;
      } else {
        unpaidCount++;
      }
      expectedAmount += booking.total_price;

      const content = booking.bookingType === 'artist' ? artistFormContent : formContent;

      const ticket = content.ticket_options.find((t) => t.id === booking.ticket_id);
      if (ticket) {
        const key = `${booking.bookingType}-${getAdminTitle(ticket)}`;
        if (!ticketTotals[key]) {
          ticketTotals[key] = { count: 0, total: 0, isArtist: booking.bookingType === 'artist' };
        }
        ticketTotals[key].count += 1;
        ticketTotals[key].total += ticket.price;
      }

      const beverage = content.beverage_options.find((b) => b.id === booking.beverage_id);
      if (beverage && booking.beverage_id !== -1) {
        const key = `${booking.bookingType}-${getAdminTitle(beverage)}`;
        if (!beverageTotals[key]) {
          beverageTotals[key] = {
            count: 0,
            total: 0,
            isArtist: booking.bookingType === 'artist',
          };
        }
        beverageTotals[key].count += 1;
        beverageTotals[key].total += beverage.price;
      }

      const food = content.food_options.find((f) => f.id === booking.food_id);
      if (food && booking.food_id !== -1) {
        const key = `${booking.bookingType}-${getAdminTitle(food)}-${food.description}`;
        if (!foodTotals[key]) {
          foodTotals[key] = { count: 0, total: 0, isArtist: booking.bookingType === 'artist' };
        }

        let finalPrice = food.price;
        if (booking.bookingType === 'regular' && booking.amount_shifts! > 1) {
          const discount = (booking.amount_shifts! - 1) * 5.5;
          finalPrice = Math.max(0, food.price - discount);
        }

        foodTotals[key].count += 1;
        foodTotals[key].total += finalPrice;
      }
    });

    grandTotal = filteredBookings.reduce((sum, booking) => sum + booking.total_price, 0);

    return {
      ticketTotals,
      beverageTotals,
      foodTotals,
      grandTotal,
      artistCount,
      regularCount,
      paidCount,
      unpaidCount,
      paidAmount,
      expectedAmount,
      allCount: filteredBookings.length,
    };
  };

  const {
    ticketTotals,
    beverageTotals,
    foodTotals,
    grandTotal,
    artistCount,
    regularCount,
    paidCount,
    paidAmount,
    expectedAmount,
    allCount,
  } = calculateTotalsByCategory();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Financial Overview
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FilterControls
          viewType={viewType}
          setViewType={setViewType}
          anchorEl={viewTypeAnchorEl}
          setAnchorEl={setViewTypeAnchorEl}
        />
      </Box>

      <FinancialSummaryCards
        ticketTotals={ticketTotals}
        beverageTotals={beverageTotals}
        foodTotals={foodTotals}
        paidAmount={paidAmount}
        expectedAmount={expectedAmount}
        paidCount={paidCount}
        artistCount={artistCount}
        regularCount={regularCount}
        allCount={allCount}
        grandTotal={grandTotal}
      />

      <FinancialDetailTables
        ticketTotals={ticketTotals}
        beverageTotals={beverageTotals}
        foodTotals={foodTotals}
        grandTotal={grandTotal}
        viewType={viewType}
      />
    </Box>
  );
};

export default FinancialsOverviewPage;
