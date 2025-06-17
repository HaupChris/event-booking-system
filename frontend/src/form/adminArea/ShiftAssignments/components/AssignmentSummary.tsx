import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  alpha
} from '@mui/material';
import {
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { spacePalette } from '../../../../components/styles/theme';
import StatsCard from '../../components/StatsCard';
import { BookingSummary, TimeslotSummary, ShiftAssignmentWithDetails } from '../types';

interface AssignmentSummaryProps {
  bookingSummary: BookingSummary[];
  timeslotSummary: TimeslotSummary[];
  assignments: ShiftAssignmentWithDetails[];
}

const AssignmentSummary: React.FC<AssignmentSummaryProps> = ({
  bookingSummary,
  timeslotSummary,
  assignments
}) => {
  // Calculate statistics
  const totalParticipants = bookingSummary.length;
  const fullyAssignedParticipants = bookingSummary.filter(b => b.is_fully_assigned).length;
  const partiallyAssignedParticipants = bookingSummary.filter(b =>
    b.assigned_shifts > 0 && !b.is_fully_assigned
  ).length;
  const unassignedParticipants = bookingSummary.filter(b => b.assigned_shifts === 0).length;

  const totalTimeslots = timeslotSummary.length;
  const filledTimeslots = timeslotSummary.filter(t => t.is_filled).length;
  const partiallyFilledTimeslots = timeslotSummary.filter(t =>
    t.assigned_count > 0 && !t.is_filled
  ).length;
  const emptyTimeslots = timeslotSummary.filter(t => t.assigned_count === 0).length;

  const totalAssignments = assignments.length;
  const totalCapacity = timeslotSummary.reduce((sum, t) => sum + t.capacity, 0);
  const totalAssigned = timeslotSummary.reduce((sum, t) => sum + t.assigned_count, 0);
  const totalMaxShifts = bookingSummary.reduce((sum, b) => sum + b.max_shifts, 0);
  const totalAssignedShifts = bookingSummary.reduce((sum, b) => sum + b.assigned_shifts, 0);

  // Calculate completion percentages
  const participantCompletion = totalParticipants > 0 ? (fullyAssignedParticipants / totalParticipants) * 100 : 0;
  const timeslotCompletion = totalTimeslots > 0 ? (filledTimeslots / totalTimeslots) * 100 : 0;
  const overallCompletion = totalMaxShifts > 0 ? (totalAssignedShifts / totalMaxShifts) * 100 : 0;
  const capacityUtilization = totalCapacity > 0 ? (totalAssigned / totalCapacity) * 100 : 0;

  // Priority analysis
  const priorityAssignments = {
    first: assignments.filter(a => a.priority === 1).length,
    second: assignments.filter(a => a.priority === 2).length,
    third: assignments.filter(a => a.priority === 3).length,
    manual: assignments.filter(a => a.priority === 0).length
  };

  const priorityPercentage = totalAssignments > 0
    ? ((priorityAssignments.first + priorityAssignments.second + priorityAssignments.third) / totalAssignments) * 100
    : 0;

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Assignment Overview
      </Typography>

      {/* Main Statistics Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Participant Statistics */}
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Participants"
            value={totalParticipants}
            subtitle={`${fullyAssignedParticipants} fully assigned`}
            icon={<PeopleIcon />}
            color="primary"
            progress={participantCompletion}
            footer={
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`${fullyAssignedParticipants} complete`}
                  size="small"
                  color="success"
                />
                <Chip
                  label={`${partiallyAssignedParticipants} partial`}
                  size="small"
                  color="warning"
                />
                <Chip
                  label={`${unassignedParticipants} unassigned`}
                  size="small"
                  color="error"
                />
              </Box>
            }
            fullHeight
          />
        </Grid>

        {/* Timeslot Statistics */}
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Timeslots"
            value={totalTimeslots}
            subtitle={`${filledTimeslots} at capacity`}
            icon={<ScheduleIcon />}
            color="info"
            progress={timeslotCompletion}
            footer={
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`${filledTimeslots} full`}
                  size="small"
                  color="success"
                />
                <Chip
                  label={`${partiallyFilledTimeslots} partial`}
                  size="small"
                  color="warning"
                />
                <Chip
                  label={`${emptyTimeslots} empty`}
                  size="small"
                  color="error"
                />
              </Box>
            }
            fullHeight
          />
        </Grid>

        {/* Assignment Statistics */}
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Assignments"
            value={totalAssignments}
            subtitle={`${totalAssignedShifts}/${totalMaxShifts} shifts`}
            icon={<AssignmentIcon />}
            color="success"
            progress={overallCompletion}
            footer={
              <Typography variant="caption" color="text.secondary">
                {Math.round(overallCompletion)}% of requested shifts assigned
              </Typography>
            }
            fullHeight
          />
        </Grid>

        {/* Capacity Utilization */}
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Capacity"
            value={`${Math.round(capacityUtilization)}%`}
            subtitle={`${totalAssigned}/${totalCapacity} spots`}
            icon={<TrendingUpIcon />}
            color={capacityUtilization >= 80 ? "success" : capacityUtilization >= 60 ? "warning" : "error"}
            progress={capacityUtilization}
            footer={
              <Typography variant="caption" color="text.secondary">
                Overall capacity utilization
              </Typography>
            }
            fullHeight
          />
        </Grid>
      </Grid>

      {/* Priority Assignment Analysis */}
      <Box sx={{
        p: 2,
        borderRadius: 1,
        backgroundColor: alpha(spacePalette.primary.main, 0.05),
        border: `1px solid ${alpha(spacePalette.primary.main, 0.2)}`
      }}>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
          Priority Assignment Analysis
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ mr: 2, minWidth: 100 }}>
                Preference Match:
              </Typography>
              <Box sx={{ flex: 1, mr: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(priorityPercentage, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(spacePalette.status.success, 0.2),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: spacePalette.status.success,
                      borderRadius: 4,
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ minWidth: 40 }}>
                {Math.round(priorityPercentage)}%
              </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary">
              {priorityAssignments.first + priorityAssignments.second + priorityAssignments.third} of {totalAssignments} assignments match user preferences
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Chip
                label={`1st: ${priorityAssignments.first}`}
                size="small"
                color="success"
              />
              <Chip
                label={`2nd: ${priorityAssignments.second}`}
                size="small"
                color="primary"
              />
              <Chip
                label={`3rd: ${priorityAssignments.third}`}
                size="small"
                color="warning"
              />
              {priorityAssignments.manual > 0 && (
                <Chip
                  label={`Manual: ${priorityAssignments.manual}`}
                  size="small"
                  color="default"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Alerts for potential issues */}
      {(unassignedParticipants > 0 || emptyTimeslots > 0) && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {unassignedParticipants > 0 && (
            <Chip
              icon={<WarningIcon />}
              label={`${unassignedParticipants} participants need assignments`}
              color="warning"
              variant="outlined"
            />
          )}
          {emptyTimeslots > 0 && (
            <Chip
              icon={<WarningIcon />}
              label={`${emptyTimeslots} timeslots need volunteers`}
              color="warning"
              variant="outlined"
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default AssignmentSummary;