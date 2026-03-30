/**
 * API service layer - provides typed methods for all API endpoints
 */

import apiClient from './apiClient';
import type { FormContent } from '../form/userArea/interface';
import type { ArtistFormContent } from '../form/artistArea/interface';

/**
 * Regular booking endpoints
 */
export const bookingApi = {
    getAll: () => apiClient.get('/api/data'),
    getById: (id: number) => apiClient.get(`/api/booking/${id}`),
    create: (data: unknown) => apiClient.post('/api/booking', data),
    update: (id: number, data: unknown) => apiClient.put(`/api/booking/${id}`, data),
    delete: (id: number) => apiClient.delete(`/api/booking/${id}`),
    updatePaymentStatus: (id: number, paymentReceived: boolean) =>
        apiClient.put(`/api/booking/${id}`, { payment_received: paymentReceived }),
};

/**
 * Artist booking endpoints
 */
export const artistBookingApi = {
    getAll: () => apiClient.get('/api/artist/data'),
    getById: (id: number) => apiClient.get(`/api/artist/booking/${id}`),
    create: (data: unknown) => apiClient.post('/api/artist/booking', data),
    update: (id: number, data: unknown) => apiClient.put(`/api/artist/booking/${id}`, data),
    delete: (id: number) => apiClient.delete(`/api/artist/booking/${id}`),
    updatePaymentStatus: (id: number, paymentReceived: boolean) =>
        apiClient.put(`/api/artist/booking/${id}`, { payment_received: paymentReceived }),
};

/**
 * Form content endpoints
 */
export const formContentApi = {
    getRegular: () => apiClient.get<FormContent>('/api/formcontent'),
    getArtist: () => apiClient.get<ArtistFormContent>('/api/artist/formcontent'),
};

/**
 * Export endpoints
 */
export const exportApi = {
    exportRegularBookings: () => apiClient.get('/api/export', { responseType: 'blob' }),
    exportArtistBookings: () => apiClient.get('/api/artist/export', { responseType: 'blob' }),
    exportAllBookings: () => apiClient.get('/api/export/all', { responseType: 'blob' }),
};

/**
 * Shift assignment endpoints
 */
export const shiftAssignmentApi = {
    getAll: () => apiClient.get('/api/shift-assignments'),
    assign: (data: unknown) => apiClient.post('/api/shift-assignments', data),
    update: (id: number, data: unknown) => apiClient.put(`/api/shift-assignments/${id}`, data),
    delete: (id: number) => apiClient.delete(`/api/shift-assignments/${id}`),
    assignBulk: (data: unknown) => apiClient.post('/api/shift-assignments/bulk', data),
};

/**
 * Combined API export - provides all API methods in one place
 */
export const api = {
    bookings: bookingApi,
    artistBookings: artistBookingApi,
    formContent: formContentApi,
    export: exportApi,
    shiftAssignments: shiftAssignmentApi,
};

export default api;
