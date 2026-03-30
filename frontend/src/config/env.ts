const appEnv = import.meta.env;

export const API_BASE_URL = appEnv.VITE_API_BASE_URL ?? appEnv.REACT_APP_API_BASE_URL ?? '';

export const API_URL = appEnv.VITE_API_URL ?? appEnv.REACT_APP_API_URL ?? '';

export const VAPID_PUBLIC_KEY = appEnv.VITE_VAPID_PUBLIC_KEY ?? appEnv.REACT_APP_VAPID_PUBLIC_KEY ?? '';
