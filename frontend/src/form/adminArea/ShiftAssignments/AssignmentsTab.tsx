import React from 'react';
import { Alert, Box, Paper, Typography } from '@mui/material';
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
      <Box sx={{ height: { xs: 'auto', lg: 'calc(100vh - 280px)' }, minHeight: { lg: '800px' } }}>
        <Box
          sx={{
            height: '100%',
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(320px, 5fr) minmax(220px, 2fr) minmax(320px, 5fr)',
            },
          }}
        >
          <Paper
            sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
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

          <Paper
            sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
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

          <Paper
            sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
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
        </Box>
      </Box>
    </Box>
  );
}

export default AssignmentsTab;
