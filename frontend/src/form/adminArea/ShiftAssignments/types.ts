import { BookingWithTimestamp } from "../../userArea/interface";

// Base assignment types matching your backend
export interface ShiftAssignment {
  id: number;
  booking_id: number;
  timeslot_id: number;
  is_confirmed: boolean;
  admin_notes: string;
  assignment_date: string;
}

export interface ShiftAssignmentWithDetails extends ShiftAssignment {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  workshift_title: string;
  timeslot_title: string;
  timeslot_start: string;
  timeslot_end: string;
  priority: number; // 1, 2, 3 or 0 for manual assignment
}

export interface BookingSummary {
  booking_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  max_shifts: number;
  assigned_shifts: number;
  is_fully_assigned: boolean;
  // User's timeslot preferences - make optional with default
  priority_timeslots?: {
    [priority: number]: number; // priority -> timeslot_id
  };
  supporter_buddy?: string;
  // Add these fields that might be missing from backend
  first_priority_timeslot_id?: number;
  second_priority_timeslot_id?: number;
  third_priority_timeslot_id?: number;
}

// Timeslot summary for capacity management
export interface TimeslotSummary {
  timeslot_id: number;
  workshift_title: string;
  timeslot_title: string;
  start_time: string;
  end_time: string;
  capacity: number;
  assigned_count: number;
  remaining: number;
  is_filled: boolean;
  fill_percentage: number;
}

// Bulk assignment operations
export interface BulkAssignmentRequest {
  user_ids: number[];
  timeslot_ids: number[];
  validate_capacity?: boolean;
  respect_priorities?: boolean;
}

export interface BulkAssignmentResult {
  successful_assignments: number;
  failed_assignments: Array<{
    user_id: number;
    timeslot_id: number;
    reason: string;
  }>;
}

// Assignment creation/update
export interface AssignmentRequest {
  booking_id: number;
  timeslot_id: number;
  is_confirmed?: boolean;
  admin_notes?: string;
}

// Auto-assignment configuration
export interface AutoAssignmentConfig {
  strategy: 'priority' | 'fill';
  reset_existing?: boolean;
}

export interface AutoAssignmentResult {
  assignments_made: number;
  bookings_total: number;
  bookings_fully_assigned: number;
  timeslots_total: number;
  timeslots_filled: number;
  error?: string;
}

// UI State Management
export interface AssignmentUIState {
  // Selection states
  selectedUsers: Set<number>;
  selectedTimeslots: Set<number>;
  selectedUserForDetails: number | null;
  selectedTimeslotForDetails: number | null;

  // View states
  showOnlyUnassigned: boolean;
  showOnlyAvailable: boolean;
  searchTerm: string;
  sortBy: 'name' | 'completion' | 'priority';
  sortOrder: 'asc' | 'desc';

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isAutoAssigning: boolean;
}

// Action types for state management
export type AssignmentAction =
  | { type: 'SET_SELECTED_USERS'; payload: Set<number> }
  | { type: 'SET_SELECTED_TIMESLOTS'; payload: Set<number> }
  | { type: 'TOGGLE_USER_SELECTION'; payload: number }
  | { type: 'TOGGLE_TIMESLOT_SELECTION'; payload: number }
  | { type: 'CLEAR_SELECTIONS' }
  | { type: 'SET_USER_DETAILS'; payload: number | null }
  | { type: 'SET_TIMESLOT_DETAILS'; payload: number | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_SHOW_ONLY_UNASSIGNED'; payload: boolean }
  | { type: 'SET_SHOW_ONLY_AVAILABLE'; payload: boolean }
  | { type: 'SET_SORT'; payload: { sortBy: string; sortOrder: 'asc' | 'desc' } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_AUTO_ASSIGNING'; payload: boolean };

// Extended workshift structure for display
export interface WorkshiftWithTimeslots {
  id: number;
  title: string;
  description: string;
  timeslots: TimeslotSummary[];
}

// Future: Buddy relationship analysis
export interface BuddyRelationship {
  user1_id: number;
  user1_name: string;
  user2_id: number;
  user2_name: string;
  mutual: boolean;
  confidence: number; // 0-1 for fuzzy matching
}