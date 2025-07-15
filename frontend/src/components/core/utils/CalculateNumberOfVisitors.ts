import {TicketOption} from "../../../form/userArea/interface";


export function getMaxCapacityPerDay(formContent: { ticket_options: TicketOption[] }) {
    const ticketOptionAmounts = formContent.ticket_options.map((option) => option.amount);
    return Math.max(...ticketOptionAmounts);
}

// Calculate current visitors per day (including all bookings)
export function calculateDayVisitors(formContent: { ticket_options: TicketOption[] }) {
    let visitorsThursday = 0;
    let visitorsFriday = 0;
    let visitorsSaturday = 0;

    formContent.ticket_options.forEach((option: TicketOption) => {
        const title = option.title.toLowerCase();
        if (title.includes('do')) {
            visitorsThursday += option.num_booked;
        }
        if (title.includes('fr')) {
            visitorsFriday += option.num_booked;
        }
        if (title.includes('sa')) {
            visitorsSaturday += option.num_booked;
        }
    });

    return {visitorsThursday, visitorsFriday, visitorsSaturday};
}