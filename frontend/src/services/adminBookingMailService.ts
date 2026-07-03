import axios from 'axios';
import { API_URL } from '../config/env';

const API_BASE_URL = API_URL || '';

export interface AdminBookingMailRecipient {
  booking_id: number;
  booking_type: 'regular' | 'artist';
}

export interface AdminBookingMailPreviewItem {
  booking_id: number;
  booking_type: 'regular' | 'artist';
  recipient_name: string;
  recipient_email: string;
  subject: string;
  body: string;
}

export interface AdminBookingMailPreviewResponse {
  total_recipient_count: number;
  preview_count: number;
  truncated: boolean;
  previews: AdminBookingMailPreviewItem[];
}

export interface AdminBookingMailSendResponse {
  total_recipient_count: number;
  sent: number;
  failed: number;
  failures: string[];
}

interface AdminBookingMailPayload {
  subject_template: string;
  body_template: string;
  selected_bookings: AdminBookingMailRecipient[];
}

export const previewAdminBookingMail = async (
  token: string,
  payload: AdminBookingMailPayload
): Promise<AdminBookingMailPreviewResponse> => {
  const response = await axios.post<AdminBookingMailPreviewResponse>(
    `${API_BASE_URL}/api/admin/bookings/custom-mail/preview`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

export const sendAdminBookingMail = async (
  token: string,
  payload: AdminBookingMailPayload
): Promise<AdminBookingMailSendResponse> => {
  const response = await axios.post<AdminBookingMailSendResponse>(
    `${API_BASE_URL}/api/admin/bookings/custom-mail/send`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};
