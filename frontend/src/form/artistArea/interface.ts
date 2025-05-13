import {TicketOption, BeverageOption, FoodOption, Profession} from '../userArea/interface';

export interface ArtistMaterial {
    id: number;
    title: string;
    num_needed: number;
    num_booked: number;
}

export interface ArtistBooking {
    last_name: string;
    first_name: string;
    email: string;
    phone: string;
    ticket_id: number;
    beverage_id: number;
    food_id: number;
    signature: string;
    artist_material_ids: Array<number>;
    total_price: number;
    is_paid: boolean;
    paid_amount: number;
    payment_notes: string;
    payment_date: string;
    equipment: string;
    special_requests: string;
    performance_details: string;
    profession_ids: Array<number>;
}

export interface ArtistBookingWithTimestamp extends ArtistBooking {
    id: number
    timestamp: string
}


export interface ArtistFormContent {
    ticket_options: Array<TicketOption>;
    beverage_options: Array<BeverageOption>;
    food_options: Array<FoodOption>;
    artist_materials: Array<ArtistMaterial>;
    professions: Array<Profession>;
}
