import axios from 'axios';
import { API_URL } from '../config/env';

const API_BASE_URL = API_URL || '';

export interface AdminTimeSlot {
  id: number;
  title: string;
  working_title: string;
  start_time: string;
  end_time: string;
  num_needed: number;
  workshift_id: number;
}

export interface AdminWorkShift {
  id: number;
  title: string;
  working_title: string;
  description: string;
  multiple_selection_possible: number;
  time_slots: AdminTimeSlot[];
}

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const getAdminWorkshifts = async (token: string): Promise<AdminWorkShift[]> => {
  const response = await axios.get<{ work_shifts: AdminWorkShift[] }>(
    `${API_BASE_URL}/api/admin/workshifts`,
    {
      headers: authHeaders(token),
    }
  );
  return response.data.work_shifts;
};

export const createAdminWorkshift = async (
  token: string,
  payload: {
    title: string;
    working_title?: string;
    description?: string;
    multiple_selection_possible?: number;
  }
): Promise<void> => {
  await axios.post(`${API_BASE_URL}/api/admin/workshifts`, payload, {
    headers: authHeaders(token),
  });
};

export const updateAdminWorkshift = async (
  token: string,
  workshiftId: number,
  payload: Partial<
    Pick<AdminWorkShift, 'title' | 'working_title' | 'description' | 'multiple_selection_possible'>
  >
): Promise<void> => {
  await axios.put(`${API_BASE_URL}/api/admin/workshifts/${workshiftId}`, payload, {
    headers: authHeaders(token),
  });
};

export const deleteAdminWorkshift = async (token: string, workshiftId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/api/admin/workshifts/${workshiftId}`, {
    headers: authHeaders(token),
  });
};

export const createAdminTimeslot = async (
  token: string,
  workshiftId: number,
  payload: {
    title: string;
    working_title?: string;
    start_time?: string;
    end_time?: string;
    num_needed?: number;
  }
): Promise<void> => {
  await axios.post(`${API_BASE_URL}/api/admin/workshifts/${workshiftId}/timeslots`, payload, {
    headers: authHeaders(token),
  });
};

export const updateAdminTimeslot = async (
  token: string,
  timeslotId: number,
  payload: Partial<
    Pick<AdminTimeSlot, 'title' | 'working_title' | 'start_time' | 'end_time' | 'num_needed'>
  >
): Promise<void> => {
  await axios.put(`${API_BASE_URL}/api/admin/timeslots/${timeslotId}`, payload, {
    headers: authHeaders(token),
  });
};

export const deleteAdminTimeslot = async (token: string, timeslotId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/api/admin/timeslots/${timeslotId}`, {
    headers: authHeaders(token),
  });
};
