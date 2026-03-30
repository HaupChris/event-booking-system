import React, { useState, useContext } from 'react';
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
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { TokenContext } from '../../contexts/AuthContext';
import type { FAQ, FAQCategory } from '../../services/adminFaqService';
import FAQDialog from './components/FAQDialog';
import CategoryDialog from './components/CategoryDialog';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import { useFAQManagement } from './hooks/useFAQManagement';

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

  const filteredFAQs =
    selectedCategoryFilter === 'all'
      ? faqs
      : faqs.filter((f) => f.category_id === selectedCategoryFilter);
  const getCategoryName = (id: number) => categories.find((c) => c.id === id)?.name || 'Unknown';
  const getFAQCount = (categoryId: number) =>
    faqs.filter((f) => f.category_id === categoryId).length;
  const truncate = (text: string, max: number) =>
    text.length > max ? text.substring(0, max) + '...' : text;

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

  const onSaveFAQ = async () => {
    const success = await handleSaveFAQ();
    if (success) setFaqDialogOpen(false);
  };

  const onDeleteFAQ = async () => {
    if (!selectedFAQ) return;
    const success = await handleDeleteFAQ(selectedFAQ.id);
    if (success) setFaqDeleteDialogOpen(false);
  };

  const onSaveCategory = async () => {
    const success = await handleSaveCategory();
    if (success) setCategoryDialogOpen(false);
  };

  const onDeleteCategory = async () => {
    if (!selectedCategory) return;
    const success = await handleDeleteCategory(selectedCategory.id);
    if (success) setCategoryDeleteDialogOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

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
        <>
          <Box
            sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Category Filter</InputLabel>
              <Select
                value={selectedCategoryFilter}
                onChange={(e) =>
                  setSelectedCategoryFilter(
                    e.target.value === 'all' ? 'all' : Number(e.target.value)
                  )
                }
                label="Category Filter"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories
                  .filter((c) => c.is_active)
                  .map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateFAQDialog}>
              Create FAQ
            </Button>
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
                    <TableCell>
                      <Typography variant="body2">{truncate(faq.question, 60)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{truncate(faq.answer, 60)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={getCategoryName(faq.category_id)} size="small" color="primary" />
                    </TableCell>
                    <TableCell>{faq.display_order}</TableCell>
                    <TableCell>
                      <Chip
                        label={faq.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={faq.is_active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenEditFAQDialog(faq)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedFAQ(faq);
                          setFaqDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
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
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateCategoryDialog}
            >
              Create Category
            </Button>
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
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {category.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveCategory(category, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUpward fontSize="small" />
                        </IconButton>
                        <Typography variant="body2">{category.display_order}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveCategory(category, 'down')}
                          disabled={index === sortedCategories.length - 1}
                        >
                          <ArrowDownward fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>{getFAQCount(category.id)}</TableCell>
                    <TableCell>
                      <Chip
                        label={category.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={category.is_active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditCategoryDialog(category)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedCategory(category);
                          setCategoryDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
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
          selectedCategory && getFAQCount(selectedCategory.id) > 0
            ? `This category contains ${getFAQCount(selectedCategory.id)} FAQ(s). Please reassign or delete them first.`
            : `Are you sure you want to deactivate "${selectedCategory?.name}"? It will no longer be visible to users.`
        }
        onClose={() => setCategoryDeleteDialogOpen(false)}
        onConfirm={onDeleteCategory}
        disabled={selectedCategory ? getFAQCount(selectedCategory.id) > 0 : false}
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
