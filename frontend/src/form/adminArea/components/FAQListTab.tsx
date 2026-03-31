import React from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import type { FAQ, FAQCategory } from '../../../services/adminFaqService';

interface FAQListTabProps {
  selectedCategoryFilter: number | 'all';
  categories: FAQCategory[];
  filteredFAQs: FAQ[];
  onFilterChange: (value: number | 'all') => void;
  getCategoryName: (id: number) => string;
  truncate: (text: string, max: number) => string;
  onCreateFAQ: () => void;
  onEditFAQ: (faq: FAQ) => void;
  onDeleteFAQ: (faq: FAQ) => void;
}

const FAQListTab: React.FC<FAQListTabProps> = ({
  selectedCategoryFilter,
  categories,
  filteredFAQs,
  onFilterChange,
  getCategoryName,
  truncate,
  onCreateFAQ,
  onEditFAQ,
  onDeleteFAQ,
}) => (
  <>
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Category Filter</InputLabel>
        <Select
          value={selectedCategoryFilter}
          onChange={(event) =>
            onFilterChange(event.target.value === 'all' ? 'all' : Number(event.target.value))
          }
          label="Category Filter"
        >
          <MenuItem value="all">All Categories</MenuItem>
          {categories
            .filter((category) => category.is_active)
            .map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateFAQ}>
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
                <IconButton size="small" onClick={() => onEditFAQ(faq)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => onDeleteFAQ(faq)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </>
);

export default FAQListTab;
