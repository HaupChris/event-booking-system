import React from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FormCard from '../../../components/core/display/FormCard';
import { userAreaTexts } from '../../constants/texts';
import PriceItem from './PriceItem';
import { useThemeMode } from '../../../components/styles/theme';

interface CateringItem {
  title: string;
  price: number;
}

interface SummaryCateringCardProps {
  beverage: CateringItem | undefined;
  food: CateringItem | undefined;
  discount: number;
}

function SummaryCateringCard({ beverage, food, discount }: SummaryCateringCardProps) {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';

  return (
    <FormCard
      title={userAreaTexts.summaryForm.catering}
      icon={<RestaurantIcon />}
      sx={
        isCircusMode
          ? {
              border: '2px solid',
              borderColor: alpha('#d8b87a', 0.85),
              backgroundColor: alpha('#1a0b12', 0.58),
              borderRadius: '14px',
            }
          : undefined
      }
    >
      {/* Beverage */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocalDrinkIcon
            sx={{
              mr: 1,
              color: isCircusMode ? '#d8b87a' : theme.palette.primary.main,
              fontSize: '1rem',
            }}
          />
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 'medium',
              color: isCircusMode ? '#f4ead6' : alpha(theme.palette.text.primary, 0.8),
              fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
            }}
          >
            {userAreaTexts.summaryForm.beverageTitle}
          </Typography>
        </Box>
        <PriceItem item={beverage} />
      </Box>

      {/* Food */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <RestaurantIcon
            sx={{
              mr: 1,
              color: isCircusMode ? '#d8b87a' : theme.palette.primary.main,
              fontSize: '1rem',
            }}
          />
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 'medium',
              color: isCircusMode ? '#f4ead6' : alpha(theme.palette.text.primary, 0.8),
              fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
            }}
          >
            {userAreaTexts.summaryForm.foodTitle}
          </Typography>
        </Box>
        <PriceItem item={food} />
        {discount > 0 && (
          <Box sx={{ mt: 1 }}>
            <PriceItem item={{ title: 'Essensrabatt durch Arbeitsschichten', price: -discount }} />
          </Box>
        )}
      </Box>
    </FormCard>
  );
}

export default SummaryCateringCard;
