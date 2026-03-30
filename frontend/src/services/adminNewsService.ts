/**
 * Admin News Service
 * ==================
 * API client for admin news management operations
 */

import axios from 'axios';
import { API_URL } from '../config/env';

const API_BASE_URL = API_URL || 'http://localhost:5001';

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string | null;
  author: string | null;
  published_date: string;
  is_active: boolean;
}

export interface CreateNewsRequest {
  title: string;
  content: string;
  category?: string;
  author?: string;
}

export interface UpdateNewsRequest {
  title?: string;
  content?: string;
  category?: string;
  author?: string;
}

/**
 * Get all news items (admin)
 */
export const getAllNews = async (token: string, includeInactive = false): Promise<NewsItem[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/news`, {
      params: { include_inactive: includeInactive },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.news;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

/**
 * Get a specific news item by ID
 */
export const getNewsById = async (token: string, newsId: number): Promise<NewsItem> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/news/${newsId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching news item:', error);
    throw error;
  }
};

/**
 * Create a new news item
 */
export const createNews = async (token: string, data: CreateNewsRequest): Promise<number> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/news`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.id;
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
};

/**
 * Update an existing news item
 */
export const updateNews = async (
  token: string,
  newsId: number,
  data: UpdateNewsRequest
): Promise<void> => {
  try {
    await axios.put(`${API_BASE_URL}/api/admin/news/${newsId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
};

/**
 * Delete a news item
 */
export const deleteNews = async (
  token: string,
  newsId: number,
  permanent = false
): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/admin/news/${newsId}`, {
      params: { permanent },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    throw error;
  }
};
