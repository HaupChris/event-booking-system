// frontend/src/form/adminArea/ShiftAssignments/components/UserList.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  List,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { spacePalette } from '../../../../components/styles/theme';
import { BookingSummary, ShiftAssignmentWithDetails } from '../types';
import UserItem from './UserItem';

interface UserListProps {
  users: BookingSummary[];
  assignments: ShiftAssignmentWithDetails[];
  selectedUsers: Set<number>;
  selectedUserForDetails: number | null;
  selectedTimeslotForDetails?: number | null;
  searchTerm: string;
  showOnlyUnassigned: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onUserSelect: (userId: number) => void;
  onUserDetails: (userId: number) => void;
  onSearchChange: (term: string) => void;
  onFilterChange: (showUnassigned: boolean) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  getUserAssignments: (bookingId: number) => ShiftAssignmentWithDetails[];
}

const UserList: React.FC<UserListProps> = ({
  users,
  selectedUsers,
  selectedUserForDetails,
  selectedTimeslotForDetails,
  searchTerm,
  showOnlyUnassigned,
  sortBy,
  sortOrder,
  onUserSelect,
  onUserDetails,
  onSearchChange,
  onFilterChange,
  onSortChange,
  getUserAssignments
}) => {
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortMenuAnchor(null);
  };

  const handleSortChange = (newSortBy: string) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(newSortBy, newSortOrder);
    handleSortClose();
  };

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1, color: spacePalette.primary.main }} />
            Participants ({users.length})
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Sort options">
              <IconButton onClick={handleSortClick} size="small">
                <SortIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search participants..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />

        {/* Filters */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showOnlyUnassigned}
                onChange={(e) => onFilterChange(e.target.checked)}
                size="small"
              />
            }
            label="Only unassigned"
            sx={{ fontSize: '0.875rem' }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <MenuItem value="completion">Completion</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Show selected timeslot info if any */}
        {selectedTimeslotForDetails && (
          <Box sx={{
            mt: 1,
            p: 1,
            bgcolor: alpha(spacePalette.primary.main, 0.1),
            borderRadius: 1,
            border: `1px solid ${alpha(spacePalette.primary.main, 0.3)}`
          }}>
            <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
              Viewing preferences for selected timeslot
            </Typography>
          </Box>
        )}
      </Box>

      {/* User List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List dense>
          {users.map((user) => {
            const userAssignments = getUserAssignments(user.booking_id);
            const isSelected = selectedUsers.has(user.booking_id);
            const isDetailSelected = selectedUserForDetails === user.booking_id;

            return (
              <UserItem
                key={user.booking_id}
                user={user}
                isSelected={isSelected}
                isDetailSelected={isDetailSelected}
                selectedTimeslotId={selectedTimeslotForDetails}
                assignments={userAssignments}
                onSelect={onUserSelect}
                onDetails={onUserDetails}
              />
            );
          })}
        </List>

        {/* Empty state */}
        {users.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No participants found
            </Typography>
            {searchTerm && (
              <Typography variant="caption" color="text.secondary">
                Try adjusting your search or filters
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Selection summary */}
      {selectedUsers.size > 0 && (
        <Box sx={{
          p: 1,
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: alpha(spacePalette.primary.main, 0.05)
        }}>
          <Typography variant="caption" color="primary">
            {selectedUsers.size} participant{selectedUsers.size !== 1 ? 's' : ''} selected
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default UserList;