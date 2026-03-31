import axios from 'axios';
import { API_URL } from '../config/env';

const API_BASE_URL = API_URL || 'http://localhost:5001';

export interface FrontendSettingsResponse {
  branding_pack?: string;
}

export const getFrontendSettings = async (): Promise<FrontendSettingsResponse> => {
  const response = await axios.get<FrontendSettingsResponse>(
    `${API_BASE_URL}/api/settings/frontend`
  );
  return response.data;
};
