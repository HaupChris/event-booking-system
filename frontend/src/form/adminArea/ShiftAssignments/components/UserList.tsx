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
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Badge,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Sort as SortIcon,
  Assignment as AssignmentIcon,
  PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import { spacePalette } from '../../../../components/styles/theme';
import { BookingSummary, ShiftAssignmentWithDetails } from '../types';

interface UserListProps {
  users: BookingSummary[];
  assignments: ShiftAssignmentWithDetails[];
  selectedUsers: Set<number>;
  selectedUserForDetails: number | null;
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

  const getProgressColor = (assigned: number, max: number) => {
    const percentage = (assigned / max) * 100;
    if (percentage >= 100) return spacePalette.status.success;
    if (percentage >= 75) return spacePalette.primary.main;
    if (percentage >= 50) return spacePalette.status.warning;
    return spacePalette.status.error;
  };

  const getUserPriorityForTimeslot = (user: BookingSummary, timeslotId: number): number => {
    for (const [priority, userTimeslotId] of Object.entries(user.priority_timeslots)) {
      if (userTimeslotId === timeslotId) {
        return parseInt(priority);
      }
    }
    return 0; // No priority
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
      </Box>

      {/* User List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List dense>
          {users.map((user) => {
            const userAssignments = getUserAssignments(user.booking_id);
            const isSelected = selectedUsers.has(user.booking_id);
            const isDetailSelected = selectedUserForDetails === user.booking_id;
            const progressColor = getProgressColor(user.assigned_shifts, user.max_shifts);
            const completionPercentage = (user.assigned_shifts / user.max_shifts) * 100;

            return (
              <ListItem
                key={user.booking_id}
                disablePadding
                sx={{
                  borderBottom: 1,
                  borderColor: alpha(spacePalette.primary.main, 0.1),
                  backgroundColor: isDetailSelected
                    ? alpha(spacePalette.primary.main, 0.1)
                    : 'transparent'
                }}
              >
                <ListItemButton
                  onClick={() => onUserDetails(user.booking_id)}
                  sx={{
                    py: 1,
                    '&:hover': {
                      backgroundColor: alpha(spacePalette.primary.main, 0.05)
                    }
                  }}
                >
                  {/* Selection checkbox */}
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUserSelect(user.booking_id);
                      }}
                    >
                      {isSelected ? (
                        <CheckBoxIcon color="primary" />
                      ) : (
                        <CheckBoxOutlineBlankIcon />
                      )}
                    </IconButton>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                          {user.first_name} {user.last_name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {/* Assignment count badge */}
                          <Badge
                            badgeContent={user.assigned_shifts}
                            color={user.is_fully_assigned ? 'success' : 'primary'}
                            max={user.max_shifts}
                          >
                            <AssignmentIcon
                              fontSize="small"
                              color={user.is_fully_assigned ? 'success' : 'action'}
                            />
                          </Badge>

                          {/* Priority indicator if viewing specific timeslot */}
                          {selectedUserForDetails && (
                            <Tooltip title="Priority for selected timeslot">
                              <PriorityIcon
                                fontSize="small"
                                color="action"
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        {/* Email */}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {user.email}
                        </Typography>

                        {/* Progress bar */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(completionPercentage, 100)}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: alpha(progressColor, 0.2),
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: progressColor,
                                  borderRadius: 3,
                                }
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
                            {user.assigned_shifts}/{user.max_shifts}
                          </Typography>
                        </Box>

                        {/* Status chips */}
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                          {user.is_fully_assigned && (
                            <Chip
                              label="Complete"
                              size="small"
                              color="success"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}

                          {user.supporter_buddy && (
                            <Chip
                              label="Has Buddy"
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}

                          {userAssignments.length > 0 && (
                            <Chip
                              label={`${userAssignments.length} assigned`}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>

                        {/* Buddy information */}
                        {user.supporter_buddy && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Buddy: {user.supporter_buddy}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
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
        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', backgroundColor: alpha(spacePalette.primary.main, 0.05) }}>
          <Typography variant="caption" color="primary">
            {selectedUsers.size} participant{selectedUsers.size !== 1 ? 's' : ''} selected
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default UserList;