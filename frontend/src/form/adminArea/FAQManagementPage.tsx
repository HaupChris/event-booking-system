import React, { useContext, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  DeleteForever as DeleteForeverIcon,
  Edit as EditIcon,
  PauseCircleOutline as PauseCircleOutlineIcon,
  PublishedWithChanges as PublishedWithChangesIcon,
} from '@mui/icons-material';
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

type FAQActionType = 'deactivate' | 'reactivate' | 'delete_permanent';
type CategoryActionType = 'deactivate' | 'reactivate' | 'delete_permanent';

const FAQManagementPage: React.FC = () => {
  const { token } = useContext(TokenContext);
  const [activeTab, setActiveTab] = useState(0);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [faqActionType, setFaqActionType] = useState<FAQActionType | null>(null);
  const [categoryActionType, setCategoryActionType] = useState<CategoryActionType | null>(null);
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
    handleSetFAQActive,
    handleDeleteFAQ,
    handleSaveCategory,
    handleSetCategoryActive,
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

  const handleOpenToggleFAQStatusDialog = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setFaqActionType(faq.is_active ? 'deactivate' : 'reactivate');
  };

  const handleOpenDeleteFAQDialog = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setFaqActionType('delete_permanent');
  };

  const closeFAQActionDialog = () => {
    setFaqActionType(null);
    setSelectedFAQ(null);
  };

  const handleOpenToggleCategoryStatusDialog = (category: FAQCategory) => {
    setSelectedCategory(category);
    setCategoryActionType(category.is_active ? 'deactivate' : 'reactivate');
  };

  const handleOpenDeleteCategoryDialog = (category: FAQCategory) => {
    setSelectedCategory(category);
    setCategoryActionType('delete_permanent');
  };

  const closeCategoryActionDialog = () => {
    setCategoryActionType(null);
    setSelectedCategory(null);
  };

  const onSaveFAQ = async () => {
    const success = await handleSaveFAQ();
    if (success) {
      setFaqDialogOpen(false);
    }
  };

  const onConfirmFAQAction = async () => {
    if (!selectedFAQ || !faqActionType) {
      return;
    }

    let success = false;
    if (faqActionType === 'deactivate') {
      success = await handleSetFAQActive(selectedFAQ.id, false);
    } else if (faqActionType === 'reactivate') {
      success = await handleSetFAQActive(selectedFAQ.id, true);
    } else {
      success = await handleDeleteFAQ(selectedFAQ.id, true);
    }

    if (success) {
      closeFAQActionDialog();
    }
  };

  const onSaveCategory = async () => {
    const success = await handleSaveCategory();
    if (success) {
      setCategoryDialogOpen(false);
    }
  };

  const onConfirmCategoryAction = async () => {
    if (!selectedCategory || !categoryActionType) {
      return;
    }

    let success = false;
    if (categoryActionType === 'deactivate') {
      success = await handleSetCategoryActive(selectedCategory.id, false);
    } else if (categoryActionType === 'reactivate') {
      success = await handleSetCategoryActive(selectedCategory.id, true);
    } else {
      success = await handleDeleteCategory(selectedCategory.id, true);
    }

    if (success) {
      closeCategoryActionDialog();
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

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Icon-Legende
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, md: 2 }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <EditIcon fontSize="small" />
            <Typography variant="body2">Bearbeiten</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <PauseCircleOutlineIcon fontSize="small" />
            <Typography variant="body2">Deaktivieren</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <PublishedWithChangesIcon fontSize="small" />
            <Typography variant="body2">Reaktivieren</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <DeleteForeverIcon fontSize="small" />
            <Typography variant="body2">Dauerhaft loeschen</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <ArrowUpwardIcon fontSize="small" />
            <ArrowDownwardIcon fontSize="small" />
            <Typography variant="body2">Reihenfolge aendern</Typography>
          </Stack>
        </Stack>
      </Alert>

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
          onToggleFAQActive={handleOpenToggleFAQStatusDialog}
          onDeleteFAQPermanent={handleOpenDeleteFAQDialog}
        />
      )}

      {activeTab === 1 && (
        <FAQCategoryTab
          categories={sortedCategories}
          getFAQCount={(id) => getFAQCount(id, faqs)}
          onCreateCategory={handleOpenCreateCategoryDialog}
          onEditCategory={handleOpenEditCategoryDialog}
          onToggleCategoryActive={handleOpenToggleCategoryStatusDialog}
          onDeleteCategoryPermanent={handleOpenDeleteCategoryDialog}
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
        open={Boolean(faqActionType)}
        title={
          faqActionType === 'reactivate'
            ? 'FAQ reaktivieren?'
            : faqActionType === 'delete_permanent'
              ? 'FAQ dauerhaft loeschen?'
              : 'FAQ deaktivieren?'
        }
        message={
          faqActionType === 'reactivate'
            ? 'Dieser FAQ-Eintrag wird wieder sichtbar gemacht.'
            : faqActionType === 'delete_permanent'
              ? 'Dieser FAQ-Eintrag wird dauerhaft entfernt und kann nicht wiederhergestellt werden.'
              : 'Dieser FAQ-Eintrag wird ausgeblendet, kann spaeter aber wieder aktiviert werden.'
        }
        itemName={selectedFAQ?.question}
        onClose={closeFAQActionDialog}
        onConfirm={onConfirmFAQAction}
        confirmLabel={
          faqActionType === 'reactivate'
            ? 'Reaktivieren'
            : faqActionType === 'delete_permanent'
              ? 'Dauerhaft loeschen'
              : 'Deaktivieren'
        }
        confirmColor={faqActionType === 'reactivate' ? 'success' : 'error'}
      />

      <DeleteConfirmDialog
        open={Boolean(categoryActionType)}
        title={
          categoryActionType === 'reactivate'
            ? 'Kategorie reaktivieren?'
            : categoryActionType === 'delete_permanent'
              ? 'Kategorie dauerhaft loeschen?'
              : 'Kategorie deaktivieren?'
        }
        message={
          categoryActionType === 'reactivate'
            ? 'Diese Kategorie wird wieder sichtbar gemacht.'
            : categoryActionType === 'delete_permanent'
              ? selectedCategoryFaqCount > 0
                ? `Diese Kategorie enthaelt ${selectedCategoryFaqCount} FAQ(s). Beim dauerhaften Loeschen werden die FAQ-Eintraege ebenfalls entfernt.`
                : 'Diese Kategorie wird dauerhaft entfernt und kann nicht wiederhergestellt werden.'
              : `"${selectedCategory?.name}" wird ausgeblendet, kann spaeter aber wieder aktiviert werden.`
        }
        onClose={closeCategoryActionDialog}
        onConfirm={onConfirmCategoryAction}
        confirmLabel={
          categoryActionType === 'reactivate'
            ? 'Reaktivieren'
            : categoryActionType === 'delete_permanent'
              ? 'Dauerhaft loeschen'
              : 'Deaktivieren'
        }
        confirmColor={categoryActionType === 'reactivate' ? 'success' : 'error'}
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
