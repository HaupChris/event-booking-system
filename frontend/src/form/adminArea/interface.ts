// Define a combined booking type for admin views
export interface CombinedBooking {
    id: number;
    last_name: string;
    first_name: string;
    email: string;
    phone: string;
    ticket_id: number;
    beverage_id: number;
    food_id: number;
    total_price: number;
    timestamp: string;
    signature: string;
    is_paid: boolean;
    paid_amount: number;
    payment_date: string;
    payment_notes: string;
    // Common fields above

    // Type discriminator
    bookingType: 'regular' | 'artist';

    // Regular-specific fields (optional for artists)
    timeslot_priority_1?: number;
    timeslot_priority_2?: number;
    timeslot_priority_3?: number;
    material_ids?: number[];
    amount_shifts?: number;
    supporter_buddy?: string;

    // Artist-specific fields (optional for regular users)
    equipment?: string;
    special_requests?: string;
    performance_details?: string;
    artist_material_ids?: number[];
}