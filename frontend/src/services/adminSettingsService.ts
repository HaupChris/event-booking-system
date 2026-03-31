import axios from 'axios';
import { API_URL } from '../config/env';

const API_BASE_URL = API_URL || 'http://localhost:5001';

export interface PaymentLinkResponse {
  payment_link: string;
}

export const updatePassword = async (
  token: string,
  role: string,
  newPassword: string
): Promise<void> => {
  await axios.put(
    `${API_BASE_URL}/api/admin/settings/password`,
    { role, new_password: newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

export const getPaymentLink = async (token: string): Promise<PaymentLinkResponse> => {
  const response = await axios.get<PaymentLinkResponse>(
    `${API_BASE_URL}/api/admin/settings/payment-link`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const updatePaymentLink = async (token: string, paymentLink: string): Promise<void> => {
  await axios.put(
    `${API_BASE_URL}/api/admin/settings/payment-link`,
    { payment_link: paymentLink },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
};
