export interface ShiftAssignment {
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

export interface UserWithAssignments {
  booking_id: number;
  first_name: string;
  last_name: string;
  email: string;
  supporter_buddy: string;
  amount_shifts: number;
  timeslot_priority_1: number;
  timeslot_priority_2: number;
  timeslot_priority_3: number;
  assigned_shifts: ShiftAssignment[];
  assigned_count: number;
  is_fully_assigned: boolean;
}

export interface UserListFilters {
  searchTerm: string;
  assignmentFilter: 'all' | 'completed' | 'incomplete';
}