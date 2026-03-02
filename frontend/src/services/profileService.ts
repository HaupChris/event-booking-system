/**
 * Profile Service
 * ================
 * API client for profile-related endpoints
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  is_artist: boolean;
}

export interface Ticket {
  id: number;
  title: string;
  price: number;
}

export interface FoodBeverage {
  id: number;
  title: string;
  description: string;
  price: number;
}

export interface Material {
  id: number;
  title: string;
  num_needed: number;
}

export interface Profession {
  id: number;
  title: string;
}

export interface WorkShiftPriority {
  priority: number;
  timeslot_id: number;
  timeslot_title: string;
  timeslot_start_time?: string;
  timeslot_end_time?: string;
  workshift_title?: string;
}

export interface Booking {
  id: number;
  timestamp: string;
  total_price: number;
  profile_uuid: string;
  ticket: Ticket | null;
  food: FoodBeverage | null;
  beverage: FoodBeverage | null;
  amount_shifts?: number;
  supporter_buddy?: string;
  work_shift_priorities?: WorkShiftPriority[];
  equipment?: string;
  special_requests?: string;
  performance_details?: string;
}

export interface Payment {
  is_paid: boolean;
  paid_amount: number;
  payment_notes: string;
  payment_date: string | null;
}

export interface TimeSlot {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  num_needed: number;
}

export interface WorkShift {
  id: number;
  title: string;
  description: string;
}

export interface ShiftAssignment {
  assignment_id: number;
  status: 'pending' | 'accepted' | 'declined';
  is_confirmed: boolean;
  assignment_date: string;
  response_date: string | null;
  rejection_reason: string | null;
  alternative_preferences: string | null;
  admin_notes: string | null;
  timeslot: TimeSlot;
  workshift: WorkShift;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string | null;
  published_date: string;
  author: string | null;
  is_read: boolean;
  read_date: string | null;
}

export interface ProfileData {
  user: User;
  booking: Booking;
  materials: Material[];
  professions: Profession[];
  shifts: ShiftAssignment[];
  payment: Payment;
}

export interface ProfileRecoveryRequest {
  email: string;
}

/**
 * Get complete profile data by UUID
 */
export const getProfile = async (profileUuid: string): Promise<ProfileData> => {
  const response = await axios.get(`${API_BASE_URL}/profile/${profileUuid}`);
  return response.data;
};

/**
 * Get assigned work shifts for a profile
 */
export const getShifts = async (profileUuid: string): Promise<ShiftAssignment[]> => {
  const response = await axios.get(`${API_BASE_URL}/profile/${profileUuid}/shifts`);
  return response.data.shifts;
};

/**
 * Accept a shift assignment
 */
export const acceptShift = async (profileUuid: string, assignmentId: number): Promise<void> => {
  await axios.put(`${API_BASE_URL}/profile/${profileUuid}/shifts/${assignmentId}/accept`);
};

/**
 * Decline a shift assignment
 */
export const declineShift = async (
  profileUuid: string,
  assignmentId: number,
  rejectionReason?: string,
  alternativePreferences?: string
): Promise<void> => {
  await axios.put(`${API_BASE_URL}/profile/${profileUuid}/shifts/${assignmentId}/decline`, {
    rejection_reason: rejectionReason,
    alternative_preferences: alternativePreferences,
  });
};

/**
 * Get news feed for a profile
 */
export const getNewsFeed = async (profileUuid: string): Promise<NewsItem[]> => {
  const response = await axios.get(`${API_BASE_URL}/profile/${profileUuid}/news`);
  return response.data.news;
};

/**
 * Mark a news item as read
 */
export const markNewsAsRead = async (profileUuid: string, newsId: number): Promise<void> => {
  await axios.post(`${API_BASE_URL}/profile/${profileUuid}/news/${newsId}/read`);
};

/**
 * Get count of unread news items
 */
export const getUnreadNewsCount = async (profileUuid: string): Promise<number> => {
  const response = await axios.get(`${API_BASE_URL}/profile/${profileUuid}/news/unread-count`);
  return response.data.unread_count;
};

/**
 * Request profile recovery by email
 */
export const recoverProfile = async (email: string): Promise<void> => {
  await axios.post(`${API_BASE_URL}/profile/recover`, { email });
};
