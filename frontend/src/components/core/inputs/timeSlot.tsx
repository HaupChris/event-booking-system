import React from 'react';
import type { Booking, TimeSlot as TimeSlotType } from '../../../form/userArea/interface';
import { useThemeMode } from '../../styles/theme';
import TimeSlotCircus from './timeSlotCircus';
import TimeSlotDefault from './timeSlotDefault';

export interface TimeSlotProps {
  timeSlot: TimeSlotType;
  selectedPriority: string;
  updateBooking: (key: keyof Booking, value: number) => void;
  availablePriorities: string[];
  currentBooking: Booking;
  selectionDisabled?: boolean;
}

function TimeSlot(props: TimeSlotProps) {
  const { mode } = useThemeMode();

  if (mode === 'circus') {
    return <TimeSlotCircus {...props} />;
  }

  return <TimeSlotDefault {...props} />;
}

export default TimeSlot;
