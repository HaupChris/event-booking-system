// src/form/adminArea/components/FilterControls.tsx

import React from 'react';
import {
  Box, Button, Menu, MenuItem, Tabs, Tab, useMediaQuery, useTheme
} from '@mui/material';
import { FilterAlt as FilterAltIcon } from '@mui/icons-material';
import { ViewFilterType } from '../utils/optionsUtils';

interface FilterControlsProps {
  viewType: ViewFilterType;
  setViewType: (type: ViewFilterType) => void;
  anchorEl: HTMLElement | null;
  setAnchorEl: (element: HTMLElement | null) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  viewType,
  setViewType,
  anchorEl,
  setAnchorEl
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleViewTypeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleViewTypeMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewTypeSelect = (type: ViewFilterType) => {
    setViewType(type);
    handleViewTypeMenuClose();
  };

  const handleViewChange = (_: React.SyntheticEvent, newValue: ViewFilterType) => {
    setViewType(newValue);
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'flex-start',
      mb: 3
    }}>
      {isMobile ? (
        <>
          <Button
            variant="outlined"
            onClick={handleViewTypeMenuOpen}
            endIcon={<FilterAltIcon />}
            size="small"
          >
            {viewType === 'all' ? 'All' :
             viewType === 'regular' ? 'Regular' : 'Artists'}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleViewTypeMenuClose}
          >
            <MenuItem onClick={() => handleViewTypeSelect('all')}>All</MenuItem>
            <MenuItem onClick={() => handleViewTypeSelect('regular')}>Regular Participants</MenuItem>
            <MenuItem onClick={() => handleViewTypeSelect('artist')}>Artists</MenuItem>
          </Menu>
        </>
      ) : (
        <Tabs
          value={viewType}
          onChange={handleViewChange}
          sx={{ minWidth: '300px' }}
        >
          <Tab label="All" value="all" />
          <Tab label="Regular Participants" value="regular" />
          <Tab label="Artists" value="artist" />
        </Tabs>
      )}
    </Box>
  );
};

export default FilterControls;