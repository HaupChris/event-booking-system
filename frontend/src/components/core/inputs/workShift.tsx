import type { Booking, WorkShift as WorkShiftType } from '../../../form/userArea/interface';
import { Box, List, ListItem, Typography, alpha, useTheme } from '@mui/material';
import React, { useMemo } from 'react';
import TimeSlot from './timeSlot';
import '../../../css/workShift.css';
import { PRIORITIES } from '../../../form/userArea/constants';
import { useThemeMode } from '../../styles/theme';

interface WorkShiftProps {
  workShift: WorkShiftType;
  currentBooking: Booking;
  updateBooking: (key: keyof Booking, value: number) => void;
  availablePriorities: string[];
}

function WorkShift({
  workShift,
  currentBooking,
  updateBooking,
  availablePriorities,
}: WorkShiftProps) {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';
  const maxSelectionsPerWorkshift = Math.max(1, workShift.multiple_selection_possible ?? 1);

  const selectedTimeslotIds = useMemo(
    () =>
      [
        currentBooking.timeslot_priority_1,
        currentBooking.timeslot_priority_2,
        currentBooking.timeslot_priority_3,
      ].filter((id) => id >= 0),
    [
      currentBooking.timeslot_priority_1,
      currentBooking.timeslot_priority_2,
      currentBooking.timeslot_priority_3,
    ]
  );

  const selectedCountInWorkshift = useMemo(
    () => workShift.time_slots.filter((slot) => selectedTimeslotIds.includes(slot.id)).length,
    [selectedTimeslotIds, workShift.time_slots]
  );

  const isWorkshiftSelectionAtLimit = selectedCountInWorkshift >= maxSelectionsPerWorkshift;

  const sortedTimeSlots = useMemo(() => {
    // Sort time slots so that filled ones appear at the bottom
    return [...workShift.time_slots].sort((a, b) => {
      if (a.num_booked >= a.num_needed && b.num_booked < b.num_needed) {
        return 1;
      } else if (b.num_booked >= b.num_needed && a.num_booked < a.num_needed) {
        return -1;
      }
      return 0;
    });
  }, [workShift.time_slots]);

  return (
    <Box
      sx={{
        mb: 3,
        p: isCircusMode ? { xs: 1.3, sm: 1.8 } : 0,
        borderRadius: isCircusMode ? '14px' : '10px',
        border: isCircusMode ? '2px solid' : 'none',
        borderColor: isCircusMode ? alpha('#d8b87a', 0.5) : 'transparent',
        backgroundColor: isCircusMode ? 'rgba(28, 12, 12, 0.66)' : 'transparent',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 1,
            fontWeight: 'medium',
            color: isCircusMode ? '#ead7b2' : theme.palette.primary.main,
            fontSize: { xs: '1.35rem', sm: '1.5rem' },
            fontFamily: isCircusMode ? '"Rye", serif' : undefined,
          }}
        >
          {workShift.title}
        </Typography>

        <Typography
          sx={{
            color: isCircusMode ? alpha('#e5cf9f', 0.95) : alpha(theme.palette.text.primary, 0.7),
            fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
          }}
          variant="body2"
        >
          {workShift.description}
        </Typography>

        <Typography
          sx={{
            color: isCircusMode ? alpha('#d8b87a', 0.95) : alpha(theme.palette.text.primary, 0.65),
            mt: 0.5,
            fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
          }}
          variant="caption"
        >
          Du kannst hier bis zu {maxSelectionsPerWorkshift} Zeitfenster aus diesem Arbeitsdienst
          auswaehlen.
        </Typography>
      </Box>

      {/* TimeSlots List */}
      <ListItem
        key={workShift.title + '-' + workShift.id}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 0,
        }}
      >
        <List
          className="timeslot-list"
          sx={{
            width: '100%',
            pl: 0,
          }}
        >
          {sortedTimeSlots.map((timeSlot) => {
            const selectedPriority =
              currentBooking.timeslot_priority_1 === timeSlot.id
                ? PRIORITIES.FIRST
                : currentBooking.timeslot_priority_2 === timeSlot.id
                  ? PRIORITIES.SECOND
                  : currentBooking.timeslot_priority_3 === timeSlot.id
                    ? PRIORITIES.THIRD
                    : '';

            const isSelectionDisabled = isWorkshiftSelectionAtLimit && selectedPriority === '';

            return (
              <TimeSlot
                key={timeSlot.id}
                currentBooking={currentBooking}
                timeSlot={timeSlot}
                availablePriorities={availablePriorities}
                selectedPriority={selectedPriority}
                updateBooking={updateBooking}
                selectionDisabled={isSelectionDisabled}
              />
            );
          })}
        </List>
      </ListItem>
    </Box>
  );
}

export default WorkShift;
