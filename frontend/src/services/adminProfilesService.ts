import axios from 'axios';
import { API_URL } from '../config/env';

const API_BASE_URL = API_URL || 'http://localhost:5001';

export interface ProfileStatsItem {
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

interface ProfileStatsResponse {
  profiles: ProfileStatsItem[];
}

export const getProfileStats = async (token: string): Promise<ProfileStatsItem[]> => {
  const response = await axios.get<ProfileStatsResponse>(`${API_BASE_URL}/api/admin/profiles/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.profiles;
};

export const sendProfileLink = async (
  token: string,
  payload: { profile_uuid: string; email: string; first_name: string; resend?: boolean }
): Promise<void> => {
  await axios.post(`${API_BASE_URL}/api/admin/profiles/send-link`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};
