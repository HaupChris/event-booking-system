/**
 * Admin FAQ Service
 * ==================
 * API client for admin FAQ management operations
 */

import axios from 'axios';
import { API_URL } from '../config/env';

const API_BASE_URL = API_URL || '';

export interface FAQCategory {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
  created_date: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category_id: number;
  category_name?: string;
  display_order: number;
  is_active: boolean;
  created_date: string;
  updated_date: string;
}

export interface CreateFAQRequest {
  question: string;
  answer: string;
  category_id: number;
  display_order?: number;
}

export interface UpdateFAQRequest {
  question?: string;
  answer?: string;
  category_id?: number;
  display_order?: number;
  is_active?: boolean;
}

export interface CreateFAQCategoryRequest {
  name: string;
  display_order?: number;
}

export interface UpdateFAQCategoryRequest {
  name?: string;
  display_order?: number;
  is_active?: boolean;
}

/**
 * Get all FAQs (admin)
 */
export const getAllFAQs = async (
  token: string,
  includeInactive = false,
  categoryId?: number
): Promise<FAQ[]> => {
  try {
    const params: { include_inactive: boolean; category_id?: number } = {
      include_inactive: includeInactive,
    };
    if (categoryId !== undefined) {
      params.category_id = categoryId;
    }
    const response = await axios.get(`${API_BASE_URL}/api/admin/faqs`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.faqs;
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    throw error;
  }
};

/**
 * Get a specific FAQ by ID
 */
export const getFAQById = async (token: string, faqId: number): Promise<FAQ> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/faqs/${faqId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    throw error;
  }
};

/**
 * Create a new FAQ
 */
export const createFAQ = async (token: string, data: CreateFAQRequest): Promise<number> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/faqs`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.id;
  } catch (error) {
    console.error('Error creating FAQ:', error);
    throw error;
  }
};

/**
 * Update an existing FAQ
 */
export const updateFAQ = async (
  token: string,
  faqId: number,
  data: UpdateFAQRequest
): Promise<void> => {
  try {
    await axios.put(`${API_BASE_URL}/api/admin/faqs/${faqId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    throw error;
  }
};

/**
 * Delete a FAQ
 */
export const deleteFAQ = async (token: string, faqId: number, permanent = false): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/admin/faqs/${faqId}`, {
      params: { permanent },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    throw error;
  }
};

/**
 * Get all FAQ categories (admin)
 */
export const getAllFAQCategories = async (
  token: string,
  includeInactive = false
): Promise<FAQCategory[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/faq-categories`, {
      params: { include_inactive: includeInactive },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.categories;
  } catch (error) {
    console.error('Error fetching FAQ categories:', error);
    throw error;
  }
};

/**
 * Get a specific FAQ category by ID
 */
export const getFAQCategoryById = async (
  token: string,
  categoryId: number
): Promise<FAQCategory> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/faq-categories/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching FAQ category:', error);
    throw error;
  }
};

/**
 * Create a new FAQ category
 */
export const createFAQCategory = async (
  token: string,
  data: CreateFAQCategoryRequest
): Promise<number> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/faq-categories`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.id;
  } catch (error) {
    console.error('Error creating FAQ category:', error);
    throw error;
  }
};

/**
 * Update an existing FAQ category
 */
export const updateFAQCategory = async (
  token: string,
  categoryId: number,
  data: UpdateFAQCategoryRequest
): Promise<void> => {
  try {
    await axios.put(`${API_BASE_URL}/api/admin/faq-categories/${categoryId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating FAQ category:', error);
    throw error;
  }
};

/**
 * Delete a FAQ category
 */
export const deleteFAQCategory = async (
  token: string,
  categoryId: number,
  permanent = false
): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/admin/faq-categories/${categoryId}`, {
      params: { permanent },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error deleting FAQ category:', error);
    throw error;
  }
};
