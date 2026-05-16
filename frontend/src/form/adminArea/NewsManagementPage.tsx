import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Stack } from '@mui/material';
import type { CreateNewsRequest, NewsCategory, NewsItem } from '../../services/adminNewsService';
import {
  createNews,
  createNewsCategory,
  deactivateNewsCategory,
  deleteNews,
  getAllNews,
  getAllNewsCategories,
  updateNews,
} from '../../services/adminNewsService';
import { TokenContext } from '../../contexts/AuthContext';
import NewsComposerCard from './components/news/NewsComposerCard';
import NewsPreviewCard from './components/news/NewsPreviewCard';
import NewsHistoryCard from './components/news/NewsHistoryCard';
import { getActiveCount } from './components/news/newsManagement.utils';
import NewsCategoryManagerDialog from './components/news/NewsCategoryManagerDialog';
import NewsActionDialogs from './components/news/NewsActionDialogs';
import { DEFAULT_NEWS_ICON_KEY } from '../../utils/newsCategoryIcons';

const emptyForm: CreateNewsRequest = {
  title: '',
  content: '',
  category: 'general',
  is_active: true,
};

const filterNewsItems = (
  newsItems: NewsItem[],
  categoryFilter: string,
  statusFilter: 'all' | 'active' | 'inactive'
) =>
  newsItems.filter((item) => {
    const categoryMatches =
      categoryFilter === 'all' || (item.category || 'general') === categoryFilter;
    const statusMatches =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.is_active) ||
      (statusFilter === 'inactive' && !item.is_active);

    return categoryMatches && statusMatches;
  });

