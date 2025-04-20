import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { TokenContext } from '../../AuthContext';
import {FormContent} from "../userArea/interface";

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
      .then(response => {
        console.log("/api/formcontent: ", response.data);
        setFormContent(response.data)
      })
      .catch(error => console.error('Error:', error));
  }, [token]);

  return { bookings, formContent };
};
