import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { TokenContext } from '../../AuthContext';

export interface Booking {
  id: number;
  last_name: string;
  first_name: string;
  timestamp: string;
  email: string;
  phone: string;
  ticket_id: number;
  beverage_id: number;
  food_id: number;
  timeslot_priority_1: number;
  timeslot_priority_2: number;
  timeslot_priority_3: number;
  amount_shifts: number;
  supporter_buddy: string;
  signature: string;
  total_price: number;
  material_ids: number[];
}

export interface FormContent {
  ticket_options: { id: number; title: string; num_booked: number }[];
  beverage_options: { id: number; title: string; num_booked: number }[];
  food_options: { id: number; title: string; num_booked: number }[];
  work_shifts: { id: number; title: string; time_slots: { id: number; title: string, start_time: string, end_time: string, num_booked: number, num_needed: number}[] }[];
  materials: { id: number; title: string; num_needed: number }[];
}

export const useFetchData = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [formContent, setFormContent] = useState<FormContent>({
    ticket_options: [],
    beverage_options: [],
    food_options: [],
    work_shifts: [],
    materials: []
  });
  const { token } = useContext(TokenContext);

  useEffect(() => {
    axios.get('/api/data', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => setBookings(response.data))
      .catch(error => console.error('Error:', error));

    axios.get('/api/formcontent', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => setFormContent(response.data))
      .catch(error => console.error('Error:', error));
  }, [token]);

  return { bookings, formContent };
};
