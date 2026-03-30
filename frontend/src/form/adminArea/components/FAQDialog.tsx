import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import type { FAQ, FAQCategory, CreateFAQRequest } from '../../../services/adminFaqService';

interface FAQDialogProps {
  open: boolean;
  selectedFAQ: FAQ | null;
  faqFormData: CreateFAQRequest;
  categories: FAQCategory[];
  onClose: () => void;
  onSave: () => void;
  onChange: (data: CreateFAQRequest) => void;
}

const FAQDialog: React.FC<FAQDialogProps> = ({
  open,
  selectedFAQ,
  faqFormData,
  categories,
  onClose,
  onSave,
  onChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{selectedFAQ ? 'Edit FAQ' : 'Create FAQ'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Question"
            value={faqFormData.question}
            onChange={(e) => onChange({ ...faqFormData, question: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Answer"
            value={faqFormData.answer}
            onChange={(e) => onChange({ ...faqFormData, answer: e.target.value })}
            multiline
            rows={4}
            InputProps={{ inputComponent: 'textarea' }}
            required
          />
          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              value={faqFormData.category_id}
              onChange={(e) => onChange({ ...faqFormData, category_id: Number(e.target.value) })}
              label="Category"
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Display Order"
            type="number"
            value={faqFormData.display_order}
            onChange={(e) => onChange({ ...faqFormData, display_order: Number(e.target.value) })}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={!faqFormData.question.trim() || !faqFormData.answer.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FAQDialog;
