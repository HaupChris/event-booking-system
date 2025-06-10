export interface Assignment {
  id: number;
  booking_id: number;
  timeslot_id: number;
  is_confirmed: boolean;
  admin_notes: string;
  assignment_date: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  workshift_title: string;
  timeslot_title: string;
  timeslot_start: string;
  timeslot_end: string;
  priority: number;
}

export interface BookingSummary {
  booking_id: number;
  first_name: string;
  last_name: string;
  max_shifts: number;
  assigned_shifts: number;
  is_fully_assigned: boolean;
}

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

export interface AutoAssignResult {
  assignments_made: number;
  bookings_total: number;
  bookings_fully_assigned: number;
  timeslots_total: number;
  timeslots_filled: number;
}

export type ViewType = 'timeslots' | 'bookings';
export type SortOrder = 'asc' | 'desc';
export type AssignStrategy = 'priority' | 'fill';
export type TimeslotFilter = 'all' | 'filled' | 'unfilled';
export type BookingFilter = 'all' | 'assigned' | 'unassigned';