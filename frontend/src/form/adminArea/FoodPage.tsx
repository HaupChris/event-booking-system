// src/form/adminArea/FoodPage.tsx

import React from 'react';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import GenericOptionsPage from './components/GenericOptionsPage';

const FoodPage: React.FC = () => {
  return (
    <GenericOptionsPage
      config={{
        title: 'Food Options Overview',
        optionType: 'food',
        icon: <RestaurantIcon />,
        getRegularOptions: (formContent) => formContent.food_options,
        getArtistOptions: (artistFormContent) => artistFormContent.food_options,
        bookingFieldName: 'food_id',
      }}
    />
  );
};

export default FoodPage;
