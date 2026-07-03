import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { FilterAlt as FilterAltIcon, ViewColumn as ViewColumnIcon } from '@mui/icons-material';
import AdminCard from './AdminCard';

interface ColumnVisibility {
  [key: string]: boolean;
}

interface BookingsDisplayControlsProps {
  isMobile: boolean;
  viewType: 'all' | 'regular' | 'artist';
  viewTypeAnchorEl: HTMLElement | null;
  columnFilterAnchorEl: HTMLElement | null;
  columnVisibility: ColumnVisibility;
  onViewTypeMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onViewTypeMenuClose: () => void;
  onViewTypeSelect: (type: 'all' | 'regular' | 'artist') => void;
  onViewChange: (_event: React.SyntheticEvent, value: 'all' | 'regular' | 'artist') => void;
  onColumnFilterOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onColumnFilterClose: () => void;
  onColumnVisibilityChange: (column: string) => void;
}

const BookingsDisplayControls: React.FC<BookingsDisplayControlsProps> = ({
  isMobile,
  viewType,
  viewTypeAnchorEl,
  columnFilterAnchorEl,
  columnVisibility,
  onViewTypeMenuOpen,
  onViewTypeMenuClose,
  onViewTypeSelect,
  onViewChange,
  onColumnFilterOpen,
  onColumnFilterClose,
  onColumnVisibilityChange,
}) => {
  return (
    <AdminCard title="Bookings Management" sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          p: 1,
        }}
      >
        {isMobile ? (
          <Box>
            <Button
              variant="outlined"
              onClick={onViewTypeMenuOpen}
              endIcon={<FilterAltIcon />}
              size="small"
            >
              {viewType === 'all' ? 'All Bookings' : viewType === 'regular' ? 'Regular' : 'Artists'}
            </Button>
            <Menu
              anchorEl={viewTypeAnchorEl}
              open={Boolean(viewTypeAnchorEl)}
              onClose={onViewTypeMenuClose}
            >
              <MenuItem onClick={() => onViewTypeSelect('all')}>All Bookings</MenuItem>
              <MenuItem onClick={() => onViewTypeSelect('regular')}>Regular Participants</MenuItem>
              <MenuItem onClick={() => onViewTypeSelect('artist')}>Artists</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Tabs value={viewType} onChange={onViewChange} sx={{ minWidth: '300px' }}>
            <Tab label="All Bookings" value="all" />
            <Tab label="Regular Participants" value="regular" />
            <Tab label="Artists" value="artist" />
          </Tabs>
        )}

        <Box>
          <Tooltip title="Select visible columns">
            <IconButton onClick={onColumnFilterOpen} color="primary" size="small">
              <ViewColumnIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={columnFilterAnchorEl}
            open={Boolean(columnFilterAnchorEl)}
            onClose={onColumnFilterClose}
          >
            <MenuItem disabled>
              <Typography variant="subtitle2">Show Columns</Typography>
            </MenuItem>
            {Object.keys(columnVisibility).map((column) => (
              <MenuItem key={column}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={columnVisibility[column]}
                      onChange={() => onColumnVisibilityChange(column)}
                    />
                  }
                  label={column.charAt(0).toUpperCase() + column.slice(1)}
                />
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>
    </AdminCard>
  );
};

export default BookingsDisplayControls;
