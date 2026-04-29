import axios from 'axios';
import { API_URL } from '../config/env';

const API_BASE_URL = API_URL || '';

export interface FrontendSettingsResponse {
  branding_pack?: string;
  rideshare_enabled?: boolean;
}

export const getFrontendSettings = async (): Promise<FrontendSettingsResponse> => {
  const response = await axios.get<FrontendSettingsResponse>(
    `${API_BASE_URL}/api/settings/frontend`
  );
  return response.data;
};
