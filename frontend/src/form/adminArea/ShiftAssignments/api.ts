import axios from 'axios';
import { ShiftAssignment } from './types';

export const ShiftAssignmentAPI = {
  getAllAssignments: async (token: string): Promise<ShiftAssignment[]> => {
    const response = await axios.get('/api/shifts/assignments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getAssignmentsByTimeslot: async (token: string, timeslotId: number): Promise<ShiftAssignment[]> => {
    const response = await axios.get(`/api/shifts/assignments?timeslot_id=${timeslotId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getAssignmentsByBooking: async (token: string, bookingId: number): Promise<ShiftAssignment[]> => {
    const response = await axios.get(`/api/shifts/assignments?booking_id=${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};