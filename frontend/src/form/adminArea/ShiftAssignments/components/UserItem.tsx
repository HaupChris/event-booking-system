// frontend/src/form/adminArea/ShiftAssignments/components/UserItem.tsx

import React from 'react';
import {
  Box, Typography, ListItem, Chip, alpha
} from '@mui/material';
import {
  LooksOne as LooksOneIcon,
  LooksTwo as LooksTwoIcon,
  Looks3 as Looks3Icon
} from '@mui/icons-material';
import { UserWithAssignments } from '../types';
import { FormContent } from '../../../userArea/interface';
import { spacePalette } from '../../../../components/styles/theme';

interface UserItemProps {
  user: UserWithAssignments;
  isSelected: boolean;
  onSelect: (userId: number) => void;
  selectedTimeslot: number | null;
  formContent: FormContent;
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  isSelected,
  onSelect,
  selectedTimeslot,
  formContent
}) => {
  // Get workshift and timeslot details for a given timeslot ID
  const getTimeslotDetails = (timeslotId: number) => {
    if (timeslotId === -1) return null;

    for (const workshift of formContent.work_shifts) {
      const timeslot = workshift.time_slots.find(ts => ts.id === timeslotId);
      if (timeslot) {
        return {
          workshiftTitle: workshift.title,
          timeslotTitle: timeslot.title,
          timeRange: timeslot.start_time && timeslot.end_time
            ? `${timeslot.start_time} - ${timeslot.end_time}`
            : ''
        };
      }
    }
    return null;
  };

  // Get user's priorities with details
  const priorities = [
    {
      priority: 1,
      timeslotId: user.timeslot_priority_1,
      details: getTimeslotDetails(user.timeslot_priority_1),
      icon: <LooksOneIcon fontSize="small" />
    },
    {
      priority: 2,
      timeslotId: user.timeslot_priority_2,
      details: getTimeslotDetails(user.timeslot_priority_2),
      icon: <LooksTwoIcon fontSize="small" />
    },
    {
      priority: 3,
      timeslotId: user.timeslot_priority_3,
      details: getTimeslotDetails(user.timeslot_priority_3),
      icon: <Looks3Icon fontSize="small" />
    }
  ];

  // Check if user has selected timeslot in any priority
  const matchingPriority = selectedTimeslot
    ? priorities.find(p => p.timeslotId === selectedTimeslot)
    : null;

  // Determine background color based on matching priority
  const getBackgroundColor = () => {
    if (isSelected) {
      return alpha(spacePalette.primary.main, 0.15);
    }
    if (matchingPriority) {
      // Light highlight for matching timeslot
      return alpha(spacePalette.status.success, 0.08);
    }
    return 'background.paper';
  };

  // Determine border color
  const getBorderColor = () => {
    if (isSelected) {
      return spacePalette.primary.main;
    }
    if (matchingPriority) {
      return alpha(spacePalette.status.success, 0.3);
    }
    return 'divider';
  };

  return (
    <ListItem
      button
      selected={isSelected}
      onClick={() => onSelect(user.booking_id)}
      sx={{
        border: 1,
        borderColor: getBorderColor(),
        borderRadius: 1,
        mb: 1,
        bgcolor: getBackgroundColor(),
        '&:hover': {
          bgcolor: isSelected
            ? alpha(spacePalette.primary.main, 0.2)
            : matchingPriority
            ? alpha(spacePalette.status.success, 0.12)
            : alpha(spacePalette.primary.main, 0.05)
        },
        transition: 'all 0.2s ease'
      }}
    >
      <Box sx={{ width: '100%' }}>
        {/* User name, status and priority badge */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {user.first_name} {user.last_name}
            </Typography>

            {/* Priority badge if timeslot is selected and matches */}
            {matchingPriority && (
              <Chip
                icon={matchingPriority.icon}
                label={`Priority ${matchingPriority.priority}`}
                color="success"
                size="small"
                sx={{
                  height: 20,
                  '& .MuiChip-label': { fontSize: '0.75rem' },
                  '& .MuiChip-icon': { fontSize: '0.8rem' }
                }}
              />
            )}
          </Box>

          <Chip
            label={user.is_fully_assigned ? 'Complete' : 'Incomplete'}
            color={user.is_fully_assigned ? 'success' : 'warning'}
            size="small"
          />
        </Box>

        {/* Supporter buddy */}
        {user.supporter_buddy && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Buddy: {user.supporter_buddy}
          </Typography>
        )}

        {/* Shifts info */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Shifts: {user.assigned_count} / {user.amount_shifts}
        </Typography>

        {/* Priority Details */}
        <Box sx={{
          bgcolor: alpha('#000', 0.1),
          borderRadius: 1,
          p: 1,
          border: '1px solid',
          borderColor: alpha('#fff', 0.1)
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Work Shift Priorities:
          </Typography>

          {priorities.map((priority) => (
            <Box
              key={priority.priority}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 0.5,
                opacity: priority.details ? 1 : 0.5
              }}
            >
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                minWidth: 20,
                color: selectedTimeslot === priority.timeslotId
                  ? spacePalette.status.success
                  : 'text.secondary'
              }}>
                {priority.icon}
              </Box>

              <Typography
                variant="caption"
                color={selectedTimeslot === priority.timeslotId ? 'success.main' : 'text.secondary'}
                sx={{
                  ml: 0.5,
                  fontWeight: selectedTimeslot === priority.timeslotId ? 'bold' : 'normal'
                }}
              >
                {priority.details ? (
                  <>
                    {priority.details.workshiftTitle} - {priority.details.timeslotTitle}
                    {priority.details.timeRange && (
                      <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                        {' '}({priority.details.timeRange})
                      </span>
                    )}
                  </>
                ) : (
                  'Nicht ausgewählt'
                )}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </ListItem>
  );
};

export default UserItem;