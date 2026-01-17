import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel,
  Snackbar, Alert, CircularProgress, Tabs, Tab,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { TokenContext } from '../../contexts/AuthContext';
import type { FAQ, FAQCategory, CreateFAQRequest, CreateFAQCategoryRequest } from '../../services/adminFaqService';
import { getAllFAQs, getAllFAQCategories, createFAQ, updateFAQ, deleteFAQ, createFAQCategory, updateFAQCategory, deleteFAQCategory } from '../../services/adminFaqService';

const FAQManagementPage: React.FC = () => {
  const { token } = useContext(TokenContext);
  const [activeTab, setActiveTab] = useState(0);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [faqDeleteDialogOpen, setFaqDeleteDialogOpen] = useState(false);
  const [categoryDeleteDialogOpen, setCategoryDeleteDialogOpen] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | 'all'>('all');
  const [faqFormData, setFaqFormData] = useState<CreateFAQRequest>({ question: '', answer: '', category_id: 0, display_order: 0 });
  const [categoryFormData, setCategoryFormData] = useState<CreateFAQCategoryRequest>({ name: '', display_order: undefined });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [faqsData, categoriesData] = await Promise.all([getAllFAQs(token, true), getAllFAQCategories(token, true)]);
      setFaqs(faqsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredFAQs = selectedCategoryFilter === 'all' ? faqs : faqs.filter(f => f.category_id === selectedCategoryFilter);
  const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'Unknown';
  const getFAQCount = (categoryId: number) => faqs.filter(f => f.category_id === categoryId).length;
  const truncate = (text: string, max: number) => text.length > max ? text.substring(0, max) + '...' : text;

  // FAQ Handlers
  const handleOpenCreateFAQDialog = () => {
    setSelectedFAQ(null);
    setFaqFormData({ question: '', answer: '', category_id: categories[0]?.id || 0, display_order: 0 });
    setFaqDialogOpen(true);
  };

  const handleOpenEditFAQDialog = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setFaqFormData({ question: faq.question, answer: faq.answer, category_id: faq.category_id, display_order: faq.display_order });
    setFaqDialogOpen(true);
  };

  const handleSaveFAQ = async () => {
    try {
      if (selectedFAQ) {
        await updateFAQ(token, selectedFAQ.id, faqFormData);
        showSnackbar('FAQ updated successfully', 'success');
      } else {
        await createFAQ(token, faqFormData);
        showSnackbar('FAQ created successfully', 'success');
      }
      setFaqDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      showSnackbar('Failed to save FAQ', 'error');
    }
  };

  const handleDeleteFAQ = async () => {
    if (!selectedFAQ) return;
    try {
      await deleteFAQ(token, selectedFAQ.id, false);
      showSnackbar('FAQ deactivated successfully', 'success');
      setFaqDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      showSnackbar('Failed to delete FAQ', 'error');
    }
  };

  // Category Handlers
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

  const handleSaveCategory = async () => {
    try {
      if (selectedCategory) {
        await updateFAQCategory(token, selectedCategory.id, categoryFormData);
        showSnackbar('Category updated successfully', 'success');
      } else {
        await createFAQCategory(token, categoryFormData);
        showSnackbar('Category created successfully', 'success');
      }
      setCategoryDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving category:', error);
      showSnackbar('Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    try {
      await deleteFAQCategory(token, selectedCategory.id, false);
      showSnackbar('Category deactivated successfully', 'success');
      setCategoryDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      showSnackbar('Failed to delete category', 'error');
    }
  };

  const handleMoveCategory = async (category: FAQCategory, direction: 'up' | 'down') => {
    const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);
    const currentIndex = sortedCategories.findIndex(c => c.id === category.id);

    if (direction === 'up' && currentIndex > 0) {
      const prevCategory = sortedCategories[currentIndex - 1];
      try {
        await Promise.all([
          updateFAQCategory(token, category.id, { display_order: prevCategory.display_order }),
          updateFAQCategory(token, prevCategory.id, { display_order: category.display_order })
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
          updateFAQCategory(token, nextCategory.id, { display_order: category.display_order })
        ]);
        showSnackbar('Category reordered successfully', 'success');
        loadData();
      } catch (error) {
        console.error('Error reordering category:', error);
        showSnackbar('Failed to reorder category', 'error');
      }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>FAQ Management</Typography>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="FAQs" />
        <Tab label="Categories" />
      </Tabs>

      {activeTab === 0 && (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Category Filter</InputLabel>
              <Select value={selectedCategoryFilter} onChange={(e) => setSelectedCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} label="Category Filter">
                <MenuItem value="all">All Categories</MenuItem>
                {categories.filter(c => c.is_active).map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateFAQDialog}>Create FAQ</Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Question</TableCell>
                  <TableCell>Answer</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFAQs.map((faq) => (
                  <TableRow key={faq.id} hover>
                    <TableCell><Typography variant="body2">{truncate(faq.question, 60)}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{truncate(faq.answer, 60)}</Typography></TableCell>
                    <TableCell><Chip label={getCategoryName(faq.category_id)} size="small" color="primary" /></TableCell>
                    <TableCell>{faq.display_order}</TableCell>
                    <TableCell><Chip label={faq.is_active ? 'Active' : 'Inactive'} size="small" color={faq.is_active ? 'success' : 'default'} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenEditFAQDialog(faq)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => { setSelectedFAQ(faq); setFaqDeleteDialogOpen(true); }}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {activeTab === 1 && (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateCategoryDialog}>Create Category</Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>FAQ Count</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedCategories.map((category, index) => (
                  <TableRow key={category.id} hover>
                    <TableCell><Typography variant="body2" fontWeight="medium">{category.name}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton size="small" onClick={() => handleMoveCategory(category, 'up')} disabled={index === 0}>
                          <ArrowUpward fontSize="small" />
                        </IconButton>
                        <Typography variant="body2">{category.display_order}</Typography>
                        <IconButton size="small" onClick={() => handleMoveCategory(category, 'down')} disabled={index === sortedCategories.length - 1}>
                          <ArrowDownward fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>{getFAQCount(category.id)}</TableCell>
                    <TableCell><Chip label={category.is_active ? 'Active' : 'Inactive'} size="small" color={category.is_active ? 'success' : 'default'} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenEditCategoryDialog(category)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => { setSelectedCategory(category); setCategoryDeleteDialogOpen(true); }}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Dialog open={faqDialogOpen} onClose={() => setFaqDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedFAQ ? 'Edit FAQ' : 'Create FAQ'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField fullWidth label="Question" value={faqFormData.question} onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })} required />
            <TextField fullWidth label="Answer" value={faqFormData.answer} onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })} multiline rows={4} required />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select value={faqFormData.category_id} onChange={(e) => setFaqFormData({ ...faqFormData, category_id: Number(e.target.value) })} label="Category">
                {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField fullWidth label="Display Order" type="number" value={faqFormData.display_order} onChange={(e) => setFaqFormData({ ...faqFormData, display_order: Number(e.target.value) })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFaqDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveFAQ} variant="contained" disabled={!faqFormData.question.trim() || !faqFormData.answer.trim()}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField fullWidth label="Name" value={categoryFormData.name} onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })} required />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained" disabled={!categoryFormData.name.trim()}>{selectedCategory ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={faqDeleteDialogOpen} onClose={() => setFaqDeleteDialogOpen(false)}>
        <DialogTitle>Delete FAQ?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this FAQ?</Typography>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium' }}>{selectedFAQ?.question}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFaqDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteFAQ} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={categoryDeleteDialogOpen} onClose={() => setCategoryDeleteDialogOpen(false)}>
        <DialogTitle>Delete Category?</DialogTitle>
        <DialogContent>
          {selectedCategory && getFAQCount(selectedCategory.id) > 0 ? (
            <Typography>This category contains {getFAQCount(selectedCategory.id)} FAQ(s). Please reassign or delete them first.</Typography>
          ) : (
            <Typography>Are you sure you want to deactivate "{selectedCategory?.name}"? It will no longer be visible to users.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteCategory} variant="contained" color="error" disabled={selectedCategory ? getFAQCount(selectedCategory.id) > 0 : false}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default FAQManagementPage;
