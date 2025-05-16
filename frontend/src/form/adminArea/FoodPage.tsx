// src/form/adminArea/FoodPage.tsx

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useFetchData } from './useFetchData';
import FormCard from '../../components/core/display/FormCard';
import OptionsGrid from './components/OptionsGrid';
import FilterControls from './components/FilterControls';
import { ViewFilterType } from './utils/optionsUtils';
import { CombinedBooking } from './interface';

const FoodPage: React.FC = () => {
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

  // Calculate food counts and stats
  const getFoodOptions = () => {
    const regularOptions = viewType === 'all' || viewType === 'regular'
      ? formContent.food_options.map(food => {
          const count = regularBookingsWithType.filter(b => b.food_id === food.id).length;
          return {
            id: food.id,
            title: food.title,
            price: food.price,
            description: food.description,
            count,
            isArtist: false
          };
        })
      : [];

    const artistOptions = viewType === 'all' || viewType === 'artist'
      ? artistFormContent.food_options.map(food => {
          const count = artistBookingsWithType.filter(b => b.food_id === food.id).length;
          return {
            id: food.id,
            title: food.title,
            price: food.price,
            description: food.description,
            count,
            isArtist: true
          };
        })
      : [];

    return [...regularOptions, ...artistOptions];
  };

  const foodOptions = getFoodOptions();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Food Options Overview
      </Typography>

      {/* Filter Controls */}
      <FilterControls
        viewType={viewType}
        setViewType={setViewType}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
      />

      {/* Food Grid */}
      <FormCard>
        <Box sx={{ p: 2 }}>
          <OptionsGrid
            options={foodOptions}
            bookings={bookings}
            optionType="food"
            icon={<RestaurantIcon />}
          />
        </Box>
      </FormCard>
    </Box>
  );
};

export default FoodPage;