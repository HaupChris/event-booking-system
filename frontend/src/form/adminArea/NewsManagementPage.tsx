/**
 * News Management Page
 * ====================
 * Admin page for managing news items
 */

import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { TokenContext } from '../../contexts/AuthContext';
import {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  NewsItem,
  CreateNewsRequest,
} from '../../services/adminNewsService';

const NEWS_CATEGORIES = [
  { value: 'announcement', label: 'Ankündigung' },
  { value: 'timetable', label: 'Zeitplan' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'anreise', label: 'Anreise' },
  { value: 'general', label: 'Allgemein' },
];

const NewsManagementPage: React.FC = () => {
  const { token } = useContext(TokenContext);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState<CreateNewsRequest>({
    title: '',
    content: '',
    category: 'general',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await getAllNews(token, true); // Include inactive
      setNews(data);
    } catch (error) {
      console.error('Error loading news:', error);
      showSnackbar('Failed to load news', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenCreateDialog = () => {
    setSelectedNews(null);
    setFormData({ title: '', content: '', category: 'general' });
    setEditDialogOpen(true);
  };

  const handleOpenEditDialog = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      category: newsItem.category || 'general',
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedNews(null);
    setFormData({ title: '', content: '', category: 'general' });
  };

  const handleSaveNews = async () => {
    try {
      if (selectedNews) {
        // Update existing
        await updateNews(token, selectedNews.id, formData);
        showSnackbar('News updated successfully', 'success');
      } else {
        // Create new
        await createNews(token, formData);
        showSnackbar('News created successfully', 'success');
      }
      handleCloseEditDialog();
      loadNews();
    } catch (error) {
      console.error('Error saving news:', error);
      showSnackbar('Failed to save news', 'error');
    }
  };

  const handleOpenDeleteDialog = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedNews(null);
  };

  const handleDeleteNews = async () => {
    if (!selectedNews) return;

    try {
      await deleteNews(token, selectedNews.id, false); // Soft delete
      showSnackbar('News deactivated successfully', 'success');
      handleCloseDeleteDialog();
      loadNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      showSnackbar('Failed to delete news', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryLabel = (category: string | null) => {
    const found = NEWS_CATEGORIES.find((c) => c.value === category);
    return found ? found.label : 'Allgemein';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">News Management ({news.length} items)</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
          Create News
        </Button>
      </Box>

      {/* News Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {news.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {item.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={getCategoryLabel(item.category)} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell>{item.author || '-'}</TableCell>
                <TableCell>{formatDate(item.published_date)}</TableCell>
                <TableCell>
                  <Chip
                    label={item.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    color={item.is_active ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    <IconButton size="small" onClick={() => handleOpenEditDialog(item)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(item)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedNews ? 'Edit News' : 'Create News'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category || 'general'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
              >
                {NEWS_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              multiline
              rows={8}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            onClick={handleSaveNews}
            variant="contained"
            disabled={!formData.title.trim() || !formData.content.trim()}
          >
            {selectedNews ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Deactivate News</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to deactivate "{selectedNews?.title}"?
            It will no longer be visible to users.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteNews} variant="contained" color="error">
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewsManagementPage;
