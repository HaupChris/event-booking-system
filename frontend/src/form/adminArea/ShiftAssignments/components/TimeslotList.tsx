import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  alpha
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { spacePalette } from '../../../../components/styles/theme';
import { WorkshiftWithTimeslots, ShiftAssignmentWithDetails } from '../types';
import TimeslotItem from './TimeslotItem';

interface TimeslotListProps {
  workshifts: WorkshiftWithTimeslots[];
  assignments: ShiftAssignmentWithDetails[];
  selectedTimeslots: Set<number>;
  selectedTimeslotForDetails: number | null;
  showOnlyAvailable: boolean;
  onTimeslotSelect: (timeslotId: number) => void;
  onTimeslotDetails: (timeslotId: number) => void;
  onFilterChange: (showAvailable: boolean) => void;
  getTimeslotAssignments: (timeslotId: number) => ShiftAssignmentWithDetails[];
}

const TimeslotList: React.FC<TimeslotListProps> = ({
  workshifts,
  selectedTimeslots,
  selectedTimeslotForDetails,
  showOnlyAvailable,
  onTimeslotSelect,
  onTimeslotDetails,
  onFilterChange,
  getTimeslotAssignments
}) => {
  const [expandedWorkshifts, setExpandedWorkshifts] = useState<Set<number>>(
    new Set(workshifts.map(ws => ws.id)) // Start with all expanded
  );

  const toggleWorkshift = (workshiftId: number) => {
    const newExpanded = new Set(expandedWorkshifts);
    if (newExpanded.has(workshiftId)) {
      newExpanded.delete(workshiftId);
    } else {
      newExpanded.add(workshiftId);
    }
    setExpandedWorkshifts(newExpanded);
  };

  const getProgressColor = (assigned: number, capacity: number) => {
    const percentage = (assigned / capacity) * 100;
    if (percentage >= 100) return spacePalette.status.success;
    if (percentage >= 75) return spacePalette.status.warning;
    if (percentage >= 50) return spacePalette.primary.main;
    return spacePalette.status.error;
  };

  // Handle single selection for timeslots
  const handleTimeslotSelect = (timeslotId: number) => {
    // Clear current selection and select only this one
    onTimeslotSelect(timeslotId);
  };

  const totalTimeslots = workshifts.reduce((sum, ws) => sum + ws.timeslots.length, 0);
  const visibleTimeslots = workshifts.reduce((sum, ws) =>
    sum + ws.timeslots.filter(t => !showOnlyAvailable || !t.is_filled).length, 0
  );

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon sx={{ mr: 1, color: spacePalette.primary.main }} />
            Timeslots ({visibleTimeslots}/{totalTimeslots})
          </Typography>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showOnlyAvailable}
                onChange={(e) => onFilterChange(e.target.checked)}
                size="small"
              />
            }
            label="Only available"
            sx={{ fontSize: '0.875rem' }}
          />
        </Box>

        {/* Selection info */}
        {selectedTimeslots.size > 0 && (
          <Box sx={{
            mt: 1,
            p: 1,
            bgcolor: alpha(spacePalette.primary.main, 0.1),
            borderRadius: 1,
            border: `1px solid ${alpha(spacePalette.primary.main, 0.3)}`
          }}>
            <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
              1 timeslot selected (single selection mode)
            </Typography>
          </Box>
        )}
      </Box>

      {/* Workshift List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {workshifts.map((workshift) => {
          const visibleTimeslotsInWorkshift = workshift.timeslots.filter(t =>
            !showOnlyAvailable || !t.is_filled
          );

          if (visibleTimeslotsInWorkshift.length === 0) {
            return null;
          }

          const isExpanded = expandedWorkshifts.has(workshift.id);
          const totalAssigned = workshift.timeslots.reduce((sum, t) => sum + t.assigned_count, 0);
          const totalCapacity = workshift.timeslots.reduce((sum, t) => sum + t.capacity, 0);
          const workshiftProgress = totalCapacity > 0 ? (totalAssigned / totalCapacity) * 100 : 0;

          return (
            <Accordion
              key={workshift.id}
              expanded={isExpanded}
              onChange={() => toggleWorkshift(workshift.id)}
              elevation={0}
              sx={{
                '&:before': { display: 'none' },
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: alpha(spacePalette.primary.main, 0.02)
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: alpha(spacePalette.primary.main, 0.05),
                  borderBottom: `2px solid ${alpha(spacePalette.primary.main, 0.2)}`,
                  '&:hover': {
                    backgroundColor: alpha(spacePalette.primary.main, 0.08)
                  }
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: spacePalette.primary.main }}>
                      {workshift.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {totalAssigned}/{totalCapacity} assigned
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(workshiftProgress, 100)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(spacePalette.primary.main, 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getProgressColor(totalAssigned, totalCapacity),
                        borderRadius: 3,
                      }
                    }}
                  />
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 2, bgcolor: alpha(spacePalette.background.paper, 0.5) }}>
                {workshift.timeslots
                  .filter(t => !showOnlyAvailable || !t.is_filled)
                  .map(timeslot => {
                    const assignments = getTimeslotAssignments(timeslot.timeslot_id);
                    const isSelected = selectedTimeslots.has(timeslot.timeslot_id);
                    const isDetailSelected = selectedTimeslotForDetails === timeslot.timeslot_id;

                    return (
                      <TimeslotItem
                        key={timeslot.timeslot_id}
                        timeslot={timeslot}
                        isSelected={isSelected}
                        isDetailSelected={isDetailSelected}
                        assignments={assignments}
                        onSelect={handleTimeslotSelect}
                        onDetails={onTimeslotDetails}
                      />
                    );
                  })}
              </AccordionDetails>
            </Accordion>
          );
        })}

        {/* Empty state */}
        {visibleTimeslots === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <ScheduleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {showOnlyAvailable ? 'No available timeslots found' : 'No timeslots found'}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TimeslotList;