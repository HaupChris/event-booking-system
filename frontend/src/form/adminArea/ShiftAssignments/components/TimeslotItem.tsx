import React from 'react';
import {
  Box,
  Typography,
  ListItem,
  ListItemButton,
  LinearProgress,
  Chip,
  alpha,
} from '@mui/material';
import { CheckCircle, Cancel, PendingActions } from '@mui/icons-material';
import type { ShiftAssignment } from '../types';
import { adminPalette } from '../../theme/adminPalette';
import type { BookingWithTimestamp } from '../../../userArea/interface';
import { getAdminTitle } from '../../utils/titleUtils';

interface TimeslotItemProps {
  timeslot: {
    id: number;
    title: string;
    working_title?: string;
    start_time: string;
    end_time: string;
    num_needed: number;
    assigned_count: number;
    fill_percentage: number;
    is_filled: boolean;
    assignments: ShiftAssignment[];
  };
  isSelected: boolean;
  onSelect: (timeslotId: number) => void;
  bookings: BookingWithTimestamp[];
}

const TimeslotItem: React.FC<TimeslotItemProps> = ({
  timeslot,
  isSelected,
  onSelect,
  bookings,
}) => {
  const getTimeslotStatusColor = () => {
    if (timeslot.is_filled) return adminPalette.primary.dark;
    if (timeslot.fill_percentage >= 75) return adminPalette.status.warning;
    if (timeslot.fill_percentage >= 50) return adminPalette.status.info;
    return adminPalette.status.error;
  };

  const getStatusText = () => {
    if (timeslot.is_filled) return 'Full';
    if (timeslot.fill_percentage >= 75) return 'Almost Full';
    if (timeslot.fill_percentage >= 50) return 'Half Full';
    return 'Needs People';
  };

  const statusColor = getTimeslotStatusColor();

  const getSupporterBuddyForBookingId = (bookingId: number) => {
    const booking = bookings.find((booking) => booking.id === bookingId);
    if (booking === undefined) {
      return '';
    } else {
      return booking.supporter_buddy;
    }
  };

  // Get status icon for shift assignment
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle sx={{ fontSize: 12, color: 'success.main' }} />;
      case 'declined':
        return <Cancel sx={{ fontSize: 12, color: 'error.main' }} />;
      default:
        return <PendingActions sx={{ fontSize: 12, color: 'warning.main' }} />;
    }
  };

  // Get status color for text
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success.main';
      case 'declined':
        return 'error.main';
      default:
        return 'warning.main';
    }
  };

  return (
    <ListItem disablePadding>
      <ListItemButton
        selected={isSelected}
        onClick={() => onSelect(timeslot.id)}
        sx={{
          border: 1,
          borderColor: isSelected ? adminPalette.primary.main : 'divider',
          borderRadius: 1,
          m: 1,
          bgcolor: isSelected ? alpha(adminPalette.primary.main, 0.1) : 'background.paper',
          '&:hover': {
            bgcolor: isSelected ? alpha(adminPalette.primary.main, 0.2) : alpha(statusColor, 0.1),
          },
        }}
      >
        <Box sx={{ width: '100%' }}>
          {/* Timeslot title and status */}
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
          >
            <Typography variant="subtitle2" fontWeight="medium">
              {getAdminTitle(timeslot)} {timeslot.id}
            </Typography>
            <Chip
              label={getStatusText()}
              size="small"
              sx={{
                bgcolor: alpha(statusColor, 0.2),
                color: statusColor,
                fontWeight: 'medium',
              }}
            />
          </Box>

          {/* Time range */}
          {timeslot.start_time && timeslot.end_time && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {timeslot.start_time} - {timeslot.end_time}
            </Typography>
          )}

          {/* Capacity info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {timeslot.assigned_count} / {timeslot.num_needed}
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(timeslot.fill_percentage, 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: alpha(statusColor, 0.2),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: statusColor,
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {Math.round(timeslot.fill_percentage)}%
            </Typography>
          </Box>

          {/* Assigned users preview */}
          {timeslot.assignments.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5, display: 'block' }}
              >
                Zugewiesen:
              </Typography>
              {timeslot.assignments.map((assignment) => {
                const supporterBuddy = getSupporterBuddyForBookingId(assignment.booking_id);
                const statusIcon = getStatusIcon(assignment.status || 'pending');
                const statusColor = getStatusColor(assignment.status || 'pending');

                return (
                  <Box
                    key={assignment.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mb: 0.3,
                    }}
                  >
                    {statusIcon}
                    <Typography variant="caption" sx={{ color: statusColor }}>
                      {assignment.first_name} {assignment.last_name}
                      {supporterBuddy && supporterBuddy.length > 0 && ` (Buddy: ${supporterBuddy})`}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </ListItemButton>
    </ListItem>
  );
};

export default TimeslotItem;
