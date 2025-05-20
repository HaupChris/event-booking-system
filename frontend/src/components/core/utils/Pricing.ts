import {Booking, FormContent} from "../../../form/userArea/interface";
import {ArtistBooking, ArtistFormContent} from "../../../form/artistArea/interface";

export function calculateTotalPriceUser(booking: Booking, formContent: FormContent): number {
    let total_price = 0;

    const ticketOption = formContent.ticket_options.find(t => t.id === booking.ticket_id);
    if (ticketOption) {
        total_price += ticketOption.price;
    }

    const beverageOption = formContent.beverage_options.find(b => b.id === booking.beverage_id);
    if (beverageOption) {
        total_price += beverageOption.price;
    }

    const foodOption = formContent.food_options.find(f => f.id === booking.food_id);
    if (foodOption) {
        total_price += foodOption.price;
    }

    if (booking.amount_shifts > 1) {
        const priceOneMeal = formContent.food_options[0].price;
        const discount = priceOneMeal * (booking.amount_shifts - 1);
        total_price -= discount;
    }

    return total_price;
}


export function calculateTotalPriceArtist(booking: ArtistBooking, formContent: ArtistFormContent): number {
    let total_price = 0;

    const ticketOption = formContent.ticket_options.find(t => t.id === booking.ticket_id);
    if (ticketOption) {
        total_price += ticketOption.price;
    }

    const beverageOption = formContent.beverage_options.find(b => b.id === booking.beverage_id);
    if (beverageOption) {
        total_price += beverageOption.price;
    }

    const foodOption = formContent.food_options.find(f => f.id === booking.food_id);
    if (foodOption) {
        total_price += foodOption.price;
    }

    return total_price;
}

