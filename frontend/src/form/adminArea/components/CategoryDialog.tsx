import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';
import type { FAQCategory, CreateFAQCategoryRequest } from '../../../services/adminFaqService';

interface CategoryDialogProps {
  open: boolean;
  selectedCategory: FAQCategory | null;
  categoryFormData: CreateFAQCategoryRequest;
  onClose: () => void;
  onSave: () => void;
  onChange: (data: CreateFAQCategoryRequest) => void;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({ open, selectedCategory, categoryFormData, onClose, onSave, onChange }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{selectedCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField fullWidth label="Name" value={categoryFormData.name} onChange={(e) => onChange({ ...categoryFormData, name: e.target.value })} required />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" disabled={!categoryFormData.name.trim()}>{selectedCategory ? 'Update' : 'Create'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryDialog;
