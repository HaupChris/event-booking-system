import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, TextField, Button, ButtonGroup, List,
  InputAdornment, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Search as SearchIcon, Sort as SortIcon } from '@mui/icons-material';
import {BookingWithTimestamp, FormContent} from '../../../userArea/interface';
import { ShiftAssignment, UserWithAssignments, UserListFilters } from '../types';
import { ShiftAssignmentAPI } from '../api';
import UserItem from './UserItem';

type SortOption = 'firstName' | 'lastName' | 'priority' | 'wantedShifts';

interface UserListProps {
  regularBookings: BookingWithTimestamp[];
  selectedTimeslot: number | null;
  onUserSelect: (userId: number) => void;
  selectedUsers: Set<number>;
  token: string;
  formContent: FormContent; // Add this prop
}

const UserList: React.FC<UserListProps> = ({
  regularBookings,
  selectedTimeslot,
  onUserSelect,
  selectedUsers,
  token,
  formContent // Add this
}) => {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [filters, setFilters] = useState<UserListFilters>({
    searchTerm: '',
    assignmentFilter: 'all'
  });
  const [sortBy, setSortBy] = useState<SortOption>('firstName');
  const [loading, setLoading] = useState(false);

  // Fetch assignments on component mount
  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const data = await ShiftAssignmentAPI.getAllAssignments(token);
        setAssignments(data);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [token]);

  // Merge booking data with assignments
  const usersWithAssignments = useMemo((): UserWithAssignments[] => {
    return regularBookings.map(booking => {
      const userAssignments = assignments.filter(a => a.booking_id === booking.id);

      return {
        booking_id: booking.id,
        first_name: booking.first_name,
        last_name: booking.last_name,
        email: booking.email,
        supporter_buddy: booking.supporter_buddy || '',
        amount_shifts: booking.amount_shifts,
        timeslot_priority_1: booking.timeslot_priority_1,
        timeslot_priority_2: booking.timeslot_priority_2,
        timeslot_priority_3: booking.timeslot_priority_3,
        assigned_shifts: userAssignments,
        assigned_count: userAssignments.length,
        is_fully_assigned: userAssignments.length >= booking.amount_shifts
      };
    });
  }, [regularBookings, assignments]);

  // Sort users
  const sortedUsers = useMemo(() => {
    return [...usersWithAssignments].sort((a, b) => {
      switch (sortBy) {
        case 'firstName':
          return a.first_name.localeCompare(b.first_name);
        case 'lastName':
          return a.last_name.localeCompare(b.last_name);
        case 'priority':
          if (!selectedTimeslot) return 0;

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
    return sortedUsers.filter(user => {
      // Search filter
      const matchesSearch = filters.searchTerm === '' ||
        user.first_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        user.supporter_buddy.toLowerCase().includes(filters.searchTerm.toLowerCase());

      // Assignment filter
      const matchesAssignment = filters.assignmentFilter === 'all' ||
        (filters.assignmentFilter === 'completed' && user.is_fully_assigned) ||
        (filters.assignmentFilter === 'incomplete' && !user.is_fully_assigned);

      return matchesSearch && matchesAssignment;
    });
  }, [sortedUsers, filters]);

   return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Fixed Controls - No Scrolling */}
      <Box sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        flexShrink: 0,
        bgcolor: 'background.paper'
      }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search users..."
          value={filters.searchTerm}
          onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        <ButtonGroup size="small" fullWidth sx={{ mb: 2 }}>
          <Button
            variant={filters.assignmentFilter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilters(prev => ({ ...prev, assignmentFilter: 'all' }))}
          >
            All ({usersWithAssignments.length})
          </Button>
          <Button
            variant={filters.assignmentFilter === 'incomplete' ? 'contained' : 'outlined'}
            onClick={() => setFilters(prev => ({ ...prev, assignmentFilter: 'incomplete' }))}
          >
            Incomplete ({usersWithAssignments.filter(u => !u.is_fully_assigned).length})
          </Button>
          <Button
            variant={filters.assignmentFilter === 'completed' ? 'contained' : 'outlined'}
            onClick={() => setFilters(prev => ({ ...prev, assignmentFilter: 'completed' }))}
          >
            Completed ({usersWithAssignments.filter(u => u.is_fully_assigned).length})
          </Button>
        </ButtonGroup>

        {/* Sort Control */}
        <FormControl fullWidth size="small">
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            label="Sort by"
            startAdornment={<SortIcon sx={{ mr: 1 }} />}
          >
            <MenuItem value="firstName">First Name</MenuItem>
            <MenuItem value="lastName">Last Name</MenuItem>
            <MenuItem value="priority" disabled={!selectedTimeslot}>
              Priority (select timeslot first)
            </MenuItem>
            <MenuItem value="wantedShifts">Wanted Shifts</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Scrollable User List */}
      <Box sx={{
        flexGrow: 1,
        overflow: 'auto',
        p: 1
      }}>
        <List sx={{ py: 0 }}>
          {filteredUsers.map(user => (
            <UserItem
              key={user.booking_id}
              user={user}
              isSelected={selectedUsers.has(user.booking_id)}
              onSelect={onUserSelect}
              selectedTimeslot={selectedTimeslot}
              formContent={formContent} // Pass formContent
            />
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default UserList;