import { useState, useEffect, useCallback } from 'react';
import type {
  FAQ,
  FAQCategory,
  CreateFAQRequest,
  CreateFAQCategoryRequest,
} from '../../../services/adminFaqService';
import {
  getAllFAQs,
  getAllFAQCategories,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  createFAQCategory,
  updateFAQCategory,
  deleteFAQCategory,
} from '../../../services/adminFaqService';

export const useFAQManagement = (token: string) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | null>(null);
  const [faqFormData, setFaqFormData] = useState<CreateFAQRequest>({
    question: '',
    answer: '',
    category_id: 0,
    display_order: 0,
  });
  const [categoryFormData, setCategoryFormData] = useState<CreateFAQCategoryRequest>({
    name: '',
    display_order: undefined,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'info',
  });

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [faqsData, categoriesData] = await Promise.all([
        getAllFAQs(token, true),
        getAllFAQCategories(token, true),
      ]);
      setFaqs(faqsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, showSnackbar]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveFAQ = async () => {
    try {
      if (selectedFAQ) {
        await updateFAQ(token, selectedFAQ.id, faqFormData);
        showSnackbar('FAQ updated successfully', 'success');
      } else {
        await createFAQ(token, faqFormData);
        showSnackbar('FAQ created successfully', 'success');
      }
      loadData();
      return true;
    } catch (error) {
      console.error('Error saving FAQ:', error);
      showSnackbar('Failed to save FAQ', 'error');
      return false;
    }
  };

  const handleDeleteFAQ = async (faqId: number) => {
    try {
      await deleteFAQ(token, faqId, false);
      showSnackbar('FAQ deactivated successfully', 'success');
      loadData();
      return true;
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      showSnackbar('Failed to delete FAQ', 'error');
      return false;
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (selectedCategory) {
        await updateFAQCategory(token, selectedCategory.id, categoryFormData);
        showSnackbar('Category updated successfully', 'success');
      } else {
        await createFAQCategory(token, categoryFormData);
        showSnackbar('Category created successfully', 'success');
      }
      loadData();
      return true;
    } catch (error) {
      console.error('Error saving category:', error);
      showSnackbar('Failed to save category', 'error');
      return false;
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await deleteFAQCategory(token, categoryId, false);
      showSnackbar('Category deactivated successfully', 'success');
      loadData();
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      showSnackbar('Failed to delete category', 'error');
      return false;
    }
  };

  const handleMoveCategory = async (category: FAQCategory, direction: 'up' | 'down') => {
    const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);
    const currentIndex = sortedCategories.findIndex((c) => c.id === category.id);

    if (direction === 'up' && currentIndex > 0) {
      const prevCategory = sortedCategories[currentIndex - 1];
      try {
        await Promise.all([
          updateFAQCategory(token, category.id, { display_order: prevCategory.display_order }),
          updateFAQCategory(token, prevCategory.id, { display_order: category.display_order }),
        ]);
        showSnackbar('Category reordered successfully', 'success');
        loadData();
      } catch (error) {
        console.error('Error reordering category:', error);
        showSnackbar('Failed to reorder category', 'error');
      }
    } else if (direction === 'down' && currentIndex < sortedCategories.length - 1) {
      const nextCategory = sortedCategories[currentIndex + 1];
      try {
        await Promise.all([
          updateFAQCategory(token, category.id, { display_order: nextCategory.display_order }),
          updateFAQCategory(token, nextCategory.id, { display_order: category.display_order }),
        ]);
        showSnackbar('Category reordered successfully', 'success');
        loadData();
      } catch (error) {
        console.error('Error reordering category:', error);
        showSnackbar('Failed to reorder category', 'error');
      }
    }
  };

  return {
    faqs,
    categories,
    loading,
    selectedFAQ,
    setSelectedFAQ,
    selectedCategory,
    setSelectedCategory,
    faqFormData,
    setFaqFormData,
    categoryFormData,
    setCategoryFormData,
    snackbar,
    setSnackbar,
    handleSaveFAQ,
    handleDeleteFAQ,
    handleSaveCategory,
    handleDeleteCategory,
    handleMoveCategory,
  };
};
