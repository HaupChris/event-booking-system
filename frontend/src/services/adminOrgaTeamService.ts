import axios from 'axios';
import { API_URL } from '../config/env';

const API_BASE_URL = API_URL || '';

export interface OrgaTeamInviter {
  id: number;
  name: string;
  is_active: boolean;
  display_order: number;
  created_date?: string;
  updated_date?: string;
}

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const getOrgaTeamInviters = async (
  token: string,
  includeInactive: boolean = true
): Promise<OrgaTeamInviter[]> => {
  const response = await axios.get<{ inviters: OrgaTeamInviter[] }>(
    `${API_BASE_URL}/api/admin/orga-team?include_inactive=${includeInactive}`,
    {
      headers: authHeaders(token),
    }
  );
  return response.data.inviters;
};

export const createOrgaTeamInviter = async (
  token: string,
  payload: { name: string; display_order?: number }
): Promise<void> => {
  await axios.post(`${API_BASE_URL}/api/admin/orga-team`, payload, {
    headers: authHeaders(token),
  });
};

export const updateOrgaTeamInviter = async (
  token: string,
  inviterId: number,
  payload: Partial<Pick<OrgaTeamInviter, 'name' | 'is_active' | 'display_order'>>
): Promise<void> => {
  await axios.put(`${API_BASE_URL}/api/admin/orga-team/${inviterId}`, payload, {
    headers: authHeaders(token),
  });
};

export const deactivateOrgaTeamInviter = async (
  token: string,
  inviterId: number
): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/api/admin/orga-team/${inviterId}`, {
    headers: authHeaders(token),
  });
};
