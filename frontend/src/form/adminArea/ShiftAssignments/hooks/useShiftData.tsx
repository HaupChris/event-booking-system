import {useState, useEffect, useCallback, useContext, useMemo} from 'react';
import axios from 'axios';
import { TokenContext } from '../../../../contexts/AuthContext';
import {
  ShiftAssignmentWithDetails,
  BookingSummary,
  TimeslotSummary,
  WorkshiftWithTimeslots,
  BulkAssignmentRequest,
  BulkAssignmentResult,
  AssignmentRequest,
  AutoAssignmentConfig,
  AutoAssignmentResult
} from '../types';

interface UseShiftDataReturn {
  // Data
  assignments: ShiftAssignmentWithDetails[];
  bookingSummary: BookingSummary[];
  timeslotSummary: TimeslotSummary[];
  workshifts: WorkshiftWithTimeslots[];

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  refreshData: () => Promise<void>;
  createAssignment: (request: AssignmentRequest) => Promise<boolean>;
  updateAssignment: (assignmentId: number, request: Partial<AssignmentRequest>) => Promise<boolean>;
  deleteAssignment: (assignmentId: number) => Promise<boolean>;
  bulkAssignShifts: (request: BulkAssignmentRequest) => Promise<BulkAssignmentResult>;
  runAutoAssignment: (config: AutoAssignmentConfig) => Promise<AutoAssignmentResult>;

  // Helper functions
  getUserAssignments: (bookingId: number) => ShiftAssignmentWithDetails[];
  getTimeslotAssignments: (timeslotId: number) => ShiftAssignmentWithDetails[];
  canAssignUserToTimeslot: (bookingId: number, timeslotId: number) => { canAssign: boolean; reason?: string };
}

