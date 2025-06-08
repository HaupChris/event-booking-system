// src/form/adminArea/utils/optionsUtils.ts

import {CombinedBooking} from "../interface";

/**
 * Generic interface for option items (tickets, beverages, food)
 */
export interface OptionItem {
    id: number;
    title: string;
    price?: number;
    description?: string;
    num_booked?: number;
}

/**
 * Filter type for viewing options
 */
export type ViewFilterType = 'all' | 'regular' | 'artist';

/**
 * Get a list of users who selected a specific option
 */
export const getUsersForOption = (
    bookings: CombinedBooking[],
    optionId: number,
    optionType: 'ticket' | 'beverage' | 'food' | 'professions'
): CombinedBooking[] => {

    if (optionType === 'professions') {
        return bookings.filter(booking =>
            booking.profession_ids?.includes(optionId)
        );
    }

    const fieldName = `${optionType}_id`;

    return bookings.filter(booking =>
        booking[fieldName as keyof CombinedBooking] === optionId
    );
};

/**
 * Calculate counts for each option
 */
export const calculateOptionCounts = (
    options: OptionItem[],
    bookings: CombinedBooking[],
    optionType: 'ticket' | 'beverage' | 'food',
    bookingType: ViewFilterType
): {
    id: number;
    title: string;
    price?: number;
    description?: string;
    count: number;
    isArtist: boolean;
}[] => {
    const fieldName = `${optionType}_id`;
    const filteredBookings = bookingType === 'all'
        ? bookings
        : bookings.filter(b => b.bookingType === bookingType);

    return options.map(option => {
        const count = filteredBookings.filter(
            booking => booking[fieldName as keyof CombinedBooking] === option.id
        ).length;

        return {
            id: option.id,
            title: option.title,
            price: option.price,
            description: option.description,
            count,
            isArtist: bookingType === 'artist'
        };
    });
};

/**
 * Creates a combined list of options from both regular and artist data
 */
export const combineOptions = (
    regularOptions: OptionItem[],
    artistOptions: OptionItem[],
    viewType: ViewFilterType,
    regularBookings: CombinedBooking[],
    artistBookings: CombinedBooking[],
    optionType: 'ticket' | 'beverage' | 'food'
) => {
    const regularCounts = viewType === 'all' || viewType === 'regular'
        ? calculateOptionCounts(
            regularOptions,
            regularBookings.map(b => ({...b, bookingType: 'regular'})),
            optionType,
            'regular'
        )
        : [];

    const artistCounts = viewType === 'all' || viewType === 'artist'
        ? calculateOptionCounts(
            artistOptions,
            artistBookings.map(b => ({...b, bookingType: 'artist'})),
            optionType,
            'artist'
        )
        : [];

    return [...regularCounts, ...artistCounts];
};