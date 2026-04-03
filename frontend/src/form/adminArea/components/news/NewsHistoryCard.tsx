import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { NewsCategory, NewsItem } from '../../../../services/adminNewsService';
import { formatDate, getCategoryLabel, getSnippet } from './newsManagement.utils';
import { getNewsCategoryIconFromKey } from '../../../../utils/newsCategoryIcons';

interface NewsHistoryCardProps {
  news: NewsItem[];
  categories: NewsCategory[];
  activeCount: number;
  categoryFilter: string;
  statusFilter: 'all' | 'active' | 'inactive';
  loading: boolean;
  saving: boolean;
  onChangeCategoryFilter: (value: string) => void;
  onChangeStatusFilter: (value: 'all' | 'active' | 'inactive') => void;
  onEdit: (item: NewsItem) => void;
  onDeactivate: (item: NewsItem) => void;
}

function NewsHistoryCard({
  news,
  categories,
  activeCount,
  categoryFilter,
  statusFilter,
  loading,
  saving,
  onChangeCategoryFilter,
  onChangeStatusFilter,
  onEdit,
  onDeactivate,
}: NewsHistoryCardProps) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <Typography variant="h6">News-Verlauf</Typography>
          <Chip
            icon={<CampaignIcon />}
            label={`${activeCount} aktiv / ${news.length} gesamt`}
            color="primary"
            variant="outlined"
          />
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            select
            label="Kategorie"
            value={categoryFilter}
            onChange={(event) => onChangeCategoryFilter(String(event.target.value))}
            fullWidth
          >
            <MenuItem value="all">Alle Kategorien</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.category_key} value={category.category_key}>
                {category.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(event) =>
              onChangeStatusFilter(event.target.value as 'all' | 'active' | 'inactive')
            }
            fullWidth
          >
            <MenuItem value="all">Alle</MenuItem>
            <MenuItem value="active">Aktiv</MenuItem>
            <MenuItem value="inactive">Inaktiv</MenuItem>
          </TextField>
        </Stack>

        {loading && news.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            News werden geladen...
          </Typography>
        ) : null}

        {!loading && news.length === 0 ? (
          <Alert severity="info">Fuer den gewaelten Filter wurden keine News gefunden.</Alert>
        ) : null}

        <Stack spacing={1.25}>
          {news.map((item) => (
            <Card key={item.id} variant="outlined" sx={{ borderRadius: 1.5 }}>
              <CardContent
                sx={{ p: { xs: 1.75, sm: 2 }, '&:last-child': { pb: { xs: 1.75, sm: 2 } } }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.published_date)}
                      {item.author ? ` - von ${item.author}` : ''}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon fontSize="small" />}
                      onClick={() => onEdit(item)}
                      disabled={saving}
                    >
                      Bearbeiten
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon fontSize="small" />}
                      onClick={() => onDeactivate(item)}
                      disabled={saving || !item.is_active}
                    >
                      Deaktivieren
                    </Button>
                  </Stack>
                </Box>

                <Stack direction="row" spacing={0.75} sx={{ mb: 1 }}>
                  <Chip
                    icon={getNewsCategoryIconFromKey(
                      item.category_icon || item.category || 'general',
                      {
                        fontSize: 'small',
                      }
                    )}
                    label={item.category_label || getCategoryLabel(item.category)}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={item.is_active ? 'Aktiv' : 'Inaktiv'}
                    size="small"
                    color={item.is_active ? 'success' : 'default'}
                  />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  {getSnippet(item.content)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default NewsHistoryCard;
