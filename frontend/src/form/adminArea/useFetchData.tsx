import {useEffect, useState, useContext, useCallback} from 'react';
import axios from 'axios';
import { TokenContext } from '../../AuthContext';
import {Booking, FormContent} from "../userArea/interface";


export interface BookingWithTimestamp extends Booking {
  id: number
  timestamp: string
}

export const useFetchData = () => {
  const [bookings, setBookings] = useState<BookingWithTimestamp[]>([]);
  const [formContent, setFormContent] = useState<FormContent>({
    ticket_options: [],
    beverage_options: [],
    food_options: [],
    work_shifts: [],
    materials: []
  });
  const { token } = useContext(TokenContext);

  const fetchData = useCallback(async () => {
    try {
      const [bookingsResponse, formContentResponse] = await Promise.all([
        axios.get('/api/data', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/formcontent', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setBookings(bookingsResponse.data);
      setFormContent(formContentResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { bookings, formContent, refetch: fetchData };
};
