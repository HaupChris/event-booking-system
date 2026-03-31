import axios from 'axios';
import { API_URL } from '../config/env';

const API_BASE_URL = API_URL || 'http://localhost:5001';

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
