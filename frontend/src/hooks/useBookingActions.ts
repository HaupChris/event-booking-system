/**
 * Custom hook for booking-related actions (delete, update, etc.)
 */

import { useContext } from 'react';
import { TokenContext } from '../contexts/AuthContext';
import { setAuthToken } from '../services/apiClient';
import api from '../services/api';

export function useBookingActions() {
    const { token } = useContext(TokenContext);

    const deleteBooking = async (
        bookingId: number,
        bookingType: 'regular' | 'artist'
    ): Promise<void> => {
        // Update API client token
        setAuthToken(token);

        if (bookingType === 'artist') {
            await api.artistBookings.delete(bookingId);
        } else {
            await api.bookings.delete(bookingId);
        }
    };

    return {
        deleteBooking
    };
}