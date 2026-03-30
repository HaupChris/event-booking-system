import axios from 'axios';
import type { ShiftAssignment, ShiftMessageGroup, CreateShiftMessageRequest } from './types';

export const ShiftAssignmentAPI = {
  getAllAssignments: async (token: string): Promise<ShiftAssignment[]> => {
    const response = await axios.get('/api/shifts/assignments', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getAssignmentsByTimeslot: async (
    token: string,
    timeslotId: number
  ): Promise<ShiftAssignment[]> => {
    const response = await axios.get(`/api/shifts/assignments?timeslot_id=${timeslotId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getAssignmentsByBooking: async (token: string, bookingId: number): Promise<ShiftAssignment[]> => {
    const response = await axios.get(`/api/shifts/assignments?booking_id=${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getShiftMessages: async (token: string): Promise<ShiftMessageGroup[]> => {
    const response = await axios.get('/api/shifts/messages', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.groups;
  },

  createShiftMessage: async (
    token: string,
    payload: CreateShiftMessageRequest
  ): Promise<{ createdCount: number; failedTimeslotIds: number[] }> => {
    const response = await axios.post('/api/shifts/messages', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      createdCount: response.data.created_count || 0,
      failedTimeslotIds: response.data.failed_timeslot_ids || [],
    };
  },

  deleteShiftMessage: async (token: string, messageId: number): Promise<void> => {
    await axios.delete(`/api/shifts/messages/${messageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
