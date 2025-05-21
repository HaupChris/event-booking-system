// src/form/adminArea/ShiftAssignments/TimeslotsView.tsx
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
import { TimeslotSummary, TimeslotFilter, SortOrder } from './types';
import { spacePalette } from '../../../components/styles/theme';

interface TimeslotsViewProps {
  timeslots: TimeslotSummary[];
  filter: TimeslotFilter;
  sortOrder: SortOrder;
  onFilterChange: (filter: TimeslotFilter) => void;
  onSortOrderToggle: () => void;
  onTimeslotSelect: (timeslotId: number) => void;
  onAssignClick: (timeslotId: number) => void;
  isMobile: boolean;
}

const TimeslotsView: React.FC<TimeslotsViewProps> = ({
  timeslots,
  filter,
  sortOrder,
  onFilterChange,
  onSortOrderToggle,
  onTimeslotSelect,
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
            onChange={(e) => onFilterChange(e.target.value as TimeslotFilter)}
            startAdornment={<FilterAltIcon fontSize="small" sx={{ mr: 1 }} />}
          >
            <MenuItem value="all">All Timeslots</MenuItem>
            <MenuItem value="filled">Filled</MenuItem>
            <MenuItem value="unfilled">Unfilled</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          size="small"
          onClick={onSortOrderToggle}
          startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        >
          Fill %
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(spacePalette.primary.main, 0.1) }}>
              <TableCell>Workshift</TableCell>
              <TableCell>Timeslot</TableCell>
              <TableCell align="center">Time</TableCell>
              <TableCell align="center">Filled</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeslots.map((timeslot) => (
              <TableRow key={timeslot.timeslot_id} hover>
                <TableCell>{timeslot.workshift_title}</TableCell>
                <TableCell>{timeslot.timeslot_title}</TableCell>
                <TableCell align="center">
                  {timeslot.start_time && timeslot.end_time ?
                    `${timeslot.start_time} - ${timeslot.end_time}` :
                    "N/A"}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${timeslot.assigned_count}/${timeslot.capacity}`}
                    color={timeslot.is_filled ? "success" : "primary"}
                    size="small"
                    sx={{
                      bgcolor: timeslot.is_filled
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
                      onClick={() => onAssignClick(timeslot.timeslot_id)}
                      disabled={timeslot.is_filled}
                    >
                      Assign
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      color="info"
                      onClick={() => onTimeslotSelect(timeslot.timeslot_id)}
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

export default TimeslotsView;