import React from 'react';
import { Alert } from '@mui/material';
import type { NewsCategory, NewsItem } from '../../../../services/adminNewsService';
import NewsActionDialogs from './NewsActionDialogs';
import NewsCategoryManagerDialog from './NewsCategoryManagerDialog';

interface NewsManagementOverlaysProps {
  error: string | null;
  success: string | null;
  saving: boolean;
  statusDialogOpen: boolean;
  newsToToggleStatus: NewsItem | null;
  deleteDialogOpen: boolean;
  newsToDelete: NewsItem | null;
  categoryDialogOpen: boolean;
  categories: NewsCategory[];
  newCategoryKey: string;
  newCategoryLabel: string;
  newCategoryIcon: string;
  onCloseError: () => void;
  onCloseSuccess: () => void;
  onCloseStatus: () => void;
  onConfirmToggleActive: () => void;
  onCloseDelete: () => void;
  onConfirmDeletePermanent: () => void;
  onCloseCategoryDialog: () => void;
  onChangeKey: (value: string) => void;
  onChangeLabel: (value: string) => void;
  onChangeIcon: (value: string) => void;
  onCreateCategory: () => void;
  onDeactivateCategory: (category: NewsCategory) => void;
}

function NewsManagementOverlays({
  error,
  success,
  saving,
  statusDialogOpen,
  newsToToggleStatus,
  deleteDialogOpen,
  newsToDelete,
  categoryDialogOpen,
  categories,
  newCategoryKey,
  newCategoryLabel,
  newCategoryIcon,
  onCloseError,
  onCloseSuccess,
  onCloseStatus,
  onConfirmToggleActive,
  onCloseDelete,
  onConfirmDeletePermanent,
  onCloseCategoryDialog,
  onChangeKey,
  onChangeLabel,
  onChangeIcon,
  onCreateCategory,
  onDeactivateCategory,
}: NewsManagementOverlaysProps) {
  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={onCloseError}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={onCloseSuccess}>
          {success}
        </Alert>
      )}

      <NewsActionDialogs
        saving={saving}
        statusDialogOpen={statusDialogOpen}
        newsToToggleStatus={newsToToggleStatus}
        deleteDialogOpen={deleteDialogOpen}
        newsToDelete={newsToDelete}
        onCloseStatus={onCloseStatus}
        onConfirmToggleActive={onConfirmToggleActive}
        onCloseDelete={onCloseDelete}
        onConfirmDeletePermanent={onConfirmDeletePermanent}
      />

      <NewsCategoryManagerDialog
        open={categoryDialogOpen}
        categories={categories}
        loading={saving}
        newCategoryKey={newCategoryKey}
        newCategoryLabel={newCategoryLabel}
        newCategoryIcon={newCategoryIcon}
        onClose={onCloseCategoryDialog}
        onChangeKey={onChangeKey}
        onChangeLabel={onChangeLabel}
        onChangeIcon={onChangeIcon}
        onCreateCategory={onCreateCategory}
        onDeactivateCategory={onDeactivateCategory}
      />
    </>
  );
}

export default NewsManagementOverlays;
