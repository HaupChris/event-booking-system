import axios from 'axios';
import { API_URL } from '../config/env';

const API_BASE_URL = API_URL || '';

export interface PaymentLinkResponse {
  payment_link: string;
}

export interface PublicAppUrlResponse {
  public_app_url: string;
}

export interface BrandingPackResponse {
  branding_pack: string;
}

export interface RideShareEnabledResponse {
  rideshare_enabled: boolean;
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

export const getPublicAppUrl = async (token: string): Promise<PublicAppUrlResponse> => {
  const response = await axios.get<PublicAppUrlResponse>(
    `${API_BASE_URL}/api/admin/settings/public-app-url`,
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

export const updatePublicAppUrl = async (token: string, publicAppUrl: string): Promise<void> => {
  await axios.put(
    `${API_BASE_URL}/api/admin/settings/public-app-url`,
    { public_app_url: publicAppUrl },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

export const getBrandingPack = async (token: string): Promise<BrandingPackResponse> => {
  const response = await axios.get<BrandingPackResponse>(
    `${API_BASE_URL}/api/admin/settings/branding-pack`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const updateBrandingPack = async (token: string, brandingPack: string): Promise<void> => {
  await axios.put(
    `${API_BASE_URL}/api/admin/settings/branding-pack`,
    { branding_pack: brandingPack },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

export const getRideShareEnabled = async (token: string): Promise<RideShareEnabledResponse> => {
  const response = await axios.get<RideShareEnabledResponse>(
    `${API_BASE_URL}/api/admin/settings/rideshare-enabled`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const updateRideShareEnabled = async (
  token: string,
  rideshareEnabled: boolean
): Promise<void> => {
  await axios.put(
    `${API_BASE_URL}/api/admin/settings/rideshare-enabled`,
    { rideshare_enabled: rideshareEnabled },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
};