function NewsManagementPage() {
  const { token } = useContext(TokenContext);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateNewsRequest>(emptyForm);

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newsToToggleStatus, setNewsToToggleStatus] = useState<NewsItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<NewsItem | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryKey, setNewCategoryKey] = useState('');
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState(DEFAULT_NEWS_ICON_KEY);

  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setNews(await getAllNews(token, true));
    } catch (loadError) {
      console.error('Error loading news:', loadError);
      setError('News konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadCategories = useCallback(async () => {
    try {
      const categoryItems = await getAllNewsCategories(token, true);
      const activeCategories = categoryItems.filter((item) => item.is_active);
      setCategories(activeCategories);
    } catch (loadError) {
      console.error('Error loading news categories:', loadError);
      setError('Kategorien konnten nicht geladen werden.');
    }
  }, [token]);

  useEffect(() => {
    loadNews().then();
  }, [loadNews]);

  useEffect(() => {
    loadCategories().then();
  }, [loadCategories]);

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }

    const hasSelectedCategory = categories.some((item) => item.category_key === formData.category);
    if (!hasSelectedCategory) {
      setFormData((previous) => ({ ...previous, category: categories[0].category_key }));
    }
  }, [categories, formData.category]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingNewsId(null);
  };

  const handleSubmit = async () => {
    if (!formData.title?.trim() || !formData.content?.trim()) {
      setError('Bitte Titel und Inhalt ausfuellen.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (editingNewsId !== null) {
        await updateNews(token, editingNewsId, {
          title: formData.title.trim(),
          content: formData.content,
          category: formData.category,
          is_active: formData.is_active,
        });
        setSuccess('News-Eintrag aktualisiert.');
      } else {
        await createNews(token, {
          title: formData.title.trim(),
          content: formData.content,
          category: formData.category,
          is_active: formData.is_active,
        });
        setSuccess(
          formData.is_active === false ? 'News-Entwurf erstellt.' : 'News-Eintrag erstellt.'
        );
      }

      resetForm();
      await loadNews();
    } catch (submitError) {
      console.error('Error saving news:', submitError);
      setError('News konnten nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: NewsItem) => {
    setEditingNewsId(item.id);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category || 'general',
      is_active: item.is_active,
    });
    setError(null);
    setSuccess(null);
  };

  const openStatusDialog = (item: NewsItem) => {
    setNewsToToggleStatus(item);
    setStatusDialogOpen(true);
  };

  const closeStatusDialog = () => {
    setStatusDialogOpen(false);
    setNewsToToggleStatus(null);
  };

  const openDeleteDialog = (item: NewsItem) => {
    setNewsToDelete(item);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setNewsToDelete(null);
  };

  const handleToggleActive = async () => {
    if (!newsToToggleStatus) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const nextIsActive = !newsToToggleStatus.is_active;
      await updateNews(token, newsToToggleStatus.id, { is_active: nextIsActive });
      if (editingNewsId === newsToToggleStatus.id) {
        resetForm();
      }
      closeStatusDialog();
      setSuccess(nextIsActive ? 'News-Eintrag aktiviert.' : 'News-Eintrag deaktiviert.');
      await loadNews();
    } catch (toggleError) {
      console.error('Error toggling news status:', toggleError);
      setError('Status des News-Eintrags konnte nicht geaendert werden.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePermanent = async () => {
    if (!newsToDelete) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await deleteNews(token, newsToDelete.id, true);
      if (editingNewsId === newsToDelete.id) {
        resetForm();
      }
      closeDeleteDialog();
      setSuccess('News-Eintrag endgueltig geloescht.');
      await loadNews();
    } catch (deleteError) {
      console.error('Error permanently deleting news:', deleteError);
      setError('News-Eintrag konnte nicht endgueltig geloescht werden.');
    } finally {
      setSaving(false);
    }
  };

  const filteredNews = useMemo(
    () => filterNewsItems(news, categoryFilter, statusFilter),
    [categoryFilter, news, statusFilter]
  );

  const activeCount = useMemo(() => getActiveCount(news), [news]);

  const normalizedCategoryKey = newCategoryKey
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const canCreateCategory = Boolean(normalizedCategoryKey) && Boolean(newCategoryLabel.trim());

  const handleCreateCategory = async () => {
    if (!canCreateCategory) {
      setError('Bitte Kategorie-Key und Anzeigename ausfuellen.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await createNewsCategory(token, {
        category_key: normalizedCategoryKey,
        label: newCategoryLabel.trim(),
        icon: newCategoryIcon,
      });
      setSuccess('Kategorie angelegt.');
      setNewCategoryKey('');
      setNewCategoryLabel('');
      setNewCategoryIcon(DEFAULT_NEWS_ICON_KEY);
      await loadCategories();
    } catch (createError) {
      console.error('Error creating category:', createError);
      setError('Kategorie konnte nicht angelegt werden.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateCategory = async (category: NewsCategory) => {
    try {
      setSaving(true);
      setError(null);
      await deactivateNewsCategory(token, category.id);
      setSuccess('Kategorie deaktiviert.');
      await loadCategories();
    } catch (deactivateError) {
      console.error('Error deactivating category:', deactivateError);
      setError('Kategorie konnte nicht deaktiviert werden.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(320px, 5fr) minmax(420px, 7fr)',
          },
        }}
      >
        <NewsComposerCard
          formData={formData}
          categories={categories}
          isEditing={editingNewsId !== null}
          saving={saving}
          onChangeForm={setFormData}
          onSubmit={handleSubmit}
          onReset={resetForm}
          onOpenCategoryManager={() => setCategoryDialogOpen(true)}
        />

        <Stack spacing={2}>
          <NewsPreviewCard formData={formData} />
          <NewsHistoryCard
            news={filteredNews}
            categories={categories}
            activeCount={activeCount}
            categoryFilter={categoryFilter}
            statusFilter={statusFilter}
            loading={loading}
            saving={saving}
            onChangeCategoryFilter={setCategoryFilter}
            onChangeStatusFilter={setStatusFilter}
            onEdit={handleEdit}
            onToggleActive={openStatusDialog}
            onDeletePermanent={openDeleteDialog}
          />
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <NewsActionDialogs
        saving={saving}
        statusDialogOpen={statusDialogOpen}
        newsToToggleStatus={newsToToggleStatus}
        deleteDialogOpen={deleteDialogOpen}
        newsToDelete={newsToDelete}
        onCloseStatus={closeStatusDialog}
        onConfirmToggleActive={handleToggleActive}
        onCloseDelete={closeDeleteDialog}
        onConfirmDeletePermanent={handleDeletePermanent}
      />

      <NewsCategoryManagerDialog
        open={categoryDialogOpen}
        categories={categories}
        loading={saving}
        newCategoryKey={newCategoryKey}
        newCategoryLabel={newCategoryLabel}
        newCategoryIcon={newCategoryIcon}
        onClose={() => setCategoryDialogOpen(false)}
        onChangeKey={setNewCategoryKey}
        onChangeLabel={setNewCategoryLabel}
        onChangeIcon={setNewCategoryIcon}
        onCreateCategory={handleCreateCategory}
        onDeactivateCategory={handleDeactivateCategory}
      />
    </Box>
  );
}

export default NewsManagementPage;
