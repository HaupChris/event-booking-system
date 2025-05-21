// src/form/adminArea/ShiftAssignments/AssignDialog.tsx
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, FormControl, InputLabel, Select,
  MenuItem, Chip, Alert
} from '@mui/material';
import { ViewType } from './types';
import { BookingWithTimestamp } from '../../userArea/interface';
import { TimeslotSummary } from './types';

interface AssignDialogProps {
  open: boolean;
  onClose: () => void;
  currentView: ViewType;
  selectedBooking?: number;
  selectedTimeslot?: number;
  eligibleBookings: BookingWithTimestamp[];
  eligibleTimeslots: TimeslotSummary[];
  timeslotDetails?: TimeslotSummary;
  bookingDetails?: { first_name: string; last_name: string };
  onAssign: (bookingId: number, timeslotId: number) => Promise<void>;
  getPriorityLabel: (priority: number) => string;
  getPriorityColor: (priority: number) => "success" | "primary" | "warning" | "default";
  getPriorityForBookingAndTimeslot: (bookingId: number, timeslotId: number) => number;
}

const AssignDialog: React.FC<AssignDialogProps> = ({
  open,
  onClose,
  currentView,
  selectedBooking,
  selectedTimeslot,
  eligibleBookings,
  eligibleTimeslots,
  timeslotDetails,
  bookingDetails,
  onAssign,
  getPriorityLabel,
  getPriorityColor,
  getPriorityForBookingAndTimeslot
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {currentView === 'timeslots' && timeslotDetails ?
          `Assign to ${timeslotDetails.timeslot_title}` :
          bookingDetails ?
            `Assign ${bookingDetails.first_name} ${bookingDetails.last_name}` :
            'Assign Shift'
        }
      </DialogTitle>
      <DialogContent>
        {currentView === 'timeslots' && selectedTimeslot && (
          <>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select a participant to assign to this timeslot:
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Participant</InputLabel>
              <Select
                value=""
                label="Participant"
                onChange={(e) => {
                  onAssign(Number(e.target.value), selectedTimeslot);
                }}
              >
                {eligibleBookings.map(booking => {
                  const priority = getPriorityForBookingAndTimeslot(booking.id, selectedTimeslot);
                  return (
                    <MenuItem value={booking.id} key={booking.id}>
                      {booking.first_name} {booking.last_name}
                      {priority > 0 && (
                        <Chip
                          label={getPriorityLabel(priority)}
                          color={getPriorityColor(priority)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {eligibleBookings.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No eligible participants available for this timeslot.
              </Alert>
            )}
          </>
        )}

        {currentView === 'bookings' && selectedBooking && (
          <>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select a timeslot to assign this participant to:
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Timeslot</InputLabel>
              <Select
                value=""
                label="Timeslot"
                onChange={(e) => {
                  onAssign(selectedBooking, Number(e.target.value));
                }}
              >
                {eligibleTimeslots.map(timeslot => {
                  const priority = getPriorityForBookingAndTimeslot(selectedBooking, timeslot.timeslot_id);
                  return (
                    <MenuItem value={timeslot.timeslot_id} key={timeslot.timeslot_id}>
                      {timeslot.workshift_title}: {timeslot.timeslot_title}
                      {priority > 0 && (
                        <Chip
                          label={getPriorityLabel(priority)}
                          color={getPriorityColor(priority)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {eligibleTimeslots.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No eligible timeslots available for this participant.
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignDialog;