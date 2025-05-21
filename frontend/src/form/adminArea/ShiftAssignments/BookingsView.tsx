// src/form/adminArea/ShiftAssignments/BookingsView.tsx
import React from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem, Button,
  TableContainer, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, Chip, alpha
} from '@mui/material';
import {
  FilterAlt as FilterAltIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { BookingSummary, BookingFilter, SortOrder } from './types';
import { spacePalette } from '../../../components/styles/theme';

interface BookingsViewProps {
  bookings: BookingSummary[];
  filter: BookingFilter;
  sortOrder: SortOrder;
  onFilterChange: (filter: BookingFilter) => void;
  onSortOrderToggle: () => void;
  onBookingSelect: (bookingId: number) => void;
  onAssignClick: (bookingId: number) => void;
  isMobile: boolean;
}

const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  filter,
  sortOrder,
  onFilterChange,
  onSortOrderToggle,
  onBookingSelect,
  onAssignClick,
  isMobile
}) => {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            label="Filter"
            onChange={(e) => onFilterChange(e.target.value as BookingFilter)}
            startAdornment={<FilterAltIcon fontSize="small" sx={{ mr: 1 }} />}
          >
            <MenuItem value="all">All Participants</MenuItem>
            <MenuItem value="assigned">Fully Assigned</MenuItem>
            <MenuItem value="unassigned">Partially Assigned</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          size="small"
          onClick={onSortOrderToggle}
          startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        >
          Assigned %
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(spacePalette.primary.main, 0.1) }}>
              <TableCell>Name</TableCell>
              <TableCell align="center">Shifts</TableCell>
              <TableCell align="center">Assigned</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.booking_id} hover>
                <TableCell>{booking.first_name} {booking.last_name}</TableCell>
                <TableCell align="center">{booking.max_shifts}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${booking.assigned_shifts}/${booking.max_shifts}`}
                    color={booking.is_fully_assigned ? "success" : "primary"}
                    size="small"
                    sx={{
                      bgcolor: booking.is_fully_assigned
                        ? alpha(spacePalette.status.success, 0.1)
                        : alpha(spacePalette.primary.main, 0.1)
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onAssignClick(booking.booking_id)}
                      disabled={booking.is_fully_assigned}
                    >
                      Assign
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      color="info"
                      onClick={() => onBookingSelect(booking.booking_id)}
                    >
                      View
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default BookingsView;