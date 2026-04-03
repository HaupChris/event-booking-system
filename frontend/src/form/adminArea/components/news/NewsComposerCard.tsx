import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CategoryIcon from '@mui/icons-material/Category';
import type { CreateNewsRequest, NewsCategory } from '../../../../services/adminNewsService';

interface NewsComposerCardProps {
  formData: CreateNewsRequest;
  categories: NewsCategory[];
  isEditing: boolean;
  saving: boolean;
  onChangeForm: (next: CreateNewsRequest) => void;
  onSubmit: () => void;
  onReset: () => void;
  onOpenCategoryManager: () => void;
}

function NewsComposerCard({
  formData,
  categories,
  isEditing,
  saving,
  onChangeForm,
  onSubmit,
  onReset,
  onOpenCategoryManager,
}: NewsComposerCardProps) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {isEditing ? 'News bearbeiten' : 'Neue News verfassen'}
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Titel"
            value={formData.title}
            onChange={(event) => onChangeForm({ ...formData, title: event.target.value })}
            fullWidth
            required
          />

          <TextField
            select
            label="Kategorie"
            value={formData.category || 'general'}
            onChange={(event) =>
              onChangeForm({ ...formData, category: String(event.target.value) })
            }
            fullWidth
            disabled={categories.length === 0}
          >
            {categories.length === 0 && (
              <MenuItem value="general">Kategorien werden geladen...</MenuItem>
            )}
            {categories.map((category) => (
              <MenuItem key={category.category_key} value={category.category_key}>
                {category.label}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CategoryIcon />}
              onClick={onOpenCategoryManager}
              disabled={saving}
            >
              Kategorien verwalten
            </Button>
          </Box>

          <TextField
            label="Inhalt"
            value={formData.content}
            onChange={(event) => onChangeForm({ ...formData, content: event.target.value })}
            multiline
            rows={10}
            InputProps={{ inputComponent: 'textarea' }}
            fullWidth
            required
            placeholder="Schreibe hier die News fuer alle Teilnehmenden..."
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              startIcon={isEditing ? <EditIcon /> : <AddIcon />}
              onClick={onSubmit}
              disabled={saving || !formData.title?.trim() || !formData.content?.trim()}
              fullWidth
            >
              {isEditing ? 'Aenderungen speichern' : 'News veroeffentlichen'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={onReset}
              disabled={saving}
              fullWidth
            >
              Zuruecksetzen
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default NewsComposerCard;
