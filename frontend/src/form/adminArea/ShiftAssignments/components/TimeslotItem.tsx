import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Badge,
  alpha
} from '@mui/material';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Group as GroupIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { spacePalette } from '../../../../components/styles/theme';
import { TimeslotSummary, ShiftAssignmentWithDetails } from '../types';

interface TimeslotItemProps {
  timeslot: TimeslotSummary;
  isSelected: boolean;
  isDetailSelected: boolean;
  assignments: ShiftAssignmentWithDetails[];
  onSelect: (timeslotId: number) => void;
  onDetails: (timeslotId: number) => void;
}

const TimeslotItem: React.FC<TimeslotItemProps> = ({
  timeslot,
  isSelected,
  isDetailSelected,
  assignments,
  onSelect,
  onDetails
}) => {
  const getProgressColor = () => {
    const percentage = timeslot.fill_percentage;
    if (percentage >= 100) return spacePalette.status.success;
    if (percentage >= 75) return spacePalette.status.warning;
    if (percentage >= 50) return spacePalette.primary.main;
    return spacePalette.status.error;
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return timeStr;
  };

  const getBackgroundColor = () => {
    if (isDetailSelected) {
      return alpha(spacePalette.primary.main, 0.15);
    }
    if (isSelected) {
      return alpha(spacePalette.primary.main, 0.08);
    }
    return 'transparent';
  };

  const getBorderColor = () => {
    if (isDetailSelected) {
      return spacePalette.primary.main;
    }
    return alpha(spacePalette.primary.main, 0.1);
  };

  const progressColor = getProgressColor();

  return (
    <Paper
      elevation={1}
      sx={{
        mb: 1,
        backgroundColor: getBackgroundColor(),
        borderLeft: isDetailSelected ? '4px solid' : 'none',
        borderLeftColor: getBorderColor(),
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: alpha(spacePalette.primary.main, 0.05),
          elevation: 2
        }
      }}
      onClick={() => onDetails(timeslot.timeslot_id)}
    >
      <Box sx={{ p: 2 }}>
        {/* Header with title and selection */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'medium', flex: 1 }}>
            {timeslot.timeslot_title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge
              badgeContent={timeslot.assigned_count}
              color={timeslot.is_filled ? 'success' : 'primary'}
              max={timeslot.capacity}
            >
              <GroupIcon fontSize="small" color={timeslot.is_filled ? 'success' : 'action'} />
            </Badge>

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(timeslot.timeslot_id);
              }}
              sx={{ color: isSelected ? spacePalette.primary.main : 'inherit' }}
            >
              {isSelected ? <CheckBoxIcon color="primary" /> : <CheckBoxOutlineBlankIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Time information */}
        {(timeslot.start_time || timeslot.end_time) && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {formatTime(timeslot.start_time)} - {formatTime(timeslot.end_time)}
            </Typography>
          </Box>
        )}

        {/* Progress bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(timeslot.fill_percentage, 100)}
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
            {timeslot.assigned_count}/{timeslot.capacity}
          </Typography>
        </Box>

        {/* Status chips */}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: assignments.length > 0 ? 1 : 0 }}>
          {timeslot.is_filled && (
            <Chip label="Full" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
          )}

          {timeslot.remaining > 0 && (
            <Chip
              label={`${timeslot.remaining} spots left`}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Box>

        {/* Assigned participants */}
        {assignments.length > 0 && (
          <Box sx={{
            mt: 1,
            p: 1,
            bgcolor: alpha(spacePalette.primary.main, 0.05),
            borderRadius: 1,
            border: `1px solid ${alpha(spacePalette.primary.main, 0.2)}`
          }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: spacePalette.primary.main, display: 'block', mb: 0.5 }}>
              Assigned Participants ({assignments.length}):
            </Typography>
            {assignments.slice(0, 3).map((assignment) => (
              <Box key={assignment.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
                <Typography variant="caption" sx={{ flex: 1 }}>
                  • {assignment.first_name} {assignment.last_name}
                </Typography>
                <Chip
                  label={`P${assignment.priority || 'M'}`}
                  size="small"
                  color={
                    assignment.priority === 1 ? 'success' :
                    assignment.priority === 2 ? 'info' :
                    assignment.priority === 3 ? 'warning' : 'default'
                  }
                  sx={{ height: 16, fontSize: '0.65rem', ml: 1 }}
                  title={
                    assignment.priority === 1 ? '1st Priority' :
                    assignment.priority === 2 ? '2nd Priority' :
                    assignment.priority === 3 ? '3rd Priority' : 'Manual Assignment'
                  }
                />
              </Box>
            ))}
            {assignments.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                +{assignments.length - 3} more...
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TimeslotItem;