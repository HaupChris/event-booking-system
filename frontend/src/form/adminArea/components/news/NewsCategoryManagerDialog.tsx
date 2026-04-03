import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { NewsCategory } from '../../../../services/adminNewsService';
import {
  DEFAULT_NEWS_ICON_KEY,
  getNewsCategoryIconFromKey,
  NEWS_ICON_OPTIONS,
} from '../../../../utils/newsCategoryIcons';

interface NewsCategoryManagerDialogProps {
  open: boolean;
  categories: NewsCategory[];
  loading: boolean;
  newCategoryKey: string;
  newCategoryLabel: string;
  newCategoryIcon: string;
  onClose: () => void;
  onChangeKey: (value: string) => void;
  onChangeLabel: (value: string) => void;
  onChangeIcon: (value: string) => void;
  onCreateCategory: () => void;
  onDeactivateCategory: (category: NewsCategory) => void;
}

function NewsCategoryManagerDialog({
  open,
  categories,
  loading,
  newCategoryKey,
  newCategoryLabel,
  newCategoryIcon,
  onClose,
  onChangeKey,
  onChangeLabel,
  onChangeIcon,
  onCreateCategory,
  onDeactivateCategory,
}: NewsCategoryManagerDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>News-Kategorien verwalten</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Alert severity="info">
            Kategorien steuern Filter und Darstellung im Newsfeed. Das Icon wird sowohl im Admin
            Preview als auch bei Usern verwendet.
          </Alert>

          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Neue Kategorie anlegen
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
              <TextField
                label="Kategorie-Key"
                value={newCategoryKey}
                onChange={(event) => onChangeKey(event.target.value)}
                placeholder="z.B. sicherheit"
                helperText="Kleinbuchstaben, Bindestrich oder Unterstrich"
                fullWidth
              />
              <TextField
                label="Anzeigename"
                value={newCategoryLabel}
                onChange={(event) => onChangeLabel(event.target.value)}
                placeholder="z.B. Sicherheit"
                fullWidth
              />
              <TextField
                select
                label="Icon"
                value={newCategoryIcon || DEFAULT_NEWS_ICON_KEY}
                onChange={(event) => onChangeIcon(String(event.target.value))}
                fullWidth
              >
                {NEWS_ICON_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getNewsCategoryIconFromKey(option.value, { fontSize: 'small' })}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={onCreateCategory} disabled={loading}>
                Kategorie erstellen
              </Button>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.25 }}>
              Aktive Kategorien
            </Typography>
            <Stack spacing={1}>
              {categories.map((category) => (
                <Box
                  key={category.id}
                  sx={{
                    p: 1.25,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getNewsCategoryIconFromKey(category.icon, { fontSize: 'small' })}
                    <Typography variant="body2" fontWeight={600}>
                      {category.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({category.category_key})
                    </Typography>
                  </Box>
                  <Tooltip title="Kategorie deaktivieren">
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDeactivateCategory(category)}
                        disabled={loading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Schliessen</Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewsCategoryManagerDialog;
