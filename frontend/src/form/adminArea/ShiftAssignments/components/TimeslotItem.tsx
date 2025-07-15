import React from 'react';
import {
  Box, Typography, ListItem, ListItemButton, LinearProgress, Chip, alpha
} from '@mui/material';
import { ShiftAssignment } from '../types';
import { spacePalette } from '../../../../components/styles/theme';

interface TimeslotItemProps {
  timeslot: {
    id: number;
    title: string;
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
}

const TimeslotItem: React.FC<TimeslotItemProps> = ({
  timeslot,
  isSelected,
  onSelect
}) => {
  const getStatusColor = () => {
    if (timeslot.is_filled) return spacePalette.status.success;
    if (timeslot.fill_percentage >= 75) return spacePalette.status.warning;
    if (timeslot.fill_percentage >= 50) return spacePalette.status.info;
    return spacePalette.status.error;
  };

  const getStatusText = () => {
    if (timeslot.is_filled) return 'Full';
    if (timeslot.fill_percentage >= 75) return 'Almost Full';
    if (timeslot.fill_percentage >= 50) return 'Half Full';
    return 'Needs People';
  };

  const statusColor = getStatusColor();

  return (
    <ListItem disablePadding>
      <ListItemButton
        selected={isSelected}
        onClick={() => onSelect(timeslot.id)}
        sx={{
          border: 1,
          borderColor: isSelected ? spacePalette.primary.main : 'divider',
          borderRadius: 1,
          m: 1,
          bgcolor: isSelected ? alpha(spacePalette.primary.main, 0.1) : 'background.paper',
          '&:hover': {
            bgcolor: isSelected
              ? alpha(spacePalette.primary.main, 0.2)
              : alpha(statusColor, 0.1)
          }
        }}
      >
        <Box sx={{ width: '100%' }}>
          {/* Timeslot title and status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight="medium">
              {timeslot.title}
            </Typography>
            <Chip
              label={getStatusText()}
              size="small"
              sx={{
                bgcolor: alpha(statusColor, 0.2),
                color: statusColor,
                fontWeight: 'medium'
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
                    borderRadius: 3
                  }
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {Math.round(timeslot.fill_percentage)}%
            </Typography>
          </Box>

          {/* Assigned users preview */}
          {timeslot.assignments.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              Assigned: {timeslot.assignments.slice(0, 3).map(a => `${a.first_name} ${a.last_name}`).join(', ')}
              {timeslot.assignments.length > 3 && ` +${timeslot.assignments.length - 3} more`}
            </Typography>
          )}
        </Box>
      </ListItemButton>
    </ListItem>
  );
};

export default TimeslotItem;