// src/form/adminArea/BeveragesPage.tsx

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import SportsBarIcon from '@mui/icons-material/SportsBar';
import { useFetchData } from './useFetchData';
import FormCard from '../../components/core/display/FormCard';
import OptionsGrid from './components/OptionsGrid';
import FilterControls from './components/FilterControls';
import { ViewFilterType } from './utils/optionsUtils';
import { CombinedBooking } from './interface';

const BeveragesPage: React.FC = () => {
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

  // Calculate beverage counts and stats
  const getBeverageOptions = () => {
    const regularOptions = viewType === 'all' || viewType === 'regular'
      ? formContent.beverage_options.map(beverage => {
          const count = regularBookingsWithType.filter(b => b.beverage_id === beverage.id).length;
          return {
            id: beverage.id,
            title: beverage.title,
            price: beverage.price,
            description: beverage.description,
            count,
            isArtist: false
          };
        })
      : [];
    
    const artistOptions = viewType === 'all' || viewType === 'artist'
      ? artistFormContent.beverage_options.map(beverage => {
          const count = artistBookingsWithType.filter(b => b.beverage_id === beverage.id).length;
          return {
            id: beverage.id,
            title: beverage.title,
            price: beverage.price,
            description: beverage.description,
            count,
            isArtist: true
          };
        })
      : [];
    
    return [...regularOptions, ...artistOptions];
  };

  const beverageOptions = getBeverageOptions();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Beverages Overview
      </Typography>

      {/* Filter Controls */}
      <FilterControls
        viewType={viewType}
        setViewType={setViewType}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
      />

      {/* Beverages Grid */}
      <FormCard>
        <Box sx={{ p: 2 }}>
          <OptionsGrid
            options={beverageOptions}
            bookings={bookings}
            optionType="beverage"
            icon={<SportsBarIcon />}
          />
        </Box>
      </FormCard>
    </Box>
  );
};

export default BeveragesPage;