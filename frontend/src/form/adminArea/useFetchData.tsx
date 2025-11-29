import {useCallback, useContext, useEffect, useState} from "react";
import {TokenContext} from "../../contexts/AuthContext";
import {ArtistBookingWithTimestamp, ArtistFormContent} from "../artistArea/interface";
import {BookingWithTimestamp, FormContent} from "../userArea/interface";
import {CombinedBooking} from "./interface";
import {setAuthToken} from "../../services/apiClient";
import api from "../../services/api";

export const useFetchData = () => {
    const [regularBookings, setRegularBookings] = useState<BookingWithTimestamp[]>([]);
    const [artistBookings, setArtistBookings] = useState<ArtistBookingWithTimestamp[]>([]);
    const [formContent, setFormContent] = useState<FormContent>({
        ticket_options: [],
        beverage_options: [],
        food_options: [],
        work_shifts: [],
        materials: [],
        professions: []
    });
    const [artistFormContent, setArtistFormContent] = useState<ArtistFormContent>({
        ticket_options: [],
        beverage_options: [],
        food_options: [],
        artist_materials: [],
        professions: []
    });
    const {token} = useContext(TokenContext);

    const fetchData = useCallback(async () => {
        try {
            // Update API client token
            setAuthToken(token);

            // Fetch regular user data
            const [bookingsResponse, formContentResponse] = await Promise.all([
                api.bookings.getAll(),
                api.formContent.getRegular()
            ]);

            // Fetch artist data
            const [artistBookingsResponse, artistFormContentResponse] = await Promise.all([
                api.artistBookings.getAll(),
                api.formContent.getArtist()
            ]);

            setRegularBookings(bookingsResponse.data);
            setFormContent(formContentResponse.data);
            setArtistBookings(artistBookingsResponse.data);
            setArtistFormContent(artistFormContentResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [token]);

    useEffect(() => {
        fetchData().then();
    }, [fetchData]);

    // Combine bookings for admin view but mark the type
    const allBookings: CombinedBooking[] = [
        ...regularBookings.map(b => ({...b, bookingType: 'regular' as 'regular' | 'artist'})),
        ...artistBookings.map(b => ({...b, bookingType: 'artist' as 'regular' | 'artist'}))
    ];

    return {
        bookings: allBookings,
        regularBookings,
        artistBookings,
        formContent,
        artistFormContent,
        refetch: fetchData
    };
};