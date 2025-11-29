/**
 * Utility functions for workshift-related operations
 */

import {TimeSlot} from "../../userArea/interface";

/**
 * Converts timeslot priority number to German text
 */
export const timeslotPriorityToString = (priority: number): string => {
    if (priority === 1) return "Erstwunsch";
    if (priority === 2) return "Zweitwunsch";
    if (priority === 3) return "Drittwunsch";
    return "Unknown";
};

/**
 * Finds the workshift that contains a specific timeslot
 */
export const getWorkshiftForTimeslot = (timeslotId: number, workshifts: any[]) => {
    return workshifts.find(shift =>
        shift.time_slots.some((slot: any) => slot.id === timeslotId)
    );
};

/**
 * Calculates how many people are assigned to a specific timeslot
 */
export const getTimeslotCount = (timeslotId: number, bookings: any[]): number => {
    return bookings.reduce((count, booking) => {
        return count + (
            [booking.timeslot_priority_1].includes(timeslotId) ||
            (booking.amount_shifts >= 2 && [booking.timeslot_priority_2].includes(timeslotId)) ||
            (booking.amount_shifts >= 3 && [booking.timeslot_priority_3].includes(timeslotId))
                ? 1 : 0
        );
    }, 0);
};

/**
 * Gets all timeslots assigned to a specific user with their priorities
 */
export const getTimeslotsForUser = (booking: any, workshifts: any[]) => {
    const timeslotIds = [
        booking.timeslot_priority_1,
        booking.timeslot_priority_2,
        booking.timeslot_priority_3
    ].filter(id => id !== null && id !== -1);

    const result = [];

    for (const workshiftItem of workshifts) {
        for (const timeslot of workshiftItem.time_slots) {
            if (timeslotIds.includes(timeslot.id)) {
                // Determine priority
                const priority = [
                    booking.timeslot_priority_1,
                    booking.timeslot_priority_2,
                    booking.timeslot_priority_3
                ].indexOf(timeslot.id) + 1;

                result.push({
                    ...timeslot,
                    priority
                });
            }
        }
    }

    return result;
};

/**
 * Gets all users who selected a particular timeslot
 */
export const getUsersForTimeslot = (timeslotId: number, bookings: any[]) => {
    return bookings
        .filter(booking =>
            [booking.timeslot_priority_1, booking.timeslot_priority_2, booking.timeslot_priority_3].includes(timeslotId)
        )
        .map(booking => ({
            first_name: booking.first_name,
            last_name: booking.last_name,
            priority: [booking.timeslot_priority_1, booking.timeslot_priority_2, booking.timeslot_priority_3]
                .indexOf(timeslotId) + 1
        }));
};