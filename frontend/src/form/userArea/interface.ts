export interface TimeSlot {
  id: number;
  title: string;
  working_title?: string;
  start_time: string;
  end_time: string;
  num_needed: number;
  num_booked: number;
}

export interface WorkShift {
  id: number;
  title: string;
  working_title?: string;
  description: string;
  multiple_selection_possible?: number;
  time_slots: Array<TimeSlot>;
}

export interface Material {
  id: number;
  title: string;
  num_needed: number;
  num_booked: number;
}

export interface BeverageOption {
  id: number;
  title: string;
  working_title?: string;
  description: string;
  price: number;
  num_booked: number;
}

export interface FoodOption {
  id: number;
  title: string;
  working_title?: string;
  description: string;
  price: number;
  num_booked: number;
}

export interface TicketOption {
  id: number;
  title: string;
  working_title?: string;
  price: number;
  amount: number;
  requires_workshift?: boolean;
  num_booked: number;
}

export interface Profession {
  id: number;
  title: string;
}

export interface OrgaInviter {
  id: number;
  name: string;
}

export interface FormContent {
  ticket_options: Array<TicketOption>;
  beverage_options: Array<BeverageOption>;
  food_options: Array<FoodOption>;
  work_shifts: Array<WorkShift>;
  materials: Array<Material>;
  professions: Array<Profession>;
  payment_link?: string;
  orga_inviters: Array<OrgaInviter>;
}

export interface Booking {
  last_name: string;
  first_name: string;
  email: string;
  phone: string;
  invited_by_id: number;
  invited_by_name?: string;
  ticket_id: number;
  beverage_id: number;
  food_id: number;
  timeslot_priority_1: number;
  timeslot_priority_2: number;
  timeslot_priority_3: number;
  signature: string;
  material_ids: Array<number>;
  amount_shifts: number;
  supporter_buddy: string;
  total_price: number;
  is_paid: boolean;
  paid_amount: number;
  payment_notes: string;
  payment_date: string;
  profile_uuid: string;
  profession_ids: Array<number>;
  requires_workshift?: boolean;
}

export interface BookingWithTimestamp extends Booking {
  id: number;
  timestamp: string;
}
