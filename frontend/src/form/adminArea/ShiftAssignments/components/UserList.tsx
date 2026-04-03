import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  List,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import type { BookingWithTimestamp, FormContent } from '../../../userArea/interface';
import type { UserWithAssignments, UserListFilters, ShiftAssignment } from '../types';
import UserItem from './UserItem';
import { matchesSearch, matchesAssignment, matchesAcceptanceFilter } from './userListHelpers';

type SortOption = 'firstName' | 'lastName' | 'priority' | 'wantedShifts';

interface UserListProps {
  regularBookings: BookingWithTimestamp[];
  selectedTimeslot: number | null;
  onUserSelect: (userId: number) => void;
  selectedUsers: Set<number>;
  formContent: FormContent;
  assignments: ShiftAssignment[];
}

const UserList: React.FC<UserListProps> = ({
  regularBookings,
  selectedTimeslot,
  onUserSelect,
  selectedUsers,
  formContent,
  assignments,
}) => {
  const [filters, setFilters] = useState<UserListFilters>({
    searchTerm: '',
    assignmentFilter: 'all',
    acceptanceFilter: 'all',
    ticketDayFilter: 'all',
    shiftCountFilter: 'all',
    daysCountFilter: 'all',
  });
  const [sortBy, setSortBy] = useState<SortOption>('firstName');

  // Merge booking data with assignments
  const usersWithAssignments = useMemo((): UserWithAssignments[] => {
    return regularBookings.map((booking) => {
      const userAssignments = assignments.filter((a) => a.booking_id === booking.id);
      const ticketTitle = formContent.ticket_options.find(
        (to) => to.id === booking.ticket_id
      )!.title;
      const ticket_days = ticketTitle.match(/\(([^)]+)\)/)?.[1] || '';
      const days_count = ticket_days.split(',').length; // Count days by splitting on comma
      const requiresWorkshift = booking.requires_workshift !== false;
      const requiredShiftCount = requiresWorkshift ? booking.amount_shifts : 0;
      return {
        booking_id: booking.id,
        first_name: booking.first_name,
        last_name: booking.last_name,
        email: booking.email,
        ticket_days: ticket_days,
        days_count: days_count,
        requires_workshift: requiresWorkshift,
        supporter_buddy: booking.supporter_buddy || '',
        amount_shifts: requiredShiftCount,
        timeslot_priority_1: booking.timeslot_priority_1,
        timeslot_priority_2: booking.timeslot_priority_2,
        timeslot_priority_3: booking.timeslot_priority_3,
        assigned_shifts: userAssignments,
        assigned_count: userAssignments.length,
        is_fully_assigned: userAssignments.length >= requiredShiftCount,
      };
    });
  }, [regularBookings, assignments, formContent.ticket_options]);

  // Sort users
  const sortedUsers = useMemo(() => {
    return [...usersWithAssignments].sort((a, b) => {
      switch (sortBy) {
        case 'firstName':
          return a.first_name.localeCompare(b.first_name);
        case 'lastName':
          return a.last_name.localeCompare(b.last_name);
        case 'priority':
          if (selectedTimeslot === null) {
            return 0;
          }

          const getPriority = (user: UserWithAssignments) => {
            if (user.timeslot_priority_1 === selectedTimeslot) return 1;
            if (user.timeslot_priority_2 === selectedTimeslot) return 2;
            if (user.timeslot_priority_3 === selectedTimeslot) return 3;
            return 999; // No priority
          };

          return getPriority(a) - getPriority(b);
        case 'wantedShifts':
          return b.amount_shifts - a.amount_shifts;
        default:
          return 0;
      }
    });
  }, [usersWithAssignments, sortBy, selectedTimeslot]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return sortedUsers.filter((user) => {
      const matchesSearchFilter = matchesSearch(user, filters.searchTerm);
      const matchesAssignmentFilter = matchesAssignment(user, filters.assignmentFilter);
      const matchesAcceptance = matchesAcceptanceFilter(user, filters.acceptanceFilter);

      const matchesTicketDay =
        filters.ticketDayFilter === 'all' || user.ticket_days.includes(filters.ticketDayFilter);

      const matchesShiftCount =
        filters.shiftCountFilter === 'all' ||
        user.amount_shifts.toString() === filters.shiftCountFilter;

      const matchesDaysCount =
        filters.daysCountFilter === 'all' || user.days_count.toString() === filters.daysCountFilter;

      return (
        matchesSearchFilter &&
        matchesAssignmentFilter &&
        matchesAcceptance &&
        matchesTicketDay &&
        matchesShiftCount &&
        matchesDaysCount
      );
    });
  }, [sortedUsers, filters]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Fixed Controls - No Scrolling */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
          bgcolor: 'background.paper',
        }}
      >
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search users..."
          value={filters.searchTerm}
          onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1.5 }}
        />

        {/* Compact Filter Grid */}
        <Grid container spacing={1} sx={{ mb: 1.5 }}>
          <Grid size={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Assignment</InputLabel>
              <Select
                value={filters.assignmentFilter}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    assignmentFilter: e.target.value as UserListFilters['assignmentFilter'],
                  }))
                }
                label="Assignment"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
                <MenuItem value="incomplete">Incomplete</MenuItem>
                <MenuItem value="completed">Complete</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Acceptance</InputLabel>
              <Select
                value={filters.acceptanceFilter}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    acceptanceFilter: e.target.value as UserListFilters['acceptanceFilter'],
                  }))
                }
                label="Acceptance"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="all_accepted">All Accepted</MenuItem>
                <MenuItem value="has_pending">Has Pending</MenuItem>
                <MenuItem value="has_declined">Has Declined</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                label="Sort"
              >
                <MenuItem value="priority">Priority</MenuItem>
                <MenuItem value="firstName">First Name</MenuItem>
                <MenuItem value="lastName">Last Name</MenuItem>
                <MenuItem value="wantedShifts">Shifts Wanted</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Day</InputLabel>
              <Select
                value={filters.ticketDayFilter}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    ticketDayFilter: e.target.value as string,
                  }))
                }
                label="Day"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Do">Thu</MenuItem>
                <MenuItem value="Fr">Fri</MenuItem>
                <MenuItem value="Sa">Sat</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Days #</InputLabel>
              <Select
                value={filters.daysCountFilter}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    daysCountFilter: e.target.value as UserListFilters['daysCountFilter'],
                  }))
                }
                label="Days #"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Shifts</InputLabel>
              <Select
                value={filters.shiftCountFilter}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    shiftCountFilter: e.target.value as UserListFilters['shiftCountFilter'],
                  }))
                }
                label="Shifts"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      {/* Scrollable User List */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 1,
        }}
      >
        <List sx={{ py: 0 }}>
          {filteredUsers.map((user) => (
            <UserItem
              key={user.booking_id}
              user={user}
              isSelected={selectedUsers.has(user.booking_id)}
              onSelect={onUserSelect}
              selectedTimeslot={selectedTimeslot}
              formContent={formContent}
              shiftAssignments={user.assigned_shifts}
            />
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default UserList;
