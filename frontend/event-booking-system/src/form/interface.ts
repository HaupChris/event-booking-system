// Generated using py-ts-interfaces.
// See https://github.com/cs-cordero/py-ts-interfaces

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

export interface TicketOption {
    id: number;
    title: string;
    price: number;
    amount: number;
    num_booked: number;
}

export interface FormContent {
    ticket_options: Array<TicketOption>;
    beverage_options: Array<BeverageOption>;
    work_shifts: Array<WorkShift>;
    materials: Array<Material>;
}

export interface Booking {
    last_name: string;
    first_name: string;
    email: string;
    phone: string;
    ticket_id: number;
    beverage_id: number;
    timeslot_priority_1: number;
    timeslot_priority_2: number;
    timeslot_priority_3: number;
    signature: string;
    material_ids: Array<number>;
    amount_shifts: number;
    supporter_buddy: string;
    total_price: number;
}
