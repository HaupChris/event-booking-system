/**
 * Admin Profile Service
 * ====================
 * API client for admin profile management operations
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export interface ProfileStats {
  booking_id: number;
  booking_type: 'regular' | 'artist';
  first_name: string;
  last_name: string;
  email: string;
  profile_uuid: string;
  last_accessed: string | null;
  access_count: number;
  registration_date: string;
}

export interface SendProfileLinkRequest {
  profile_uuid: string;
  email: string;
  first_name: string;
  resend?: boolean;
}

export interface BulkSendRequest {
  profile_uuids: string[];
}

export interface BulkSendResponse {
  message: string;
  sent: number;
  failed: number;
}

/**
 * Get profile access statistics for all users
 */
export const getProfileStats = async (token: string): Promise<ProfileStats[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/profiles/stats`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data.profiles;
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    throw error;
  }
};

/**
 * Send profile link to a user via email
 */
export const sendProfileLink = async (
  token: string,
  data: SendProfileLinkRequest
): Promise<void> => {
  try {
    await axios.post(
      `${API_BASE_URL}/api/admin/profiles/send-link`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error sending profile link:', error);
    throw error;
  }
};

/**
 * Send profile links to multiple users via email
 */
export const bulkSendProfileLinks = async (
  token: string,
  data: BulkSendRequest
): Promise<BulkSendResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/profiles/bulk-send`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending bulk profile links:', error);
    throw error;
  }
};
