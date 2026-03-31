import React from 'react';
import {
  ArrowDownward,
  ArrowUpward,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { FAQCategory } from '../../../services/adminFaqService';

interface FAQCategoryTabProps {
  categories: FAQCategory[];
  getFAQCount: (categoryId: number) => number;
  onCreateCategory: () => void;
  onEditCategory: (category: FAQCategory) => void;
  onDeleteCategory: (category: FAQCategory) => void;
  onMoveCategory: (category: FAQCategory, direction: 'up' | 'down') => void;
}

const FAQCategoryTab: React.FC<FAQCategoryTabProps> = ({
  categories,
  getFAQCount,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onMoveCategory,
}) => (
  <>
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateCategory}>
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
          {categories.map((category, index) => (
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
                    onClick={() => onMoveCategory(category, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUpward fontSize="small" />
                  </IconButton>
                  <Typography variant="body2">{category.display_order}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => onMoveCategory(category, 'down')}
                    disabled={index === categories.length - 1}
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
                <IconButton size="small" onClick={() => onEditCategory(category)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => onDeleteCategory(category)}>
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

export default FAQCategoryTab;
