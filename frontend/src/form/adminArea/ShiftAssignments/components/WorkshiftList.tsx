import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  alpha,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import type {
  FormContent,
  WorkShift,
  TimeSlot,
  BookingWithTimestamp,
} from '../../../userArea/interface';
import type { ShiftAssignment } from '../types';
import TimeslotItem from './TimeslotItem';
import { spacePalette } from '../../../../components/styles/theme';

interface TimeslotWithAssignments extends TimeSlot {
  assigned_count: number;
  fill_percentage: number;
  is_filled: boolean;
  assignments: ShiftAssignment[];
}

interface WorkshiftWithTimeslots extends WorkShift {
  time_slots: TimeslotWithAssignments[];
  // New workshift-level progress properties
  total_assigned: number;
  total_needed: number;
  workshift_fill_percentage: number;
  is_workshift_fully_assigned: boolean;
  filled_timeslots_count: number;
}

interface WorkshiftListProps {
  formContent: FormContent;
  selectedTimeslot: number | null;
  onTimeslotSelect: (timeslotId: number) => void;
  assignments: ShiftAssignment[];
  bookings: BookingWithTimestamp[];
}

const WorkshiftList: React.FC<WorkshiftListProps> = ({
  formContent,
  selectedTimeslot,
  onTimeslotSelect,
  assignments,
  bookings,
}) => {
  // Merge workshifts with assignment data and calculate workshift-level progress
  const workshiftsWithAssignments = useMemo((): WorkshiftWithTimeslots[] => {
    // Helper to process a timeslot with assignments
    const processTimeslot = (timeslot: TimeSlot) => {
      const isAssignedToTimeslot = (a: ShiftAssignment) => a.timeslot_id === timeslot.id;
      const timeslotAssignments = assignments.filter(isAssignedToTimeslot);
      const assigned_count = timeslotAssignments.length;
      const fill_percentage =
        timeslot.num_needed > 0 ? (assigned_count / timeslot.num_needed) * 100 : 0;

      return {
        ...timeslot,
        assigned_count,
        fill_percentage,
        is_filled: assigned_count >= timeslot.num_needed,
        assignments: timeslotAssignments,
      };
    };

    return formContent.work_shifts.map((workshift) => {
      const timeslotsWithAssignments = workshift.time_slots.map(processTimeslot);

      // Calculate workshift-level statistics
      const total_assigned = timeslotsWithAssignments.reduce(
        (sum, ts) => sum + ts.assigned_count,
        0
      );
      const total_needed = timeslotsWithAssignments.reduce((sum, ts) => sum + ts.num_needed, 0);
      const workshift_fill_percentage =
        total_needed > 0 ? (total_assigned / total_needed) * 100 : 0;
      const is_workshift_fully_assigned = timeslotsWithAssignments.every((ts) => ts.is_filled);
      const filled_timeslots_count = timeslotsWithAssignments.filter((ts) => ts.is_filled).length;

      return {
        ...workshift,
        time_slots: timeslotsWithAssignments,
        total_assigned,
        total_needed,
        workshift_fill_percentage,
        is_workshift_fully_assigned,
        filled_timeslots_count,
      };
    });
  }, [formContent.work_shifts, assignments]);

  // Helper function to get workshift status color
  const getWorkshiftStatusColor = (workshift: WorkshiftWithTimeslots) => {
    if (workshift.is_workshift_fully_assigned) return spacePalette.status.success;
    if (workshift.workshift_fill_percentage >= 75) return spacePalette.status.warning;
    if (workshift.workshift_fill_percentage >= 50) return spacePalette.status.info;
    return spacePalette.status.error;
  };

  // Helper function to get workshift status text and icon
  const getWorkshiftStatus = (workshift: WorkshiftWithTimeslots) => {
    if (workshift.is_workshift_fully_assigned) {
      return {
        text: '',
        icon: <CheckCircleIcon fontSize="small" />,
      };
    }
    if (workshift.workshift_fill_percentage >= 75) {
      return {
        text: '',
        icon: <RadioButtonUnchecked fontSize="small" />,
      };
    }
    return {
      text: '',
      icon: <RadioButtonUnchecked fontSize="small" />,
    };
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Fixed Header - No Scrolling */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {selectedTimeslot
            ? 'Selected timeslot highlighted'
            : 'Select a timeslot to view user priorities'}
        </Typography>
      </Box>

      {/* Scrollable Workshifts List */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
        }}
      >
        {workshiftsWithAssignments.map((workshift) => {
          const statusColor = getWorkshiftStatusColor(workshift);
          const status = getWorkshiftStatus(workshift);

          return (
            <Accordion key={workshift.id} defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: alpha(statusColor, 0.05),
                  borderLeft: 4,
                  borderLeftColor: statusColor,
                  '&:hover': {
                    bgcolor: alpha(statusColor, 0.08),
                  },
                }}
              >
                <Box sx={{ width: '100%' }}>
                  {/* Title and Status Row */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {workshift.title}
                    </Typography>
                    {status.icon}
                  </Box>
                  {/* Timeslots Summary */}
                  <Typography variant="body2" color="text.secondary">
                    {workshift.filled_timeslots_count} / {workshift.time_slots.length} timeslots
                    filled
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 0 }}>
                <List>
                  {workshift.time_slots.map((timeslot) => (
                    <TimeslotItem
                      key={timeslot.id}
                      timeslot={timeslot}
                      isSelected={selectedTimeslot === timeslot.id}
                      onSelect={onTimeslotSelect}
                      bookings={bookings}
                    />
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
};

export default WorkshiftList;
