import React from 'react';
import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';

interface PriceItemProps {
  item: { title: string; price: number } | null | undefined;
  emptyText?: string;
}

function PriceItem({ item, emptyText = 'Nicht ausgewählt' }: PriceItemProps) {
  const theme = useTheme();

  if (!item) {
    return (
      <Typography
        variant="body1"
        sx={{
          color: alpha(theme.palette.text.primary, 0.7),
          fontStyle: 'italic',
          pl: 1,
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
        bgcolor: alpha(theme.palette.background.default, 0.2),
        borderRadius: '8px',
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.2),
      }}
    >
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.primary,
          fontWeight: 'medium',
        }}
      >
        {item.title}
      </Typography>
      <Chip
        label={`${item.price}€`}
        color="primary"
        size="small"
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.2),
          '& .MuiChip-label': { fontWeight: 'bold' },
        }}
      />
    </Box>
  );
}

export default PriceItem;
