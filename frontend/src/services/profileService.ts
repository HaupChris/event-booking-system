/**
 * Profile Service
 * ================
 * API client for profile-related endpoints
 */

import axios from 'axios';
import { API_URL } from '../config/env';

const API_BASE_URL = API_URL || 'http://localhost:5001/api';

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
  invited_by_id?: number | null;
  invited_by_name?: string | null;
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

export interface ShiftMessage {
  id: number;
  title: string;
  category: string | null;
  content: string;
  created_by: string | null;
  created_date: string;
  workshift_title: string;
  timeslot_title: string;
  timeslot_start: string;
  timeslot_end: string;
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

export type RideSharePostType = 'offer' | 'request';
export type RideSharePostStatus = 'active' | 'cancelled';
export type RideShareJoinStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface RideSharePost {
  id: number;
  owner_profile_uuid: string;
  owner_display_name: string;
  post_type: RideSharePostType;
  origin: string;
  destination: string;
  departure_time: string;
  seats_total: number | null;
  seats_taken: number;
  seats_available: number;
  notes: string | null;
  status: RideSharePostStatus;
  created_date: string;
  updated_date: string;
  is_own_post: boolean;
  can_join: boolean;
  my_request_status: RideShareJoinStatus | null;
}

export interface RideShareJoinRequest {
  id: number;
  post_id: number;
  post_type: RideSharePostType;
  post_origin: string;
  post_destination: string;
  post_departure_time: string;
  post_owner_profile_uuid: string;
  post_owner_display_name: string;
  requester_profile_uuid: string;
  requester_display_name: string;
  message: string | null;
  status: RideShareJoinStatus;
  created_date: string;
  responded_date: string | null;
  phone_number: string | null;
}

export interface RideShareContact {
  relation: 'driver' | 'passenger';
  profile_uuid: string;
  display_name: string;
  phone_number: string;
  post_id: number;
  origin: string;
  destination: string;
  departure_time: string;
}

export interface RideShareBoard {
  offers: RideSharePost[];
  requests: RideSharePost[];
  my_posts: RideSharePost[];
  incoming_join_requests: RideShareJoinRequest[];
  my_join_requests: RideShareJoinRequest[];
  visible_contacts: RideShareContact[];
}

export interface CreateRideSharePostPayload {
  post_type: RideSharePostType;
  origin: string;
  destination: string;
  departure_time: string;
  seats_total?: number;
  notes?: string;
}

export interface ProfileData {
  user: User;
  booking: Booking;
  materials: Material[];
  professions: Profession[];
  shifts: ShiftAssignment[];
  payment: Payment;
  payment_link?: string;
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
 * Get shift message feed for a profile
 */
export const getShiftMessages = async (profileUuid: string): Promise<ShiftMessage[]> => {
  const response = await axios.get(`${API_BASE_URL}/profile/${profileUuid}/shifts/messages`);
  return response.data.messages;
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
 * Get ride sharing board data for a profile
 */
export const getRideShareBoard = async (profileUuid: string): Promise<RideShareBoard> => {
  const response = await axios.get(`${API_BASE_URL}/profile/${profileUuid}/rideshare`);
  return response.data.rideshare;
};

/**
 * Create a ride share post
 */
export const createRideSharePost = async (
  profileUuid: string,
  payload: CreateRideSharePostPayload
): Promise<number> => {
  const response = await axios.post(
    `${API_BASE_URL}/profile/${profileUuid}/rideshare/posts`,
    payload
  );
  return response.data.post_id;
};

/**
 * React to a ride share post
 */
export const requestRideShareJoin = async (
  profileUuid: string,
  postId: number,
  message?: string
): Promise<number> => {
  const response = await axios.post(
    `${API_BASE_URL}/profile/${profileUuid}/rideshare/posts/${postId}/react`,
    {
      message,
    }
  );
  return response.data.request_id;
};

/**
 * Approve a ride share join request
 */
export const approveRideShareJoinRequest = async (
  profileUuid: string,
  requestId: number
): Promise<void> => {
  await axios.put(
    `${API_BASE_URL}/profile/${profileUuid}/rideshare/join-requests/${requestId}/approve`
  );
};

/**
 * Reject a ride share join request
 */
export const rejectRideShareJoinRequest = async (
  profileUuid: string,
  requestId: number
): Promise<void> => {
  await axios.put(
    `${API_BASE_URL}/profile/${profileUuid}/rideshare/join-requests/${requestId}/reject`
  );
};

/**
 * Cancel own ride share post
 */
export const cancelRideSharePost = async (profileUuid: string, postId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/profile/${profileUuid}/rideshare/posts/${postId}`);
};

/**
 * Request profile recovery by email
 */
export const recoverProfile = async (email: string): Promise<void> => {
  await axios.post(`${API_BASE_URL}/profile/recover`, { email });
};
