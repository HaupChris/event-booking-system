export interface TimeSlot {
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    num_needed: number;
    num_booked: number;
}

export interface WorkShift {
    id: number;
    title: string;
    description: string;
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
    description: string;
    price: number;
    num_booked: number;
}

export interface FoodOption {
    id: number;
    title: string;
    description: string;
    price: number;
    num_booked: number;
}

export interface TicketOption {
    id: number;
    title: string;
    price: number;
    amount: number;
    num_booked: number;
}

export interface Profession {
    id: number;
    title: string;
}

export interface FormContent {
    ticket_options: Array<TicketOption>;
    beverage_options: Array<BeverageOption>;
    food_options: Array<FoodOption>;
    work_shifts: Array<WorkShift>;
    materials: Array<Material>;
    professions: Array<Profession>;
}

export interface Booking {
    last_name: string;
    first_name: string;
    email: string;
    phone: string;
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
    profession_ids: Array<number>;
}

export interface BookingWithTimestamp extends Booking {
    id: number
    timestamp: string
}
