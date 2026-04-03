import axios from 'axios';
import { API_URL } from '../config/env';

const API_BASE_URL = API_URL || 'http://localhost:5001';

export type AdminOptionScope = 'regular' | 'artist';
export type AdminOptionType = 'ticket' | 'beverage' | 'food';

export interface AdminOptionItem {
  id: number;
  title: string;
  working_title: string;
  price: number;
  amount?: number;
  requires_workshift?: boolean;
  description?: string;
}

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const getAdminOptions = async (
  token: string,
  scope: AdminOptionScope,
  optionType: AdminOptionType
): Promise<AdminOptionItem[]> => {
  const response = await axios.get<{ options: AdminOptionItem[] }>(
    `${API_BASE_URL}/api/admin/options/${scope}/${optionType}`,
    {
      headers: authHeaders(token),
    }
  );
  return response.data.options;
};

export const createAdminOption = async (
  token: string,
  scope: AdminOptionScope,
  optionType: AdminOptionType,
  payload: {
    title: string;
    working_title?: string;
    price?: number;
    amount?: number;
    requires_workshift?: boolean;
    description?: string;
  }
): Promise<void> => {
  await axios.post(`${API_BASE_URL}/api/admin/options/${scope}/${optionType}`, payload, {
    headers: authHeaders(token),
  });
};

export const updateAdminOption = async (
  token: string,
  scope: AdminOptionScope,
  optionType: AdminOptionType,
  optionId: number,
  payload: {
    title?: string;
    working_title?: string;
    price?: number;
    amount?: number;
    requires_workshift?: boolean;
    description?: string;
  }
): Promise<void> => {
  await axios.put(`${API_BASE_URL}/api/admin/options/${scope}/${optionType}/${optionId}`, payload, {
    headers: authHeaders(token),
  });
};

export const deleteAdminOption = async (
  token: string,
  scope: AdminOptionScope,
  optionType: AdminOptionType,
  optionId: number
): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/api/admin/options/${scope}/${optionType}/${optionId}`, {
    headers: authHeaders(token),
  });
};
