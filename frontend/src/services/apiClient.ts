/**
 * Centralized API client with interceptors for error handling and authentication
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || '',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    authToken = token;
};

export const getAuthToken = () => authToken;

// Request interceptor - automatically add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (authToken && config.headers) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        // Handle common error scenarios
        if (error.response) {
            const status = error.response.status;
            const message = (error.response.data as any)?.message || error.message;

            switch (status) {
                case 401:
                    // Unauthorized - token expired or invalid
                    console.error('Authentication error:', message);
                    // Could dispatch logout action or redirect to login
                    break;
                case 403:
                    // Forbidden - insufficient permissions
                    console.error('Permission denied:', message);
                    break;
                case 404:
                    // Not found
                    console.error('Resource not found:', message);
                    break;
                case 422:
                    // Validation error
                    console.error('Validation error:', message);
                    break;
                case 500:
                    // Server error
                    console.error('Server error:', message);
                    break;
                default:
                    console.error(`API Error (${status}):`, message);
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('Network error - no response from server');
        } else {
            // Error in setting up the request
            console.error('Request setup error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default apiClient;