import React, { useState, useReducer, useCallback } from 'react';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { spacePalette } from '../../../components/styles/theme';
import { useShiftData } from './hooks/useShiftData';
import {
  AssignmentUIState,
  AssignmentAction,
  BookingSummary,
  TimeslotSummary,
  BulkAssignmentResult
} from './types';

// Import components (we'll create these next)
import UserList from './components/UserList';
import TimeslotList from './components/TimeslotList';
import ActionPanel from './components/ActionPanel';
import AssignmentSummary from './components/AssignmentSummary';

// Initial UI state
const initialUIState: AssignmentUIState = {
  selectedUsers: new Set(),
  selectedTimeslots: new Set(),
  selectedUserForDetails: null,
  selectedTimeslotForDetails: null,
  showOnlyUnassigned: false,
  showOnlyAvailable: false,
  searchTerm: '',
  sortBy: 'completion',
  sortOrder: 'asc',
  isLoading: false,
  isSaving: false,
  isAutoAssigning: false
};

// UI state reducer
const uiStateReducer = (state: AssignmentUIState, action: AssignmentAction): AssignmentUIState => {
  switch (action.type) {
    case 'SET_SELECTED_USERS':
      return { ...state, selectedUsers: action.payload };

    case 'SET_SELECTED_TIMESLOTS':
      return { ...state, selectedTimeslots: action.payload };

    case 'TOGGLE_USER_SELECTION':
      const newSelectedUsers = new Set(state.selectedUsers);
      if (newSelectedUsers.has(action.payload)) {
        newSelectedUsers.delete(action.payload);
      } else {
        newSelectedUsers.add(action.payload);
      }
      return { ...state, selectedUsers: newSelectedUsers };

    case 'TOGGLE_TIMESLOT_SELECTION':
      const newSelectedTimeslots = new Set(state.selectedTimeslots);
      if (newSelectedTimeslots.has(action.payload)) {
        newSelectedTimeslots.delete(action.payload);
      } else {
        newSelectedTimeslots.add(action.payload);
      }
      return { ...state, selectedTimeslots: newSelectedTimeslots };

    case 'CLEAR_SELECTIONS':
      return {
        ...state,
        selectedUsers: new Set(),
        selectedTimeslots: new Set(),
        selectedUserForDetails: null,
        selectedTimeslotForDetails: null
      };

    case 'SET_USER_DETAILS':
      return { ...state, selectedUserForDetails: action.payload };

    case 'SET_TIMESLOT_DETAILS':
      return { ...state, selectedTimeslotForDetails: action.payload };

    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };

    case 'SET_SHOW_ONLY_UNASSIGNED':
      return { ...state, showOnlyUnassigned: action.payload };

    case 'SET_SHOW_ONLY_AVAILABLE':
      return { ...state, showOnlyAvailable: action.payload };

    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy as any,
        sortOrder: action.payload.sortOrder
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };

    case 'SET_AUTO_ASSIGNING':
      return { ...state, isAutoAssigning: action.payload };

    default:
      return state;
  }
};

const ShiftAssignmentsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Desktop-first

  // Data management
  const {
    assignments,
    bookingSummary,
    timeslotSummary,
    workshifts,
    isLoading: dataLoading,
    isSaving: dataSaving,
    error: dataError,
    refreshData,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    bulkAssignShifts,
    runAutoAssignment,
    getUserAssignments,
    getTimeslotAssignments,
    canAssignUserToTimeslot
  } = useShiftData();

  // UI state management
  const [uiState, dispatchUI] = useReducer(uiStateReducer, initialUIState);

  // Success/error notifications
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Show mobile warning if accessed on mobile
  if (isMobile) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Desktop Required
          </Typography>
          <Typography>
            The Shift Assignment interface requires a desktop or tablet with sufficient screen space
            for optimal functionality. Please access this feature from a larger device.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Smart sorting for users based on current context
  const getSortedUsers = useCallback((): BookingSummary[] => {
    let sorted = [...bookingSummary];

    // If a timeslot is selected, prioritize users who have it as preference
    if (uiState.selectedTimeslotForDetails) {
      sorted = sorted.sort((a, b) => {
        const aHasPriority = Object.values(a.priority_timeslots).includes(uiState.selectedTimeslotForDetails!);
        const bHasPriority = Object.values(b.priority_timeslots).includes(uiState.selectedTimeslotForDetails!);

        if (aHasPriority && !bHasPriority) return -1;
        if (!aHasPriority && bHasPriority) return 1;

        // Then by priority level (lower number = higher priority)
        const aPriority = Object.entries(a.priority_timeslots)
          .find(([_, timeslotId]) => timeslotId === uiState.selectedTimeslotForDetails)?.[0];
        const bPriority = Object.entries(b.priority_timeslots)
          .find(([_, timeslotId]) => timeslotId === uiState.selectedTimeslotForDetails)?.[0];

        if (aPriority && bPriority) {
          return parseInt(aPriority) - parseInt(bPriority);
        }

        return 0;
      });
    } else {
      // Default sorting
      sorted = sorted.sort((a, b) => {
        switch (uiState.sortBy) {
          case 'completion':
            const aCompletion = a.assigned_shifts / a.max_shifts;
            const bCompletion = b.assigned_shifts / b.max_shifts;
            return uiState.sortOrder === 'asc' ? aCompletion - bCompletion : bCompletion - aCompletion;

          case 'name':
            const aName = `${a.first_name} ${a.last_name}`;
            const bName = `${b.first_name} ${b.last_name}`;
            return uiState.sortOrder === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);

          default:
            return 0;
        }
      });
    }

    // Apply filters
    return sorted.filter(user => {
      // Search filter
      const matchesSearch = uiState.searchTerm === '' ||
        user.first_name.toLowerCase().includes(uiState.searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(uiState.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(uiState.searchTerm.toLowerCase());

      // Assignment filter
      const matchesAssignmentFilter = !uiState.showOnlyUnassigned || !user.is_fully_assigned;

      return matchesSearch && matchesAssignmentFilter;
    });
  }, [bookingSummary, uiState]);

  // Smart sorting for timeslots based on current context
  const getSortedTimeslots = useCallback((): TimeslotSummary[] => {
    let sorted = [...timeslotSummary];

    // If a user is selected, prioritize their preference timeslots
    if (uiState.selectedUserForDetails) {
      const selectedUser = bookingSummary.find(u => u.booking_id === uiState.selectedUserForDetails);
      if (selectedUser) {
        sorted = sorted.sort((a, b) => {
          const aIsPriority = Object.values(selectedUser.priority_timeslots).includes(a.timeslot_id);
          const bIsPriority = Object.values(selectedUser.priority_timeslots).includes(b.timeslot_id);

          if (aIsPriority && !bIsPriority) return -1;
          if (!aIsPriority && bIsPriority) return 1;

          // Then by priority level
          const aPriority = Object.entries(selectedUser.priority_timeslots)
            .find(([_, timeslotId]) => timeslotId === a.timeslot_id)?.[0];
          const bPriority = Object.entries(selectedUser.priority_timeslots)
            .find(([_, timeslotId]) => timeslotId === b.timeslot_id)?.[0];

          if (aPriority && bPriority) {
            return parseInt(aPriority) - parseInt(bPriority);
          }

          return 0;
        });
      }
    }

    // Apply filters
    return sorted.filter(timeslot => {
      // Availability filter
      const matchesAvailabilityFilter = !uiState.showOnlyAvailable || !timeslot.is_filled;

      return matchesAvailabilityFilter;
    });
  }, [timeslotSummary, bookingSummary, uiState]);

  // Handle bulk assignment
  const handleBulkAssignment = useCallback(async () => {
    if (uiState.selectedUsers.size === 0 || uiState.selectedTimeslots.size === 0) {
      setErrorMessage('Please select both users and timeslots for bulk assignment');
      return;
    }

    try {
      dispatchUI({ type: 'SET_SAVING', payload: true });

      const result: BulkAssignmentResult = await bulkAssignShifts({
        user_ids: Array.from(uiState.selectedUsers),
        timeslot_ids: Array.from(uiState.selectedTimeslots),
        validate_capacity: true,
        respect_priorities: true
      });

      if (result.successful_assignments > 0) {
        setSuccessMessage(`Successfully assigned ${result.successful_assignments} shifts`);
        dispatchUI({ type: 'CLEAR_SELECTIONS' });
      }

      if (result.failed_assignments.length > 0) {
        setErrorMessage(`${result.failed_assignments.length} assignments failed`);
      }

    } catch (error: any) {
      setErrorMessage(error.message || 'Bulk assignment failed');
    } finally {
      dispatchUI({ type: 'SET_SAVING', payload: false });
    }
  }, [uiState.selectedUsers, uiState.selectedTimeslots, bulkAssignShifts]);

  // Handle auto assignment
  const handleAutoAssignment = useCallback(async (strategy: 'priority' | 'fill') => {
    try {
      dispatchUI({ type: 'SET_AUTO_ASSIGNING', payload: true });

      const result = await runAutoAssignment({ strategy });

      setSuccessMessage(
        `Auto-assignment completed: ${result.assignments_made} assignments made, ` +
        `${result.bookings_fully_assigned}/${result.bookings_total} users fully assigned`
      );

    } catch (error: any) {
      setErrorMessage(error.message || 'Auto-assignment failed');
    } finally {
      dispatchUI({ type: 'SET_AUTO_ASSIGNING', payload: false });
    }
  }, [runAutoAssignment]);

  // Close notifications
  const handleCloseSuccess = () => setSuccessMessage('');
  const handleCloseError = () => setErrorMessage('');

  return (
    <Box sx={{display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Shift Assignments
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Assign participants to work shifts. Select users and timeslots for bulk operations,
          or click individual items for detailed assignment.
        </Typography>
      </Paper>

      {/* Loading overlay */}
      {(dataLoading || uiState.isAutoAssigning) && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: alpha('#000', 0.5),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2, color: 'white' }}>
            {uiState.isAutoAssigning ? 'Running auto-assignment...' : 'Loading...'}
          </Typography>
        </Box>
      )}

      {/* Main content area */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gridTemplateRows: 'auto 1fr',
        gap: 2,
        flex: 1,
        minHeight: 0 // Important for proper grid sizing
      }}>
         Assignment Summary - spans top row
        <Box sx={{ gridColumn: '1 / -1' }}>
          <AssignmentSummary
            bookingSummary={bookingSummary}
            timeslotSummary={timeslotSummary}
            assignments={assignments}
          />
        </Box>

        {/* User List - left column */}
        <Box sx={{ gridColumn: 1, overflow: 'scroll' }}>
          <UserList
            users={getSortedUsers()}
            assignments={assignments}
            selectedUsers={uiState.selectedUsers}
            selectedUserForDetails={uiState.selectedUserForDetails}
            searchTerm={uiState.searchTerm}
            showOnlyUnassigned={uiState.showOnlyUnassigned}
            sortBy={uiState.sortBy}
            sortOrder={uiState.sortOrder}
            onUserSelect={(userId) => dispatchUI({ type: 'TOGGLE_USER_SELECTION', payload: userId })}
            onUserDetails={(userId) => dispatchUI({ type: 'SET_USER_DETAILS', payload: userId })}
            onSearchChange={(term) => dispatchUI({ type: 'SET_SEARCH_TERM', payload: term })}
            onFilterChange={(showUnassigned) => dispatchUI({ type: 'SET_SHOW_ONLY_UNASSIGNED', payload: showUnassigned })}
            onSortChange={(sortBy, sortOrder) => dispatchUI({ type: 'SET_SORT', payload: { sortBy, sortOrder } })}
            getUserAssignments={getUserAssignments}
          />
        </Box>

        {/* Action Panel - center column */}
        <Box sx={{ gridColumn: 2, width: 200 }}>
          <ActionPanel
            selectedUserCount={uiState.selectedUsers.size}
            selectedTimeslotCount={uiState.selectedTimeslots.size}
            isSaving={dataSaving || uiState.isSaving}
            onBulkAssign={handleBulkAssignment}
            onAutoAssign={handleAutoAssignment}
            onClearSelections={() => dispatchUI({ type: 'CLEAR_SELECTIONS' })}
            onRefresh={refreshData}
          />
        </Box>

        {/* Timeslot List - right column */}
        <Box sx={{ gridColumn: 3, overflow: 'hidden' }}>
          <TimeslotList
            workshifts={workshifts}
            assignments={assignments}
            selectedTimeslots={uiState.selectedTimeslots}
            selectedTimeslotForDetails={uiState.selectedTimeslotForDetails}
            showOnlyAvailable={uiState.showOnlyAvailable}
            onTimeslotSelect={(timeslotId) => dispatchUI({ type: 'TOGGLE_TIMESLOT_SELECTION', payload: timeslotId })}
            onTimeslotDetails={(timeslotId) => dispatchUI({ type: 'SET_TIMESLOT_DETAILS', payload: timeslotId })}
            onFilterChange={(showAvailable) => dispatchUI({ type: 'SET_SHOW_ONLY_AVAILABLE', payload: showAvailable })}
            getTimeslotAssignments={getTimeslotAssignments}
          />
        </Box>
      </Box>

      {/* Success notification */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" variant="filled">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error notification */}
      <Snackbar
        open={!!errorMessage || !!dataError}
        autoHideDuration={8000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled">
          {errorMessage || dataError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ShiftAssignmentsPage;