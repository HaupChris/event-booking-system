import React from 'react';
import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import { useThemeMode } from '../../../components/styles/theme';

interface PriceItemProps {
  item: { title: string; price: number } | null | undefined;
  emptyText?: string;
}

function PriceItem({ item, emptyText = 'Nicht ausgewählt' }: PriceItemProps) {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';

  if (!item) {
    return (
      <Typography
        variant="body1"
        sx={{
          color: isCircusMode ? alpha('#e5cf9f', 0.9) : alpha(theme.palette.text.primary, 0.7),
          fontStyle: 'italic',
          pl: 1,
          fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
        }}
      >
        {emptyText}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.5,
        bgcolor: isCircusMode
          ? alpha('#2a120f', 0.62)
          : alpha(theme.palette.background.default, 0.2),
        borderRadius: isCircusMode ? '12px' : '8px',
        border: '1px solid',
        borderColor: isCircusMode ? alpha('#d8b87a', 0.5) : alpha(theme.palette.primary.main, 0.2),
        ...(isCircusMode && {
          boxShadow: 'inset 0 0 0 1px rgba(244,205,142,0.14)',
        }),
      }}
    >
      <Typography
        variant="body1"
        sx={{
          color: isCircusMode ? '#f4ead6' : theme.palette.text.primary,
          fontWeight: 'medium',
          fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
        }}
      >
        {item.title}
      </Typography>
      <Chip
        label={`${item.price}€`}
        color="primary"
        size="small"
        sx={{
          bgcolor: isCircusMode ? alpha('#d8b87a', 0.2) : alpha(theme.palette.primary.main, 0.2),
          color: isCircusMode ? '#f4ead6' : undefined,
          border: isCircusMode ? '1px solid' : 'none',
          borderColor: isCircusMode ? alpha('#d8b87a', 0.55) : undefined,
          '& .MuiChip-label': { fontWeight: 'bold' },
        }}
      />
    </Box>
  );
}

export default PriceItem;
