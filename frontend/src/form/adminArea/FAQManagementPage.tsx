import React, { useContext, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Snackbar, Tab, Tabs, Typography } from '@mui/material';
import { TokenContext } from '../../contexts/AuthContext';
import type { FAQ, FAQCategory } from '../../services/adminFaqService';
import CategoryDialog from './components/CategoryDialog';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import FAQCategoryTab from './components/FAQCategoryTab';
import FAQDialog from './components/FAQDialog';
import FAQListTab from './components/FAQListTab';
import { useFAQManagement } from './hooks/useFAQManagement';

const getCategoryName = (id: number, categories: FAQCategory[]) =>
  categories.find((category) => category.id === id)?.name || 'Unknown';

const getFAQCount = (categoryId: number, faqs: FAQ[]) =>
  faqs.filter((faq) => faq.category_id === categoryId).length;

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.substring(0, max)}...` : text;

const FAQManagementPage: React.FC = () => {
  const { token } = useContext(TokenContext);
  const [activeTab, setActiveTab] = useState(0);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [faqDeleteDialogOpen, setFaqDeleteDialogOpen] = useState(false);
  const [categoryDeleteDialogOpen, setCategoryDeleteDialogOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | 'all'>('all');

  const {
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
  } = useFAQManagement(token);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.display_order - b.display_order),
    [categories]
  );

  const filteredFAQs = useMemo(
    () =>
      selectedCategoryFilter === 'all'
        ? faqs
        : faqs.filter((faq) => faq.category_id === selectedCategoryFilter),
    [faqs, selectedCategoryFilter]
  );

  const handleOpenCreateFAQDialog = () => {
    setSelectedFAQ(null);
    setFaqFormData({
      question: '',
      answer: '',
      category_id: categories[0]?.id || 0,
      display_order: 0,
    });
    setFaqDialogOpen(true);
  };

  const handleOpenEditFAQDialog = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setFaqFormData({
      question: faq.question,
      answer: faq.answer,
      category_id: faq.category_id,
      display_order: faq.display_order,
    });
    setFaqDialogOpen(true);
  };

  const handleOpenCreateCategoryDialog = () => {
    setSelectedCategory(null);
    setCategoryFormData({ name: '', display_order: undefined });
    setCategoryDialogOpen(true);
  };

  const handleOpenEditCategoryDialog = (category: FAQCategory) => {
    setSelectedCategory(category);
    setCategoryFormData({ name: category.name, display_order: undefined });
    setCategoryDialogOpen(true);
  };

  const handleOpenDeleteFAQDialog = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setFaqDeleteDialogOpen(true);
  };

  const handleOpenDeleteCategoryDialog = (category: FAQCategory) => {
    setSelectedCategory(category);
    setCategoryDeleteDialogOpen(true);
  };

  const onSaveFAQ = async () => {
    const success = await handleSaveFAQ();
    if (success) {
      setFaqDialogOpen(false);
    }
  };

  const onDeleteFAQ = async () => {
    if (!selectedFAQ) {
      return;
    }
    const success = await handleDeleteFAQ(selectedFAQ.id);
    if (success) {
      setFaqDeleteDialogOpen(false);
    }
  };

  const onSaveCategory = async () => {
    const success = await handleSaveCategory();
    if (success) {
      setCategoryDialogOpen(false);
    }
  };

  const onDeleteCategory = async () => {
    if (!selectedCategory) {
      return;
    }
    const success = await handleDeleteCategory(selectedCategory.id);
    if (success) {
      setCategoryDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const selectedCategoryFaqCount = selectedCategory ? getFAQCount(selectedCategory.id, faqs) : 0;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        FAQ Management
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="FAQs" />
        <Tab label="Categories" />
      </Tabs>

      {activeTab === 0 && (
        <FAQListTab
          selectedCategoryFilter={selectedCategoryFilter}
          categories={categories}
          filteredFAQs={filteredFAQs}
          onFilterChange={setSelectedCategoryFilter}
          getCategoryName={(id) => getCategoryName(id, categories)}
          truncate={truncate}
          onCreateFAQ={handleOpenCreateFAQDialog}
          onEditFAQ={handleOpenEditFAQDialog}
          onDeleteFAQ={handleOpenDeleteFAQDialog}
        />
      )}

      {activeTab === 1 && (
        <FAQCategoryTab
          categories={sortedCategories}
          getFAQCount={(id) => getFAQCount(id, faqs)}
          onCreateCategory={handleOpenCreateCategoryDialog}
          onEditCategory={handleOpenEditCategoryDialog}
          onDeleteCategory={handleOpenDeleteCategoryDialog}
          onMoveCategory={handleMoveCategory}
        />
      )}

      <FAQDialog
        open={faqDialogOpen}
        selectedFAQ={selectedFAQ}
        faqFormData={faqFormData}
        categories={categories}
        onClose={() => setFaqDialogOpen(false)}
        onSave={onSaveFAQ}
        onChange={setFaqFormData}
      />

      <CategoryDialog
        open={categoryDialogOpen}
        selectedCategory={selectedCategory}
        categoryFormData={categoryFormData}
        onClose={() => setCategoryDialogOpen(false)}
        onSave={onSaveCategory}
        onChange={setCategoryFormData}
      />

      <DeleteConfirmDialog
        open={faqDeleteDialogOpen}
        title="Delete FAQ?"
        message="Are you sure you want to delete this FAQ?"
        itemName={selectedFAQ?.question}
        onClose={() => setFaqDeleteDialogOpen(false)}
        onConfirm={onDeleteFAQ}
      />

      <DeleteConfirmDialog
        open={categoryDeleteDialogOpen}
        title="Delete Category?"
        message={
          selectedCategoryFaqCount > 0
            ? `This category contains ${selectedCategoryFaqCount} FAQ(s). Please reassign or delete them first.`
            : `Are you sure you want to deactivate "${selectedCategory?.name}"? It will no longer be visible to users.`
        }
        onClose={() => setCategoryDeleteDialogOpen(false)}
        onConfirm={onDeleteCategory}
        disabled={selectedCategoryFaqCount > 0}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FAQManagementPage;
