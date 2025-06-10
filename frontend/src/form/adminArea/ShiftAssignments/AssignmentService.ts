// src/form/adminArea/ShiftAssignments/AssignmentService.ts
import axios from 'axios';
import { Assignment, BookingSummary, TimeslotSummary, AutoAssignResult, AssignStrategy } from './types';

export class AssignmentService {
  static async getAssignments(token: string): Promise<Assignment[]> {
    const response = await axios.get('/api/shifts/assignments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  static async getBookingSummary(token: string): Promise<BookingSummary[]> {
    const response = await axios.get('/api/shifts/summary/bookings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  static async getTimeslotSummary(token: string): Promise<TimeslotSummary[]> {
    const response = await axios.get('/api/shifts/summary/timeslots', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  static async createAssignment(token: string, bookingId: number, timeslotId: number): Promise<void> {
    await axios.post('/api/shifts/assignments',
      { booking_id: bookingId, timeslot_id: timeslotId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  static async deleteAssignment(token: string, assignmentId: number): Promise<void> {
    await axios.delete(`/api/shifts/assignments/${assignmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  static async runAutoAssignment(token: string, strategy: AssignStrategy): Promise<AutoAssignResult> {
    const response = await axios.post('/api/shifts/autoassign',
      { strategy },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
}