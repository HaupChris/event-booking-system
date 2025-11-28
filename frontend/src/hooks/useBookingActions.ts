/**
 * Custom hook for booking-related actions (delete, update, etc.)
 */

import { useContext } from 'react';
import axios from 'axios';
import { TokenContext } from '../contexts/AuthContext';

export function useBookingActions() {
    const { token } = useContext(TokenContext);

    const deleteBooking = async (
        bookingId: number,
        bookingType: 'regular' | 'artist'
    ): Promise<void> => {
        const endpoint = bookingType === 'artist'
            ? `/api/artist/booking/${bookingId}`
            : `/api/booking/${bookingId}`;

        await axios.delete(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
        });
    };

    return {
        deleteBooking
    };
}