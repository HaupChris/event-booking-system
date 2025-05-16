// src/form/adminArea/components/FilterSortBar.tsx

import React from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem,
  Button, useMediaQuery, useTheme, SelectChangeEvent,
  alpha
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { spacePalette } from '../../../components/styles/theme';

interface SortOption {
  value: string;
  label: string;
}

interface FilterSortBarProps {
  sortOptions: SortOption[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortByChange: (value: string) => void;
  onSortOrderToggle: () => void;
  children?: React.ReactNode;
}

const FilterSortBar: React.FC<FilterSortBarProps> = ({
  sortOptions,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderToggle,
  children
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSortByChange = (event: SelectChangeEvent<string>) => {
    onSortByChange(event.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        mb: 2,
        gap: 1,
        p: 2,
        backgroundColor: alpha(spacePalette.primary.main, 0.05),
        borderRadius: 1,
        border: `1px solid ${alpha(spacePalette.primary.main, 0.1)}`
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, width: isMobile ? '100%' : 'auto' }}>
        {children}
      </Box>

      <Box sx={{
        display: 'flex',
        gap: 1,
        mt: isMobile ? 1 : 0,
        width: isMobile ? '100%' : 'auto',
        justifyContent: isMobile ? 'flex-end' : 'flex-end'
      }}>
        <FormControl
          variant="outlined"
          size="small"
          sx={{
            minWidth: 120,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper'
            }
          }}
        >
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={handleSortByChange}
            label="Sort By"
          >
            {sortOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={onSortOrderToggle}
          startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          size="small"
        >
          {sortOrder === 'asc' ? 'Asc' : 'Desc'}
        </Button>
      </Box>
    </Box>
  );
};

export default FilterSortBar;