// Replace the entire useShiftData hook with this corrected version:
export const useShiftData = (): UseShiftDataReturn => {
  const { token } = useContext(TokenContext);

  // State
  const [assignments, setAssignments] = useState<ShiftAssignmentWithDetails[]>([]);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary[]>([]);
  const [timeslotSummary, setTimeslotSummary] = useState<TimeslotSummary[]>([]);
  const [workshifts, setWorkshifts] = useState<WorkshiftWithTimeslots[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize API config to prevent continuous re-renders
  const apiConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  // Transform timeslot summary into workshift structure
  const transformToWorkshifts = useCallback((timeslots: TimeslotSummary[]): WorkshiftWithTimeslots[] => {
    const workshiftMap = new Map<string, WorkshiftWithTimeslots>();

    timeslots.forEach(timeslot => {
      const workshiftTitle = timeslot.workshift_title;

      if (!workshiftMap.has(workshiftTitle)) {
        // Use a hash of the title as ID since we don't have real workshift IDs
        const workshiftId = workshiftTitle.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);

        workshiftMap.set(workshiftTitle, {
          id: Math.abs(workshiftId),
          title: workshiftTitle,
          description: '',
          timeslots: []
        });
      }

      workshiftMap.get(workshiftTitle)!.timeslots.push(timeslot);
    });

    return Array.from(workshiftMap.values());
  }, []);

  // Fetch all data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [assignmentsRes, bookingsRes, timeslotsRes] = await Promise.all([
        axios.get('/api/shifts/assignments', apiConfig),
        axios.get('/api/shifts/summary/bookings', apiConfig),
        axios.get('/api/shifts/summary/timeslots', apiConfig)
      ]);

      setAssignments(assignmentsRes.data);
      setBookingSummary(bookingsRes.data);
      setTimeslotSummary(timeslotsRes.data);
      setWorkshifts(transformToWorkshifts(timeslotsRes.data));

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch data');
      console.error('Error fetching shift data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiConfig, transformToWorkshifts]);

  // Create single assignment
  const createAssignment = useCallback(async (request: AssignmentRequest): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      await axios.post('/api/shifts/assignments', request, apiConfig);
      await refreshData();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create assignment');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [apiConfig, refreshData]);

  // Update assignment
  const updateAssignment = useCallback(async (
    assignmentId: number,
    request: Partial<AssignmentRequest>
  ): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      await axios.put(`/api/shifts/assignments/${assignmentId}`, request, apiConfig);
      await refreshData();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update assignment');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [apiConfig, refreshData]);

  // Delete assignment
  const deleteAssignment = useCallback(async (assignmentId: number): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      await axios.delete(`/api/shifts/assignments/${assignmentId}`, apiConfig);
      await refreshData();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete assignment');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [apiConfig, refreshData]);

  // Simplified bulk assign (using existing endpoint multiple times)
  const bulkAssignShifts = useCallback(async (request: BulkAssignmentRequest): Promise<BulkAssignmentResult> => {
    setIsSaving(true);
    setError(null);

    const result: BulkAssignmentResult = {
      successful_assignments: 0,
      failed_assignments: []
    };

    try {
      for (const userId of request.user_ids) {
        for (const timeslotId of request.timeslot_ids) {
          try {
            await axios.post('/api/shifts/assignments', {
              booking_id: userId,
              timeslot_id: timeslotId,
              is_confirmed: true
            }, apiConfig);
            result.successful_assignments++;
          } catch (err: any) {
            result.failed_assignments.push({
              user_id: userId,
              timeslot_id: timeslotId,
              reason: err.response?.data?.error || 'Assignment failed'
            });
          }
        }
      }

      await refreshData();
      return result;
    } catch (err: any) {
      const error = err.response?.data?.error || 'Failed to bulk assign shifts';
      setError(error);
      throw new Error(error);
    } finally {
      setIsSaving(false);
    }
  }, [apiConfig, refreshData]);

  // Run auto assignment
  const runAutoAssignment = useCallback(async (config: AutoAssignmentConfig): Promise<AutoAssignmentResult> => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await axios.post('/api/shifts/autoassign', config, apiConfig);
      await refreshData();
      return response.data;
    } catch (err: any) {
      const error = err.response?.data?.error || 'Failed to run auto assignment';
      setError(error);
      throw new Error(error);
    } finally {
      setIsSaving(false);
    }
  }, [apiConfig, refreshData]);

  // Helper functions remain the same...
  const getUserAssignments = useCallback((bookingId: number): ShiftAssignmentWithDetails[] => {
    return assignments.filter(assignment => assignment.booking_id === bookingId);
  }, [assignments]);

  const getTimeslotAssignments = useCallback((timeslotId: number): ShiftAssignmentWithDetails[] => {
    return assignments.filter(assignment => assignment.timeslot_id === timeslotId);
  }, [assignments]);

  const canAssignUserToTimeslot = useCallback((bookingId: number, timeslotId: number) => {
    const existingAssignment = assignments.find(
      a => a.booking_id === bookingId && a.timeslot_id === timeslotId
    );
    if (existingAssignment) {
      return { canAssign: false, reason: 'User already assigned to this timeslot' };
    }

    const userSummary = bookingSummary.find(u => u.booking_id === bookingId);
    if (userSummary && userSummary.assigned_shifts >= userSummary.max_shifts) {
      return { canAssign: false, reason: 'User has reached maximum shifts' };
    }

    const timeslotSummaryItem = timeslotSummary.find(t => t.timeslot_id === timeslotId);
    if (timeslotSummaryItem && timeslotSummaryItem.assigned_count >= timeslotSummaryItem.capacity) {
      return { canAssign: false, reason: 'Timeslot is at capacity' };
    }

    return { canAssign: true };
  }, [assignments, bookingSummary, timeslotSummary]);

  // Initial data fetch - only depend on token
  useEffect(() => {
    if (token) {
      refreshData().then();
    }
  }, [token]); // Remove refreshData from dependencies

  return {
    assignments,
    bookingSummary,
    timeslotSummary,
    workshifts,
    isLoading,
    isSaving,
    error,
    refreshData,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    bulkAssignShifts,
    runAutoAssignment,
    getUserAssignments,
    getTimeslotAssignments,
    canAssignUserToTimeslot
  };
};