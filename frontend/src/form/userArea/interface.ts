// Generated using py-ts-interfaces.
// See https://github.com/cs-cordero/py-ts-interfaces

export interface ArtistMaterial {
    id: number;
    title: string;
    num_needed: number;
    num_booked: number;
}

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

export interface FormContent {
    ticket_options: Array<TicketOption>;
    beverage_options: Array<BeverageOption>;
    food_options: Array<FoodOption>;
    work_shifts: Array<WorkShift>;
    materials: Array<Material>;
    artist_materials: Array<ArtistMaterial>;
}

export interface Booking {
    id: number;
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
    is_artist: boolean; // New field
    artist_equipment: string; // New field
    special_requests: string; // New field
    performance_details: string; // New field
    artist_material_ids: Array<number>; // New field
}
