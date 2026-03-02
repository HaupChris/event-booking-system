import React from 'react';
import { Alert, Box, Grid, Paper, Typography } from '@mui/material';
import type { BookingWithTimestamp, FormContent } from '../../userArea/interface';
import type { ShiftAssignment } from './types';
import UserList from './components/UserList';
import WorkshiftList from './components/WorkshiftList';
import ActionButtons from './components/ActionButtons';
import StatisticsGrid from './components/StatisticsGrid';

interface AssignmentsTabProps {
  totalUsers: number;
  fullyAssignedUsers: number;
  totalShiftsAssigned: number;
  totalShiftsWanted: number;
  totalTimeslots: number;
  totalCapacity: number;
  assignments: ShiftAssignment[];
  regularBookings: BookingWithTimestamp[];
  formContent: FormContent;
  selectedUsers: Set<number>;
  selectedTimeslot: number | null;
  error: string | null;
  success: string | null;
  loading: boolean;
  onClearError: () => void;
  onClearSuccess: () => void;
  onUserSelect: (userId: number) => void;
  onTimeslotSelect: (timeslotId: number) => void;
  onAssignUsers: () => Promise<void>;
  onUnassignFromTimeslot: () => Promise<void>;
  onUnassignAllShifts: () => Promise<void>;
  onClearUserSelection: () => void;
  onExportShiftAssignments: () => void;
}

function AssignmentsTab({
  totalUsers,
  fullyAssignedUsers,
  totalShiftsAssigned,
  totalShiftsWanted,
  totalTimeslots,
  totalCapacity,
  assignments,
  regularBookings,
  formContent,
  selectedUsers,
  selectedTimeslot,
  error,
  success,
  loading,
  onClearError,
  onClearSuccess,
  onUserSelect,
  onTimeslotSelect,
  onAssignUsers,
  onUnassignFromTimeslot,
  onUnassignAllShifts,
  onClearUserSelection,
  onExportShiftAssignments,
}: AssignmentsTabProps) {
  return (
    <Box sx={{ p: 2 }}>
      <StatisticsGrid
        totalUsers={totalUsers}
        fullyAssignedUsers={fullyAssignedUsers}
        totalShiftsAssigned={totalShiftsAssigned}
        totalShiftsWanted={totalShiftsWanted}
        totalTimeslots={totalTimeslots}
        totalCapacity={totalCapacity}
        assignments={assignments}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onClearError}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={onClearSuccess}>
          {success}
        </Alert>
      )}

      <Box sx={{ height: '90vh' }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          <Grid item xs={12} md={5} sx={{ height: '100%' }}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Participants</Typography>
              </Box>
              <UserList
                regularBookings={regularBookings}
                selectedTimeslot={selectedTimeslot}
                onUserSelect={onUserSelect}
                selectedUsers={selectedUsers}
                formContent={formContent}
                assignments={assignments}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={2} sx={{ height: '100%' }}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Actions</Typography>
              </Box>
              <ActionButtons
                selectedUsers={selectedUsers}
                selectedTimeslot={selectedTimeslot}
                onAssignUsers={onAssignUsers}
                onUnassignFromTimeslot={onUnassignFromTimeslot}
                onUnassignAllShifts={onUnassignAllShifts}
                loading={loading}
                onClearUserSelection={onClearUserSelection}
                onExportShiftAssignments={onExportShiftAssignments}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={5} sx={{ height: '100%' }}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Workshifts</Typography>
              </Box>
              <WorkshiftList
                formContent={formContent}
                selectedTimeslot={selectedTimeslot}
                onTimeslotSelect={onTimeslotSelect}
                assignments={assignments}
                bookings={regularBookings}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default AssignmentsTab;
