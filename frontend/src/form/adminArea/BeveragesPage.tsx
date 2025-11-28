// src/form/adminArea/BeveragesPage.tsx

import React from 'react';
import SportsBarIcon from '@mui/icons-material/SportsBar';
import GenericOptionsPage from './components/GenericOptionsPage';

const BeveragesPage: React.FC = () => {
  return (
    <GenericOptionsPage
      config={{
        title: 'Beverages Overview',
        optionType: 'beverage',
        icon: <SportsBarIcon />,
        getRegularOptions: (formContent) => formContent.beverage_options,
        getArtistOptions: (artistFormContent) => artistFormContent.beverage_options,
        bookingFieldName: 'beverage_id'
      }}
    />
  );
};

export default BeveragesPage;